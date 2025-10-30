# Security Recommendations

This document provides security recommendations for production deployments of the OAuth implementation.

## Rate Limiting (Important!)

### Issue

The OAuth endpoints (`/api/auth/shopify` and `/api/auth/callback`) are not rate-limited by default. This could allow:
- Denial of service attacks through repeated OAuth requests
- Brute force attempts on the OAuth flow
- Resource exhaustion

### Recommended Solution

Implement rate limiting using `express-rate-limit`:

```bash
npm install express-rate-limit
```

Add to `src/server.js`:

```javascript
const rateLimit = require('express-rate-limit');

// Rate limiter for OAuth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many OAuth requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to auth routes
app.use('/api/auth', authLimiter);
```

### Production Configuration

```javascript
// Stricter limits for production
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 10,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => {
    // Use shop domain as key instead of IP for multi-tenant apps
    return req.query.shop || req.ip;
  },
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for ${req.query.shop || req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again later.',
      },
    });
  },
});
```

## Additional Security Measures

### 1. Request Logging and Monitoring

Monitor for suspicious patterns:

```javascript
// In src/server.js
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      shop: req.query.shop,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }
  next();
});
```

### 2. Helmet for Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 3. Input Sanitization

Already implemented via `isValidShopHostname()` regex validation.

### 4. Secret Rotation

Regularly rotate your secrets:

```bash
# Generate new session secret
openssl rand -base64 32

# Update .env and restart server
```

### 5. Failed Authentication Monitoring

Track failed authentication attempts:

```javascript
// In src/routes/auth.js
const failedAttempts = new Map();

function trackFailedAuth(shop) {
  const count = (failedAttempts.get(shop) || 0) + 1;
  failedAttempts.set(shop, count);
  
  if (count > 5) {
    console.error(`⚠️  Multiple failed auth attempts for shop: ${shop}`);
    // Consider blocking or alerting
  }
}
```

### 6. HTTPS Enforcement

In production, ensure all traffic uses HTTPS:

```javascript
// Redirect HTTP to HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 7. Session Security

Already implemented:
- ✅ httpOnly cookies
- ✅ Secure cookies in production
- ✅ Signed cookies for nonce
- ✅ Session expiration

### 8. Error Handling

Avoid leaking sensitive information in errors:

```javascript
// In production, don't expose error details
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred. Please try again.',
      },
    });
  });
}
```

## Security Checklist for Production

- [ ] Rate limiting implemented on OAuth endpoints
- [ ] Helmet middleware added for security headers
- [ ] HTTPS enforced
- [ ] Error messages don't expose sensitive data
- [ ] Logging configured for security events
- [ ] Session secrets are strong and unique
- [ ] Secrets stored in environment variables (not in code)
- [ ] `.env` and `.sessions/` excluded from git
- [ ] CORS configured with specific origins (not `*`)
- [ ] Regular security updates (`npm audit`)
- [ ] Failed authentication monitoring
- [ ] Backup plan for session storage

## Monitoring and Alerts

Set up alerts for:

1. **High number of failed authentications**
   - Threshold: > 10 failures per shop per hour
   - Action: Alert ops team

2. **HMAC verification failures**
   - Threshold: > 5 per hour
   - Action: Investigate immediately

3. **Unusual OAuth patterns**
   - Multiple shops from same IP
   - OAuth requests outside business hours
   - Rapid successive requests

4. **Session storage errors**
   - Write failures
   - Disk space issues
   - Permission errors

## Incident Response

If you detect a security incident:

1. **Immediate Actions**
   - Enable rate limiting if not already active
   - Review logs for attack patterns
   - Block suspicious IPs at firewall level

2. **Investigation**
   - Check for compromised credentials
   - Review access token usage
   - Verify no unauthorized data access

3. **Recovery**
   - Rotate secrets if compromised
   - Invalidate affected sessions
   - Force re-authentication for affected shops

4. **Prevention**
   - Implement additional security measures
   - Update documentation
   - Review and update security practices

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Shopify Security Best Practices](https://shopify.dev/docs/apps/best-practices/security)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Staying Updated

Regularly run security audits:

```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically where possible
npm audit fix

# Update dependencies
npm update
```
