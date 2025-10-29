# Early Access Backend API

Backend API server for the Early Access + Wishlist Shopify App. This server handles all wishlist operations and acts as a proxy to Shopify's GraphQL APIs.

## Features

- **OAuth Authentication**: Full Authorization Code Grant implementation with HMAC verification
- **Wishlist Management**: Add, remove, and retrieve wishlist items
- **Shopify Integration**: Seamless integration with Shopify Admin API
- **Customer Metafields**: Persistent storage using Shopify customer metafields
- **Session Management**: Secure persistent storage of access tokens
- **RESTful API**: Clean REST endpoints for frontend integration
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Configurable CORS for cross-origin requests

## Architecture

```
Frontend (Shopify Extensions)
         ↓
Backend API (This Server)
         ↓
Shopify Admin GraphQL API
         ↓
Customer Metafields
```

## Quick Start

See [QUICKSTART_OAUTH.md](./QUICKSTART_OAUTH.md) for a quick setup guide.

## Installation

### Prerequisites

- Node.js 18+ and npm
- Shopify Partner account
- Shopify store with app installed
- Shopify API credentials

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   ```
   PORT=3000
   NODE_ENV=development
   
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your_access_token
   SHOPIFY_API_VERSION=2025-10
   
   # OAuth Configuration
   SHOPIFY_REDIRECT_URI=https://your-backend-url.com/api/auth/callback
   SHOPIFY_SCOPES=read_customers,write_customers,read_products,write_customer_metafields,read_customer_metafields
   APPLICATION_URL=https://your-backend-url.com
   
   SESSION_SECRET=your_secure_random_secret
   ALLOWED_ORIGINS=https://your-store.myshopify.com
   ```

3. **Start the server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## OAuth Authentication

This API implements Shopify's Authorization Code Grant OAuth flow for secure authentication. See [OAUTH_IMPLEMENTATION.md](./OAUTH_IMPLEMENTATION.md) for detailed documentation.

### Quick OAuth Setup

1. Install the app by visiting:
   ```
   https://your-backend-url.com/api/auth/shopify?shop=your-store.myshopify.com
   ```

2. Approve the permissions on Shopify's grant screen

3. The access token is automatically stored and used for subsequent API calls

### Testing OAuth

Run the test suite:
```bash
node test-oauth-flow.js
```

## API Endpoints

### Authentication Endpoints

#### GET /api/auth/shopify
Initiate OAuth authorization flow.

**Parameters:**
- `shop` (required): Shop domain (e.g., "example.myshopify.com")
- `hmac` (optional): HMAC signature for verification
- `timestamp` (optional): Request timestamp

#### GET /api/auth/callback
OAuth callback endpoint (automatically called by Shopify).

#### GET /api/auth/verify
Check authentication status for a shop.

**Parameters:**
- `shop`: Shop domain

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

### Health Check

#### GET /api/health
Check if the API server is running.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-29T00:00:00.000Z",
  "service": "earlyaccess-backend",
  "version": "1.0.0"
}
```

#### GET /api/health/ready
Check if the API is ready to serve requests (all dependencies configured).

**Response:**
```json
{
  "success": true,
  "status": "ready",
  "timestamp": "2025-10-29T00:00:00.000Z"
}
```

### Wishlist Operations

All wishlist endpoints require authentication via:
- `Authorization` header with session token, OR
- `X-Customer-Id` header with customer GID

#### POST /api/wishlist/add
Add a product to customer's wishlist.

**Request Body:**
```json
{
  "productId": "gid://shopify/Product/7234567890",
  "productHandle": "cool-t-shirt"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itemCount": 5,
    "wishlist": [
      "gid://shopify/Product/7234567890",
      "gid://shopify/Product/7234567891"
    ]
  }
}
```

#### POST /api/wishlist/remove
Remove a product from customer's wishlist.

**Request Body:**
```json
{
  "productId": "gid://shopify/Product/7234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itemCount": 4,
    "wishlist": [
      "gid://shopify/Product/7234567891"
    ]
  }
}
```

#### GET /api/wishlist/current
Get current authenticated customer's wishlist with full product details.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "gid://shopify/Product/7234567890",
        "title": "Cool T-Shirt",
        "handle": "cool-t-shirt",
        "price": "29.99",
        "currency": "USD",
        "imageUrl": "https://cdn.shopify.com/...",
        "url": "/products/cool-t-shirt",
        "availableForSale": true,
        "addedAt": "2025-10-28T10:30:00Z"
      }
    ]
  }
}
```

#### GET /api/wishlist/:customerId
Get specific customer's wishlist (admin use).

**Response:** Same as `/api/wishlist/current`

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Error Codes

- `UNAUTHORIZED` - Customer not authenticated
- `INVALID_REQUEST` - Missing or invalid parameters
- `SHOPIFY_API_ERROR` - Shopify API request failed
- `METAFIELD_UPDATE_FAILED` - Failed to update metafield
- `INTERNAL_ERROR` - Unexpected server error

## Deployment

### Deploy to Production

1. **Set environment variables** on your hosting platform
2. **Build and deploy**
   ```bash
   npm start
   ```

### Recommended Hosting

- **Heroku**: Easy deployment with addons
- **DigitalOcean**: Flexible VPS hosting
- **AWS ECS/Fargate**: Container-based deployment
- **Vercel/Netlify**: Serverless functions

### Domain Configuration

The backend should be hosted at:
```
https://earlyaccessapi.dev.artslabcreatives.com
```

Configure your DNS:
- Add an A or CNAME record pointing to your server
- Enable HTTPS with SSL certificate

## Development

### Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   └── wishlistController.js
│   ├── routes/          # API routes
│   │   ├── health.js
│   │   └── wishlist.js
│   ├── services/        # Business logic
│   │   ├── shopifyService.js
│   │   └── wishlistService.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── server.js        # Main server file
├── package.json
├── .env.example
└── README.md
```

### Adding New Features

1. Create new route in `src/routes/`
2. Add controller in `src/controllers/`
3. Implement business logic in `src/services/`
4. Register route in `src/server.js`

### Testing

```bash
npm test
```

## Security

- **Authentication**: Validates customer sessions
- **CORS**: Configurable allowed origins
- **Environment Variables**: Sensitive data not in code
- **Error Handling**: No sensitive data in error responses
- **Rate Limiting**: TODO - Add rate limiting middleware

## Monitoring

- **Health Checks**: Use `/api/health` and `/api/health/ready`
- **Logging**: All requests and errors logged to console
- **TODO**: Add proper logging service (Winston, Datadog, etc.)

## Support

For issues or questions:
1. Check the logs for errors
2. Verify environment variables are set correctly
3. Test Shopify API credentials
4. Review API documentation

## License

MIT License
