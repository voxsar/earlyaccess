# Code Base Split - Architecture Documentation

This document describes the split architecture of the Early Access + Wishlist application, separating backend API from frontend UI extensions.

## Overview

The codebase has been split into two main components:

1. **Backend API**: Node.js/Express server handling all business logic and Shopify API interactions
2. **Frontend**: Shopify UI extensions providing user interfaces

## Directory Structure

```
earlyaccess/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   └── server.js          # Main server
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/                   # Frontend UI extensions
│   ├── wishlist-button-theme/ # Storefront extension
│   ├── wishlist-customer-account/ # Customer account extension
│   ├── wishlist-admin/        # Admin extension
│   └── README.md
│
├── shopify.app.toml           # Shopify app config
└── package.json               # Root package
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Shopify Platform                         │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Storefront │  │   Customer   │  │    Admin     │       │
│  │   Theme    │  │   Account    │  │  Dashboard   │       │
│  └──────┬─────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼────────────────┼──────────────────┼──────────────┘
          │                │                  │
          └────────────────┼──────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │     Frontend UI Extensions         │
          │  (Shopify App Extensions)          │
          │                                    │
          │  - wishlist-button-theme          │
          │  - wishlist-customer-account      │
          │  - wishlist-admin                 │
          └────────────────┬───────────────────┘
                           │
                           │ REST API Calls
                           │
                           ▼
          ┌────────────────────────────────────┐
          │       Backend API Server           │
          │  earlyaccessapi.dev.artslabcreatives.com │
          │                                    │
          │  - Express.js                      │
          │  - REST API Endpoints             │
          │  - Business Logic                 │
          │  - Authentication                 │
          └────────────────┬───────────────────┘
                           │
                           │ GraphQL Queries
                           │
                           ▼
          ┌────────────────────────────────────┐
          │    Shopify Admin GraphQL API       │
          │                                    │
          │  - Customer Data                   │
          │  - Product Data                    │
          │  - Metafields                      │
          └────────────────┬───────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │     Customer Metafields            │
          │                                    │
          │  - app.wishlist                   │
          │  - app.wishlist_timestamps        │
          └────────────────────────────────────┘
```

## Data Flow

### Add to Wishlist Flow

```
1. Customer clicks "Add to Wishlist" button (Frontend)
   └─> Theme Extension (wishlist-button.js)

2. Frontend updates local storage (optimistic UI)
   └─> localStorage.setItem('wishlist_products', [...])

3. Frontend calls Backend API
   └─> POST https://earlyaccessapi.dev.artslabcreatives.com/api/wishlist/add
       Headers: { X-Customer-Id: "gid://shopify/Customer/123" }
       Body: { productId: "gid://shopify/Product/456" }

4. Backend validates and processes
   └─> wishlistController.addToWishlist()
       └─> wishlistService.addToWishlist()
           └─> shopifyService.getCustomerMetafield()
           └─> shopifyService.updateCustomerMetafield()

5. Backend calls Shopify GraphQL API
   └─> mutation metafieldsSet(...)

6. Backend returns success
   └─> { success: true, data: { itemCount: 5 } }

7. Frontend displays success toast
   └─> "Added to wishlist!"
```

### Get Wishlist Flow

```
1. Customer opens wishlist page (Frontend)
   └─> Customer Account Extension (WishlistPage.jsx)

2. Frontend gets customer ID
   └─> query { customer { id } }

3. Frontend calls Backend API
   └─> GET https://earlyaccessapi.dev.artslabcreatives.com/api/wishlist/current
       Headers: { X-Customer-Id: "gid://shopify/Customer/123" }

4. Backend processes request
   └─> wishlistController.getCurrentWishlist()
       └─> wishlistService.getWishlistWithProducts()
           └─> shopifyService.getCustomerMetafield()
           └─> shopifyService.getProductsByIds()

5. Backend queries Shopify
   └─> query { customer { metafield(...) } }
   └─> query { nodes(ids: [...]) { ... on Product } }

6. Backend formats and returns data
   └─> {
         success: true,
         data: {
           items: [
             {
               productId: "...",
               title: "...",
               price: "...",
               imageUrl: "...",
               ...
             }
           ]
         }
       }

7. Frontend displays products
   └─> Grid of product cards
```

## API Endpoints

### Backend API (https://earlyaccessapi.dev.artslabcreatives.com)

#### Health Checks
- `GET /api/health` - Server health check
- `GET /api/health/ready` - Readiness check

