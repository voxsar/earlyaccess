# Migration Guide: Static Tokens to OAuth

This guide helps you migrate from static access tokens to the new Authorization Code Grant OAuth flow.

## Why Migrate?

The new OAuth implementation provides:

✅ **Better Security** - HMAC verification, nonce validation, and secure token storage  
✅ **Multi-Store Support** - Automatically manages tokens for multiple shops  
✅ **Automatic Token Management** - No manual token generation needed  
✅ **Production Ready** - Follows Shopify's best practices and security guidelines  
✅ **Scalability** - Easy to add new shops without manual configuration  

## Current Setup (Old Method)

You're currently using:
- Static `SHOPIFY_ACCESS_TOKEN` in `.env`
- Manual token generation from Shopify Admin or Partner Dashboard
- Single shop support only

## New Setup (OAuth Method)

The new system uses:
- Dynamic access tokens obtained through OAuth
- Automatic token storage per shop
- Support for multiple shops simultaneously

## Migration Steps

### Step 1: Backup Current Configuration

```bash
# Backup your current .env file
cp backend/.env backend/.env.backup
```

### Step 2: Update Environment Variables

Add these new variables to `backend/.env`:

```env
# Add these new OAuth variables
SHOPIFY_REDIRECT_URI=https://your-backend-url.com/api/auth/callback
SHOPIFY_SCOPES=read_customers,write_customers,read_products,write_customer_metafields,read_customer_metafields
APPLICATION_URL=https://your-backend-url.com

# Add session secret if not already present
SESSION_SECRET=your_secure_random_secret_here

# Keep your existing variables:
# SHOPIFY_API_KEY, SHOPIFY_API_SECRET, etc.
```

Generate a secure random secret:
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 3: Update Dependencies

```bash
cd backend
npm install
```

This installs the new `cookie-parser` dependency.

### Step 4: Update Shopify Partner Dashboard

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Select your app
3. Navigate to "App setup" → "URLs"
4. Add your callback URL to "Allowed redirection URL(s)":
   ```
   https://your-backend-url.com/api/auth/callback
   ```

### Step 5: Test the OAuth Flow

```bash
# Test the implementation
node backend/test-oauth-flow.js

# Start the server
cd backend
npm run dev
```

### Step 6: Re-authenticate Your Shop

Visit the OAuth installation URL in your browser:

```
https://your-backend-url.com/api/auth/shopify?shop=your-store.myshopify.com
```

Follow the OAuth flow to grant permissions.

### Step 7: Verify Authentication

Check that the OAuth token was stored:

```bash
# Check the session storage
cat backend/.sessions/sessions.json

# Or use the API
curl http://localhost:3000/api/auth/verify?shop=your-store.myshopify.com
```

Expected response:
```json
{
  "success": true,
  "authenticated": true,
  "shop": "your-store.myshopify.com",
  "scope": "read_customers,write_customers,...",
  "installedAt": "2024-01-01T00:00:00.000Z"
}
```

### Step 8: Update Your Code (If Using Static Tokens)

If you have code that manually uses `SHOPIFY_ACCESS_TOKEN`, update it to use the session storage:

**Before:**
```javascript
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
// Use static token
```

**After:**
```javascript
const sessionStorage = require('./services/sessionStorage');

const session = await sessionStorage.getSession(shop);
const accessToken = session.accessToken;
// Use dynamic token from storage
```

Or use the middleware:
```javascript
const shopifyAuthMiddleware = require('./middleware/shopifyAuth');

router.get('/api/endpoint', shopifyAuthMiddleware, async (req, res) => {
  // req.shopifySession contains shop, accessToken, scope
});
```

### Step 9: Deploy to Production

1. Update production environment variables
2. Add production redirect URI to Partner Dashboard
3. Deploy the updated code
4. Re-authenticate through OAuth

## Backwards Compatibility

The new implementation is **backwards compatible**:

- ✅ Static tokens still work in development
- ✅ Existing API endpoints unchanged
- ✅ No breaking changes to frontend code

