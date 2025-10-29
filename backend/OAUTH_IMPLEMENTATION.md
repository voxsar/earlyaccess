# Authorization Code Grant OAuth Implementation

This document describes the implementation of Shopify's Authorization Code Grant OAuth flow in the backend API.

## Overview

The authorization code grant flow has been implemented following Shopify's official documentation to enable secure authentication and authorization for the Early Access + Wishlist app. This allows the backend to store data in customer metafields and access Shopify's Admin API.

## Implementation Details

### Security Features

1. **HMAC Verification** (Step 1)
   - All requests from Shopify are verified using HMAC-SHA256
   - Uses constant-time comparison to prevent timing attacks
   - Validates both installation requests and OAuth callbacks

2. **State Parameter (Nonce) Validation** (Step 2)
   - Generates cryptographically secure random nonce
   - Stored in both session and signed cookie
   - Verified during callback to prevent CSRF attacks

3. **Shop Hostname Validation** (Step 3)
   - Validates shop hostnames using regex pattern
   - Ensures shop ends with `.myshopify.com`
   - Prevents path traversal and injection attacks

4. **Scope Verification** (Step 4)
   - Confirms all requested scopes were granted
   - Handles implied read scopes from write scopes
   - Warns about missing scopes

### Session Storage

Access tokens are stored persistently using a file-based storage system (`sessionStorage.js`):

- **Location**: `backend/.sessions/sessions.json`
- **Format**: JSON object with shop domain as key
- **Data Stored**:
  - `accessToken`: Offline access token for API calls
  - `scope`: Granted scopes
  - `shop`: Shop domain
  - `installedAt`: Installation timestamp
  - `updatedAt`: Last update timestamp

### API Endpoints

#### 1. Initiate OAuth Flow

```
GET /api/auth/shopify?shop={shop}&hmac={hmac}&timestamp={timestamp}
```

**Parameters:**
- `shop` (required): Shop domain (e.g., "example.myshopify.com")
- `hmac` (optional): HMAC signature for verification
- `timestamp` (optional): Request timestamp

**Flow:**
1. Validates shop hostname
2. Verifies HMAC if present
3. Generates secure nonce
4. Stores nonce in session and signed cookie
5. Redirects to Shopify authorization URL

**Authorization URL Format:**
```
https://{shop}/admin/oauth/authorize?
  client_id={api_key}&
  scope={scopes}&
  redirect_uri={redirect_uri}&
  state={nonce}&
  grant_options[]=offline
```

#### 2. OAuth Callback

```
GET /api/auth/callback?code={code}&state={state}&shop={shop}&hmac={hmac}
```

**Security Checks:**
1. Verifies state matches session nonce
2. Verifies state matches signed cookie nonce
3. Verifies HMAC signature
4. Validates shop hostname
5. Checks for required parameters

**Flow:**
1. Performs all security checks
2. Exchanges authorization code for access token
3. Verifies granted scopes
4. Stores access token persistently
5. Stores access token in session
6. Redirects to app URL

#### 3. Verify Authentication

```
GET /api/auth/verify?shop={shop}
```

**Response:**
```json
{
  "success": true,
  "authenticated": true,
  "shop": "example.myshopify.com",
  "scope": "read_customers,write_customers,...",
  "installedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 4. Uninstall

```
POST /api/auth/uninstall
Body: { "shop": "example.myshopify.com" }
```

Removes stored session and clears cookies.

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# OAuth Configuration
SHOPIFY_REDIRECT_URI=https://your-backend-url.com/api/auth/callback
SHOPIFY_SCOPES=read_customers,write_customers,read_products,write_customer_metafields,read_customer_metafields
APPLICATION_URL=https://your-backend-url.com

# Session Configuration
SESSION_SECRET=your_secure_random_secret_here
```

### Shopify Partner Dashboard

1. Go to your app settings in Partner Dashboard
2. Navigate to "App setup" → "URLs"
3. Add your redirect URI to "Allowed redirection URL(s)":
   ```
   https://your-backend-url.com/api/auth/callback
   ```

## Using the OAuth Flow

### Development Setup

1. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Test the OAuth flow:**
   ```bash
   node test-oauth-flow.js
   ```

### Installation Flow

1. **User initiates installation:**
   ```
   Visit: http://localhost:3000/api/auth/shopify?shop=your-store.myshopify.com
   ```

2. **Shopify authorization:**
   - User is redirected to Shopify
   - User sees permission grant screen
   - User approves permissions

3. **Callback processing:**
   - Shopify redirects back to callback URL
   - Backend performs security checks
   - Backend exchanges code for access token
   - Access token is stored persistently

4. **App usage:**
   - Backend can now make authenticated API calls
   - Access token is loaded from storage as needed

### Making Authenticated API Calls

Use the `shopifyAuthMiddleware` to automatically load sessions:

```javascript
const shopifyAuthMiddleware = require('./middleware/shopifyAuth');

router.get('/api/some-endpoint', shopifyAuthMiddleware, async (req, res) => {
  // req.shopifySession contains:
  // - shop
  // - accessToken
  // - scope
  
  // Use with shopifyService:
  const result = await shopifyService.someMethod(req.shopifySession);
});
```

## Security Considerations

1. **Never commit access tokens** - They're stored in `.sessions/` which is gitignored

2. **Use HTTPS in production** - Set `NODE_ENV=production` to enable secure cookies

3. **Rotate session secret** - Change `SESSION_SECRET` periodically

4. **Monitor failed authentication** - Check logs for repeated HMAC failures

5. **Implement rate limiting** - Add rate limiting to OAuth endpoints

## Testing

Run the test suite:

```bash
node backend/test-oauth-flow.js
```

Tests include:
- HMAC verification (valid and invalid)
- Shop hostname validation
- OAuth URL generation
- Session storage operations

## Troubleshooting

### "Invalid HMAC" errors

- Check that `SHOPIFY_API_SECRET` is correct
- Ensure no whitespace in environment variables
- Verify request parameters haven't been modified

### "Invalid state parameter" errors

- Check that cookies are enabled
- Verify `SESSION_SECRET` is set
- Ensure redirect doesn't take more than 10 minutes

### "Invalid shop hostname" errors

- Shop must end with `.myshopify.com`
- No protocol (http/https) in shop parameter
- Only letters, numbers, periods, and hyphens allowed

### Access token not persisting

- Check `.sessions/` directory exists and is writable
- Verify file permissions
- Check for errors in server logs

## Migration from Old Implementation

The previous implementation:
- ✅ Basic OAuth flow
- ❌ No HMAC verification
- ❌ Weak state validation
- ❌ No shop hostname validation
- ❌ In-memory session storage only

The new implementation:
- ✅ Full HMAC verification
- ✅ Secure nonce with signed cookies
- ✅ Regex-based shop validation
- ✅ Persistent session storage
- ✅ Scope verification
- ✅ All Shopify security best practices

## References

- [Shopify Authorization Code Grant Documentation](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/authorization-code-grant)
- [Shopify API Access Scopes](https://shopify.dev/docs/api/usage/access-scopes)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/rfc6819)
