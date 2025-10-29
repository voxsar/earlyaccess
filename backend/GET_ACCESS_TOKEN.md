# How to Get Your Shopify Access Token

The 401 Unauthorized error indicates that your `SHOPIFY_ACCESS_TOKEN` is invalid. Here's how to get the correct access token:

## Authentication Methods Overview

Shopify provides different authentication methods depending on your app type:

- **Embedded Apps**: Should use **Token Exchange** with App Bridge session tokens
- **Non-Embedded Apps**: Should use **Authorization Code Grant** (OAuth flow)
- **Custom/Private Apps**: Use **Admin API Access Tokens** (what we're using for development)

## Option 1: Create a Private App (Recommended for Development)

1. **Go to your Shopify Admin Panel**
   - Visit: https://artslab-plugin-test.myshopify.com/admin

2. **Navigate to Apps**
   - Go to Settings → Apps and sales channels

3. **Create a Private App**
   - Click "Develop apps for your store"
   - Click "Create an app"
   - Give it a name like "Wishlist Backend API"

4. **Configure App Scopes**
   - Go to "Configuration" tab
   - Under "Admin API access scopes", enable:
     - `read_customers`
     - `write_customers` 
     - `read_products`
     - `read_customer_metafields`
     - `write_customer_metafields`

5. **Install the App**
   - Click "Create app"
   - Click "Install app"

6. **Get Your Access Token**
   - After installation, you'll see the "Admin API access token"
   - Copy this token and update your `.env` file

## Option 2: Token Exchange (For Embedded Apps)

**Token Exchange** is the recommended method for embedded apps:
- Uses OAuth 2.0 token exchange to swap session tokens for access tokens
- Session tokens are acquired using App Bridge
- Shopify CLI can generate starter apps with this authentication built-in

```bash
shopify app generate
```

## Option 3: Authorization Code Grant (For Non-Embedded Apps)

**Authorization Code Grant** uses OAuth 2.0 flow:
1. User requests to install the app
2. App redirects to Shopify grant screen 
3. User authorizes requested scopes
4. App receives authorization grant
5. App exchanges grant for access token
6. App uses access token for API requests

For existing apps, use Shopify Admin API libraries that provide OAuth methods.

## Update Your .env File

Replace the current `SHOPIFY_ACCESS_TOKEN` with your new token:
```env
SHOPIFY_ACCESS_TOKEN=shpat_your_actual_access_token_here
```

## Verify the Token Format

Valid Shopify access tokens start with:
- `shpat_` for Admin API tokens
- `shpss_` for Storefront API tokens

Your current token looks like an API key, not an access token.

## After Getting the Token

1. Update your `.env` file with the correct access token
2. Restart your backend server: `pm2 restart earlyaccess-backend`
3. Test the connection again: `node test-connection.js`