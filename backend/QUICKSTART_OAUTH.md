# Quick Start Guide: OAuth Integration

This guide shows you how to quickly set up and use the Authorization Code Grant OAuth flow.

## Setup (5 minutes)

### 1. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Shopify credentials:

```env
# Your Shopify app credentials from Partner Dashboard
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com

# OAuth Configuration
SHOPIFY_REDIRECT_URI=https://your-backend-url.com/api/auth/callback
SHOPIFY_SCOPES=read_customers,write_customers,read_products,write_customer_metafields,read_customer_metafields
APPLICATION_URL=https://your-backend-url.com

# Generate a secure random string for session secret
SESSION_SECRET=$(openssl rand -base64 32)
```

### 2. Add Redirect URI to Shopify Partner Dashboard

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Select your app
3. Navigate to "App setup" → "URLs"
4. Add your callback URL to "Allowed redirection URL(s)":
   ```
   https://your-backend-url.com/api/auth/callback
   ```

### 3. Test the Implementation

```bash
# Run the test suite
node test-oauth-flow.js

# Start the server
npm run dev
```

## Using the OAuth Flow

### Installation URL

Direct users to this URL to install your app:

```
https://your-backend-url.com/api/auth/shopify?shop={shop-name}.myshopify.com
```

Example:
```
https://your-backend-url.com/api/auth/shopify?shop=example.myshopify.com
```

### Testing Locally

For local development:

1. Start the server:
   ```bash
   npm run dev
   ```

2. Visit the installation URL in your browser:
   ```
   http://localhost:3000/api/auth/shopify?shop=your-store.myshopify.com
   ```

3. You'll be redirected to Shopify's authorization page
4. After approving, you'll be redirected back to your app
5. The access token is automatically stored

### Checking Authentication Status

```bash
curl http://localhost:3000/api/auth/verify?shop=your-store.myshopify.com
```

Response:
```json
{
  "success": true,
  "authenticated": true,
  "shop": "your-store.myshopify.com",
  "scope": "read_customers,write_customers,...",
  "installedAt": "2024-01-01T00:00:00.000Z"
}
```

## Using Authenticated Sessions in Your Code

### Option 1: Use the Middleware

```javascript
const shopifyAuthMiddleware = require('./middleware/shopifyAuth');

router.get('/api/some-endpoint', shopifyAuthMiddleware, async (req, res) => {
  // Session is automatically loaded
  const { shop, accessToken, scope } = req.shopifySession;
  
  // Use with Shopify service
  const result = await shopifyService.getCustomerMetafield(
    customerId,
    namespace,
    key,
    req.shopifySession
  );
  
  res.json(result);
});
```

### Option 2: Load Session Manually

```javascript
const sessionStorage = require('./services/sessionStorage');

async function myFunction(shop) {
  const session = await sessionStorage.getSession(shop);
  
  if (!session) {
    throw new Error('Shop not authenticated');
  }
  
  // Use the session
  const result = await shopifyService.someMethod(session);
  return result;
}
```

## Common Use Cases

### 1. Making Shopify API Calls

```javascript
const shopifyService = require('./services/shopifyService');
const sessionStorage = require('./services/sessionStorage');

async function getCustomerWishlist(shop, customerId) {
  // Load the stored session
  const session = await sessionStorage.getSession(shop);
  
  if (!session) {
    throw new Error('Shop not authenticated. Please install the app.');
  }
  
  // Make authenticated API call
  const wishlist = await shopifyService.getCustomerMetafield(
    customerId,
    'app',
    'wishlist',
    session  // Pass the session object
  );
  
  return wishlist;
}
```

### 2. Webhook Handler with Auto-Auth

```javascript
router.post('/api/webhooks/customers/create', async (req, res) => {
  const shop = req.get('X-Shopify-Shop-Domain');
  
  // Session is automatically available for the shop
  const session = await sessionStorage.getSession(shop);
  
  if (session) {
    // Process webhook with authenticated session
    await processCustomerCreation(req.body, session);
  }
  
  res.status(200).send('OK');
});
```

### 3. Scheduled Jobs

```javascript
const sessionStorage = require('./services/sessionStorage');

async function dailySyncJob() {
  // Get all authenticated shops
  const allSessions = await sessionStorage.getAllSessions();
  
  for (const [shop, session] of Object.entries(allSessions)) {
    try {
      console.log(`Syncing data for ${shop}...`);
      await syncShopData(shop, session);
    } catch (error) {
      console.error(`Failed to sync ${shop}:`, error);
    }
  }
}
```

## Troubleshooting

### Issue: "Invalid HMAC" error

**Solution:** 
- Verify `SHOPIFY_API_SECRET` in .env is correct
- Check for whitespace in environment variables
- Ensure the request hasn't been modified

### Issue: "Invalid state parameter" error

**Solution:**
- Check that `SESSION_SECRET` is set
- Verify cookies are enabled in browser
- Ensure OAuth flow completes within 10 minutes

### Issue: Access token not found

**Solution:**
```bash
# Check stored sessions
cat backend/.sessions/sessions.json

# Verify shop format (must end with .myshopify.com)
# Re-install the app if needed
```

### Issue: "Shop not authenticated" error

**Solution:**
- The shop needs to go through the OAuth flow first
- Direct users to the installation URL
- Check if the session was stored successfully

## Security Best Practices

1. **Never commit `.env` or `.sessions/`** - These contain sensitive data
2. **Use HTTPS in production** - Set `NODE_ENV=production`
3. **Rotate secrets regularly** - Update `SESSION_SECRET` periodically
4. **Monitor logs** - Watch for repeated authentication failures
5. **Implement rate limiting** - Prevent brute force attacks

## Production Deployment

### 1. Update Environment Variables

```env
NODE_ENV=production
SHOPIFY_REDIRECT_URI=https://your-production-domain.com/api/auth/callback
APPLICATION_URL=https://your-production-domain.com
SESSION_SECRET=<generate-new-secure-secret>
```

### 2. Update Shopify Partner Dashboard

Add production redirect URI to allowed URLs.

### 3. Deploy

```bash
# Build and start
npm start

# Or with PM2
pm2 start src/server.js --name earlyaccess-backend
```

### 4. Verify

```bash
# Check health
curl https://your-production-domain.com/api/health

# Test OAuth flow
# Visit: https://your-production-domain.com/api/auth/shopify?shop=test-store.myshopify.com
```

## Need Help?

- Review [OAUTH_IMPLEMENTATION.md](./OAUTH_IMPLEMENTATION.md) for detailed documentation
- Check logs for error details
- Run `node test-oauth-flow.js` to verify setup
- See [Shopify OAuth docs](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/authorization-code-grant)