The `SHOPIFY_ACCESS_TOKEN` environment variable is still used as a fallback when no OAuth session exists.

## Gradual Migration

You can migrate gradually:

1. **Phase 1**: Deploy OAuth code (no changes to existing functionality)
2. **Phase 2**: Test OAuth with a development store
3. **Phase 3**: Migrate production stores to OAuth
4. **Phase 4**: Remove static token fallback (optional)

## Testing Migration

### Test Checklist

- [ ] OAuth installation URL works
- [ ] HMAC verification passes
- [ ] Access token is stored in `.sessions/`
- [ ] Verify endpoint returns authenticated status
- [ ] Wishlist API calls work with new tokens
- [ ] Frontend can still access backend API

### Common Issues

#### Issue: "Invalid HMAC" on callback

**Solution:** Verify `SHOPIFY_API_SECRET` is correct and hasn't changed.

#### Issue: Can't access stored sessions

**Solution:** Check file permissions on `backend/.sessions/` directory.

#### Issue: Frontend can't connect

**Solution:** Ensure CORS settings allow your frontend origin.

## Rollback Plan

If you need to rollback:

1. Restore your backup:
   ```bash
   cp backend/.env.backup backend/.env
   ```

2. Restart the server:
   ```bash
   npm start
   ```

The static token authentication will work as before.

## Multi-Store Support

With OAuth, you can now support multiple stores:

```javascript
// Each store has its own session
const store1Session = await sessionStorage.getSession('store1.myshopify.com');
const store2Session = await sessionStorage.getSession('store2.myshopify.com');

// Get all authenticated stores
const allSessions = await sessionStorage.getAllSessions();
for (const [shop, session] of Object.entries(allSessions)) {
  console.log(`${shop} is authenticated`);
}
```

## Security Improvements

After migration, you get:

| Feature | Old Method | New Method |
|---------|-----------|------------|
| HMAC Verification | ❌ No | ✅ Yes |
| Nonce Validation | ❌ No | ✅ Yes |
| Shop Validation | ❌ Basic | ✅ Regex-based |
| Token Storage | ❌ .env only | ✅ Persistent file-based |
| Multi-Store | ❌ No | ✅ Yes |
| Scope Verification | ❌ No | ✅ Yes |
| CSRF Protection | ❌ No | ✅ Yes |

## Support

If you encounter issues during migration:

1. Check [OAUTH_IMPLEMENTATION.md](./OAUTH_IMPLEMENTATION.md) for technical details
2. Review [QUICKSTART_OAUTH.md](./QUICKSTART_OAUTH.md) for setup instructions
3. Run `node test-oauth-flow.js` to verify your setup
4. Check server logs for error details

## FAQ

### Q: Do I need to remove my static access token?

**A:** No, you can keep it as a fallback. The OAuth tokens will be used when available.

### Q: Will my frontend need changes?

**A:** No, the backend API endpoints remain the same. The authentication happens server-side.

### Q: How do I add a new store?

**A:** Just send them to the OAuth URL with their shop domain:
```
https://your-backend-url.com/api/auth/shopify?shop=new-store.myshopify.com
```

### Q: What happens if the token expires?

**A:** Offline tokens (which we use) don't expire unless the app is uninstalled. If that happens, the shop will need to re-authenticate through OAuth.

### Q: Can I migrate without downtime?

**A:** Yes! Deploy the new code, then gradually migrate shops. The static token will work until OAuth is set up.

### Q: How do I uninstall a shop?

**A:** Call the uninstall endpoint or manually delete from `.sessions/sessions.json`:
```bash
curl -X POST http://localhost:3000/api/auth/uninstall \
  -H "Content-Type: application/json" \
  -d '{"shop":"store.myshopify.com"}'
```

## Next Steps

After successful migration:

1. ✅ Update your deployment documentation
2. ✅ Train team members on OAuth flow
3. ✅ Set up monitoring for failed authentications
4. ✅ Consider implementing automatic token refresh (for online tokens)
5. ✅ Add rate limiting to OAuth endpoints
