# Architecture Documentation

This document provides detailed architecture information for the Early Access + Wishlist Shopify App.

## Table of Contents
- [System Overview](#system-overview)
- [Split Architecture](#split-architecture)
- [System Architecture Diagram](#system-architecture-diagram)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Technology Stack](#technology-stack)
- [Security Model](#security-model)
- [Performance Considerations](#performance-considerations)

## System Overview

The Early Access + Wishlist app uses a **split architecture** with separate backend and frontend components:

- **Backend API**: Node.js/Express server (optional) at `earlyaccessapi.dev.artslabcreatives.com`
- **Frontend**: Shopify UI extensions (theme, customer account, admin)

```
Frontend (UI Extensions) → Backend API (Optional) → Shopify GraphQL API → Customer Metafields
```

> **Note**: The backend API is optional. Extensions can make direct GraphQL calls to Shopify APIs. The backend provides additional features like caching, analytics, and reduced client-side bundle sizes.

## Split Architecture

### Directory Structure

```
earlyaccess/
├── backend2/                   # Laravel backend API (optional)
│   ├── app/
│   │   ├── Http/Controllers/  # Request handlers
│   │   └── Services/          # Business logic
│   └── routes/                # API routes
│
├── frontend/                   # Frontend UI extensions
│   ├── wishlist-button-theme/ # Storefront extension
│   ├── wishlist-customer-account/ # Customer account extension
│   ├── wishlist-admin/        # Admin extension
│   └── README.md
│
└── shopify.app.toml           # Shopify app config
```

### Architecture Comparison

**Direct GraphQL Approach** (Current Default):
```
Frontend Extensions → Shopify GraphQL API → Customer Metafields
```

**Pros:**
- Simple architecture
- No backend infrastructure needed
- Direct access to Shopify's APIs
- Smaller deployment footprint

**Cons:**
- All logic runs in frontend (larger bundles)
- Limited caching capabilities
- Cannot add custom business logic easily

**Backend API Approach** (Optional):
```
Frontend Extensions → Backend API → Shopify GraphQL API → Customer Metafields
```

**Pros:**
- Reduced frontend bundle size (30-40% smaller)
- Backend can cache frequently accessed data
- Easy to add advanced features (analytics, notifications)
- Better security (credentials server-side only)
- Scalable architecture

**Cons:**
- Additional infrastructure to deploy
- More complex deployment
- Additional hosting costs

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SHOPIFY PLATFORM                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
       ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
       │   STOREFRONT   │  │    CUSTOMER    │  │     ADMIN      │
       │   (Theme)      │  │    ACCOUNT     │  │   DASHBOARD    │
       └────────────────┘  └────────────────┘  └────────────────┘
                │                   │                   │
                │                   │                   │
       ┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
       │  Theme App      │ │  Customer       │ │  Admin UI       │
       │  Extension      │ │  Account UI     │ │  Extension      │
       │                 │ │  Extension      │ │                 │
       │  Components:    │ │                 │ │  Components:    │
       │  - Button       │ │  Components:    │ │  - Block        │
       │  - Liquid       │ │  - WishlistPage │ │  - Products     │
       │  - CSS/JS       │ │  - ProfileBlock │ │  - Status       │
       └─────────────────┘ └─────────────────┘ └─────────────────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     DATA STORAGE LAYER        │
                    │                               │
                    │  Customer Metafields:         │
                    │  ┌─────────────────────────┐  │
                    │  │ app.wishlist            │  │
                    │  │ (list.product_reference)│  │
                    │  └─────────────────────────┘  │
                    │  ┌─────────────────────────┐  │
                    │  │ app.wishlist_timestamps │  │
                    │  │ (JSON)                  │  │
                    │  └─────────────────────────┘  │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            ┌──────────────┐              ┌──────────────┐
            │  ADMIN API   │              │ STOREFRONT   │
            │  (GraphQL)   │              │  API (GQL)   │
            │              │              │              │
            │  - Customer  │              │  - Products  │
            │  - Metafields│              │  - Variants  │
            │  - Products  │              │  - Pricing   │
            └──────────────┘              └──────────────┘
```

## Data Flow

### Add to Wishlist Flow (Direct GraphQL)

```
1. Customer clicks "Add to Wishlist" button (Frontend)
   └─> Theme Extension (wishlist-button.js)

2. Frontend updates local storage (optimistic UI)
   └─> localStorage.setItem('wishlist_products', [...])

3. Frontend calls Shopify Customer Account API
   └─> GraphQL mutation: metafieldsSet
       Variables: { customerId, metafields: [{
         namespace: "app",
         key: "wishlist",
         value: [productIds...],
         type: "list.product_reference"
       }]}

4. Shopify updates customer metafield
   └─> Customer.metafield.app.wishlist updated

5. Frontend displays success toast
   └─> "Added to wishlist!"
```

### Add to Wishlist Flow (With Backend API)

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

3. Frontend queries wishlist metafield
   └─> query { customer { metafield(namespace: "app", key: "wishlist") { value } } }

4. Parse product IDs from metafield value

5. Frontend queries product details
   └─> query { nodes(ids: [...]) { ... on Product { id, title, price, image } } }

6. Frontend displays products in grid
   └─> Product cards with images, titles, and prices
```

## Data Flow Diagram

### Add to Wishlist Flow

```
Customer                Theme Extension          Local Storage      API           Metafields
   │                           │                      │             │                │
   │  Click "Add to           │                      │             │                │
   │  Wishlist"               │                      │             │                │
   ├────────────────────────> │                      │             │                │
   │                           │                      │             │                │
   │                           │  Save to localStorage│             │                │
   │                           ├────────────────────> │             │                │
   │                           │                      │             │                │
   │                           │  POST /api/add       │             │                │
   │                           ├──────────────────────┼───────────> │                │
   │                           │                      │             │                │
   │                           │                      │    Update   │                │
   │                           │                      │   Metafield │                │
   │                           │                      │             ├──────────────> │
   │                           │                      │             │                │
   │                           │                      │             │   Success      │
   │                           │                      │             │ <──────────────┤
   │                           │                      │             │                │
   │                           │  Show Toast          │             │                │
   │  "Added to Wishlist!"     │                      │             │                │
   │ <─────────────────────────┤                      │             │                │
   │                           │                      │             │                │
   │                           │  Update Button State │             │                │
   │                           │  (Change text/icon)  │             │                │
   │ <─────────────────────────┤                      │             │                │
```

### View Wishlist Flow

```
Customer            Customer Account Ext      Customer API      Storefront API    Metafields
   │                        │                      │                  │               │
   │  Navigate to           │                      │                  │               │
   │  Wishlist Page         │                      │                  │               │
   ├──────────────────────> │                      │                  │               │
   │                        │                      │                  │               │
   │                        │  Query Customer      │                  │               │
   │                        │  Metafield           │                  │               │
   │                        ├────────────────────> │                  │               │
   │                        │                      │                  │               │
   │                        │                      │  Read Metafield  │               │
   │                        │                      ├────────────────────────────────> │
   │                        │                      │                  │               │
   │                        │                      │  Product IDs     │               │
   │                        │                      │ <────────────────────────────────┤
   │                        │                      │                  │               │
   │                        │  Product IDs         │                  │               │
   │                        │ <────────────────────┤                  │               │
   │                        │                      │                  │               │
   │                        │  Query Products      │                  │               │
   │                        ├──────────────────────┼────────────────> │               │
   │                        │                      │                  │               │
   │                        │  Product Data        │                  │               │
   │                        │ <────────────────────┼──────────────────┤               │
   │                        │                      │                  │               │
   │  Display Grid of       │                      │                  │               │
   │  Products              │                      │                  │               │
   │ <──────────────────────┤                      │                  │               │
```

## Component Architecture

### Theme Extension (wishlist-button-theme)

```
┌─────────────────────────────────────────────────┐
│         Wishlist Button Component               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  wishlist-button.liquid                 │   │
│  │  - Liquid template                       │   │
│  │  - Schema settings                       │   │
│  │  - Customer auth check                   │   │
│  │  - SVG heart icon                        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  wishlist-button.css                    │   │
│  │  - Button styles                         │   │
│  │  - Responsive design                     │   │
│  │  - Animations                            │   │
│  │  - Toast notifications                   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  wishlist-button.js                     │   │
│  │  - WishlistButton class                 │   │
│  │  - Event handlers                        │   │
│  │  - API calls                             │   │
│  │  - Local storage                         │   │
│  │  - State management                      │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Customer Account Extension (wishlist-customer-account)

```
┌─────────────────────────────────────────────────┐
│    Customer Account UI Extension                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  WishlistPage.jsx                       │   │
│  │  - Full page component                   │   │
│  │  - Product grid                          │   │
│  │  - Remove functionality                  │   │
│  │  - Empty states                          │   │
│  │  - API integration                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  ProfileBlock.jsx                       │   │
│  │  - Link to wishlist                      │   │
│  │  - Profile integration                   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Components Used:                               │
│  - s-page                                       │
│  - s-grid                                       │
│  - s-section                                    │
│  - s-image                                      │
│  - s-button                                     │
│  - s-text                                       │
│  - s-stack                                      │
└─────────────────────────────────────────────────┘
```

### Admin Extension (wishlist-admin)

```
┌─────────────────────────────────────────────────┐
│         Admin UI Extension                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  WishlistBlock.jsx                      │   │
│  │  - Customer details block                │   │
│  │  - Product cards                         │   │
│  │  - Status indicators                     │   │
│  │  - Admin API queries                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Components Used:                               │
│  - admin-block                                  │
│  - admin-card                                   │
│  - admin-stack                                  │
│  - admin-image                                  │
│  - admin-text                                   │
│  - admin-link                                   │
│  - admin-badge                                  │
└─────────────────────────────────────────────────┘
```

## State Management

### Client-Side State

```
┌─────────────────────────────────┐
│      Local Storage              │
│  (Quick UI Updates)             │
│                                 │
│  Key: "wishlist_products"       │
│  Value: ["id1", "id2", "id3"]   │
└─────────────────────────────────┘
           │
           │ Sync
           ▼
┌─────────────────────────────────┐
│    Customer Metafields          │
│  (Persistent Storage)           │
│                                 │
│  namespace: "app"               │
│  key: "wishlist"                │
│  type: "list.product_reference" │
└─────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────┐
│                  Authentication                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Storefront:     Customer session cookies           │
│  Customer Account: OAuth customer login             │
│  Admin:          Admin session authentication       │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Authorization                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Metafield Access Controls:                         │
│  ┌─────────────────────────────────────────────┐   │
│  │  app.wishlist                               │   │
│  │  - Customer: read/write                     │   │
│  │  - Admin: read/write                        │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  app.wishlist_timestamps                    │   │
│  │  - Customer: read only                      │   │
│  │  - Admin: read only                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│              Development Environment                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Local Machine                                      │
│  ├── Source Code                                    │
│  ├── Shopify CLI (Dev Server)                      │
│  └── ngrok Tunnel ──────────┐                      │
│                              │                      │
└──────────────────────────────┼──────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────┐
│          Shopify Development Store                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  - App installed                                    │
│  - Extensions active                                │
│  - Real-time updates                                │
│                                                     │
└─────────────────────────────────────────────────────┘

                   Deploy Command
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│           Shopify Partner Dashboard                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  - App versions                                     │
│  - Extension builds                                 │
│  - CDN hosting                                      │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼ Release
┌─────────────────────────────────────────────────────┐
│            Production Stores                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  - Merchants install app                            │
│  - Extensions automatically available               │
│  - CDN serves assets                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## File Organization

```
earlyaccess/
│
├── extensions/                    # All app extensions
│   │
│   ├── wishlist-button-theme/     # Storefront extension
│   │   ├── assets/                # CSS, JS, images
│   │   ├── blocks/                # Liquid blocks
│   │   ├── snippets/              # Liquid snippets
│   │   ├── locales/               # Translations
│   │   └── shopify.extension.toml # Config
│   │
│   ├── wishlist-customer-account/ # Customer extension
│   │   ├── src/                   # React/Preact components
│   │   ├── locales/               # Translations
│   │   ├── package.json           # Dependencies
│   │   └── shopify.extension.toml # Config
│   │
│   └── wishlist-admin/            # Admin extension
│       ├── src/                   # React/Preact components
│       ├── package.json           # Dependencies
│       └── shopify.extension.toml # Config
│
├── shopify.app.toml               # Main app configuration
├── package.json                   # Root dependencies
│
└── Documentation/
    ├── README.md                  # Main docs with setup
    ├── API.md                     # API reference
    ├── ARCHITECTURE.md            # This file!
    ├── TESTING_GUIDE.md           # Testing guide
    ├── DEPLOYMENT.md              # Deployment guide
    ├── CHANGELOG.md               # Version history
    ├── CONTRIBUTING.md            # Contribution guide
    └── BUNDLE_SIZE_VERIFICATION.md # Bundle optimization
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Frontend Layer                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Preact     │  │  Vanilla JS  │  │  Liquid  │ │
│  │  (Extensions)│  │   (Theme)    │  │ (Theme)  │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│               UI Components Layer                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │  Polaris Web     │  │  Admin UI        │       │
│  │  Components      │  │  Components      │       │
│  │  (Customer)      │  │  (Admin)         │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                   API Layer                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Admin    │ │  Storefront  │ │  Customer    │  │
│  │  GraphQL  │ │   GraphQL    │ │  Account API │  │
│  └───────────┘ └──────────────┘ └──────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Data Layer                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Customer   │  │   Products   │  │  Orders  │ │
│  │  Metafields  │  │              │  │          │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Shopify Platform                       │
└─────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Caching Strategy

```
┌─────────────────┐
│   User Action   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       Hit      ┌─────────────────┐
│ Local Storage   │─────────────────>│  Immediate UI  │
│     Cache       │                 │    Update      │
└────────┬────────┘                 └─────────────────┘
         │ Miss
         ▼
┌─────────────────┐
│   API Call      │
│  (Background)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Metafield     │
│    Update       │
└─────────────────┘
```

### Load Time Optimization

1. **Theme Extension**
   - CSS loaded via CDN
   - JS minified and cached
   - Local storage for instant UI

2. **Customer Account**
   - Lazy load product images
   - Batch GraphQL queries
   - Virtual scrolling for large lists

3. **Admin Extension**
   - Query only visible customers
   - Cache product data
   - Pagination for lists

---

This architecture is designed to be:
- **Scalable**: Can handle thousands of wishlists
- **Performant**: Optimized caching and queries
- **Secure**: Proper authentication and authorization
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add new features

## Benefits of Backend API (Optional)

If implementing the optional backend API, you gain:

### 1. Reduced Bundle Size
- Frontend only contains UI code
- No GraphQL query logic in client
- Smaller bundle = faster load times
- **Estimated savings**: 30-40% smaller bundles

### 2. Better Performance
- Backend can cache frequently accessed data
- Batch operations on server side
- Reduced number of client-side API calls
- Server-side query optimization

### 3. Enhanced Security
- Shopify credentials only on backend
- Customer authentication validated server-side
- No sensitive data in client code
- Rate limiting and abuse prevention

### 4. Easier Maintenance
- Clear separation of concerns
- Backend logic can be updated without redeploying frontend
- Easier to test and debug
- Centralized error handling

### 5. Scalability
- Backend can be scaled independently
- Can add rate limiting, caching, CDN
- Support for future features (analytics, webhooks)
- Database for complex queries (if needed)

### 6. Future-Proof
- Easy to add new features without frontend changes
- Can integrate with other services
- Support for mobile apps or other clients
- Analytics and monitoring infrastructure

## Migration to Backend API

If you decide to implement the backend API later:

### Changes Required

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

### Backend API Endpoints

If implementing backend:

1. **Health Checks**
   - `GET /api/health` - Server health
   - `GET /api/health/ready` - Readiness check

2. **Wishlist Operations**
   - `POST /api/wishlist/add` - Add product
   - `POST /api/wishlist/remove` - Remove product
   - `GET /api/wishlist/current` - Get current customer's wishlist
   - `GET /api/wishlist/:customerId` - Get specific customer's wishlist

See [API.md](./API.md) for complete API documentation.

## Troubleshooting

### Common Architecture Issues

**CORS Issues**
- Ensure backend has correct CORS configuration
- Check `ALLOWED_ORIGINS` environment variable
- Verify frontend is making requests from allowed origin

**Authentication Errors**
- Verify customer ID is being passed correctly
- Check backend logs for authentication failures
- Ensure Shopify credentials are valid

**API Call Failures**
- Check backend server is running (if using backend)
- Verify API URL is correct in frontend code
- Review network tab in browser dev tools
- Check backend logs for errors

## Future Enhancements

### Phase 1 (Current)
- ✅ Direct GraphQL implementation
- ✅ Frontend UI components
- ✅ Basic CRUD operations
- ✅ Customer metafield storage

### Phase 2 (Optional Backend)
- [ ] Backend API setup
- [ ] Frontend API connectors
- [ ] Session token authentication
- [ ] Rate limiting
- [ ] API caching

### Phase 3 (Advanced Features)
- [ ] Analytics endpoints
- [ ] Email notifications
- [ ] Webhook handlers
- [ ] Admin dashboard
- [ ] Mobile app support
- [ ] Wishlist sharing
- [ ] Product recommendations

---

For more information:
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING_GUIDE.md)
