# Architecture Diagram

## System Architecture

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
    ├── README.md                  # Main docs
    ├── SETUP.md                   # Setup guide
    ├── API.md                     # API reference
    ├── QUICKSTART.md              # Quick start
    ├── CHANGELOG.md               # Version history
    ├── CONTRIBUTING.md            # Contribution guide
    └── ARCHITECTURE.md            # This file!
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