#### Wishlist Operations
- `POST /api/wishlist/add` - Add product to wishlist
- `POST /api/wishlist/remove` - Remove product from wishlist
- `GET /api/wishlist/current` - Get current customer's wishlist
- `GET /api/wishlist/:customerId` - Get specific customer's wishlist (admin)

## Authentication

### Current Implementation

Frontend passes customer ID via headers:
```javascript
headers: {
  'X-Customer-Id': 'gid://shopify/Customer/123'
}
```

### Production Implementation (TODO)

Should use Shopify session tokens:
```javascript
headers: {
  'Authorization': 'Bearer <shopify-session-token>'
}
```

Backend should verify session tokens with Shopify to ensure security.

## Deployment

### Backend Deployment

**Hosting**: Deploy to any Node.js hosting platform
- Heroku
- DigitalOcean
- AWS ECS/Fargate
- Vercel/Netlify (serverless functions)

**Domain**: Configure DNS to point to:
```
https://earlyaccessapi.dev.artslabcreatives.com
```

**Environment Variables**:
```
PORT=3000
NODE_ENV=production
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_SHOP_DOMAIN=...
SHOPIFY_ACCESS_TOKEN=...
ALLOWED_ORIGINS=https://your-store.myshopify.com
```

### Frontend Deployment

Deploy via Shopify CLI:
```bash
shopify app deploy
```

This uploads extensions to Shopify's CDN.

## Benefits of Split Architecture

### 1. **Reduced Bundle Size**
- Frontend only contains UI code
- No GraphQL query logic
- Smaller bundle = faster load times

### 2. **Better Performance**
- Backend can cache frequently accessed data
- Batch operations on server side
- Reduced number of client-side API calls

### 3. **Enhanced Security**
- Shopify credentials only on backend
- Customer authentication validated server-side
- No sensitive data in client code

### 4. **Easier Maintenance**
- Clear separation of concerns
- Backend logic can be updated without redeploying frontend
- Easier to test and debug

### 5. **Scalability**
- Backend can be scaled independently
- Can add rate limiting, caching, etc.
- Support for future features (analytics, webhooks)

### 6. **Future-Proof**
- Easy to add new features
- Can integrate with other services
- Support for mobile apps or other clients

## Migration Notes

### Changes from Original Architecture

**Before**:
- Extensions made direct GraphQL calls to Shopify
- All logic in frontend code
- Larger bundle sizes

**After**:
- Extensions call REST API on backend
- Backend handles all Shopify interactions
- Smaller, cleaner frontend code

### API Response Format Changes

**Before (Direct GraphQL)**:
```javascript
{
  data: {
    customer: {
      metafield: {
        value: "[\"gid://shopify/Product/123\"]"
      }
    }
  }
}
```

**After (Backend API)**:
```javascript
{
  success: true,
  data: {
    items: [
      {
        productId: "gid://shopify/Product/123",
        title: "Product Name",
        price: "29.99",
        currency: "USD",
        imageUrl: "https://...",
        ...
      }
    ]
  }
}
```

## Development Workflow

### Local Development

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd ..
   shopify app dev
   ```

3. **Configure API URL**:
   - For local development, use `http://localhost:3000`
   - For production, use `https://earlyaccessapi.dev.artslabcreatives.com`

### Testing

1. **Backend Tests**:
   ```bash
   cd backend
   npm test
   ```

2. **Frontend Tests**:
   - Test in Shopify development store
   - Use browser dev tools to verify API calls

## Troubleshooting

### CORS Issues
- Ensure backend has correct CORS configuration
- Check `ALLOWED_ORIGINS` environment variable
- Verify frontend is making requests from allowed origin

### Authentication Errors
- Verify customer ID is being passed correctly
- Check backend logs for authentication failures
- Ensure Shopify credentials are valid

### API Call Failures
- Check backend server is running
- Verify API URL is correct in frontend code
- Review network tab in browser dev tools
- Check backend logs for errors

## Future Enhancements

### Phase 1 (Current)
- ✅ Backend API setup
- ✅ Frontend API connectors
- ✅ Basic CRUD operations

### Phase 2 (Planned)
- [ ] Session token authentication
- [ ] Rate limiting
- [ ] API caching
- [ ] Error tracking (Sentry, Datadog)
- [ ] Logging infrastructure

### Phase 3 (Future)
- [ ] Analytics endpoints
- [ ] Email notifications
- [ ] Webhook handlers
- [ ] Admin dashboard
- [ ] Mobile app support

## Support

For issues or questions:
1. Check backend logs
2. Review browser console
3. Verify environment variables
4. Test API endpoints directly
5. Review Shopify API status

## License

MIT License
