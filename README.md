# Early Access + Wishlist Shopify App

A comprehensive Shopify app that provides wishlist functionality for customers and early access pages with exclusive discounts.

## 🏗️ Architecture

This app uses a **split architecture** with separate backend and frontend:

- **Backend API**: Node.js/Express server at `earlyaccessapi.dev.artslabcreatives.com`
- **Frontend**: Shopify UI extensions (theme, customer account, admin)

```
Frontend (UI Extensions) → Backend API → Shopify GraphQL API → Customer Metafields
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📁 Project Structure

```
earlyaccess/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── server.js          # Main server
│   └── README.md
│
├── frontend/                   # Frontend UI extensions
│   ├── wishlist-button-theme/ # Storefront extension
│   ├── wishlist-customer-account/ # Customer account extension
│   ├── wishlist-admin/        # Admin extension
│   └── README.md
│
└── shopify.app.toml           # Shopify app config
```

## Features

### Wishlist Functionality
- **Storefront Button**: Add to Wishlist button on product pages
  - Configurable via UI Extension settings
  - Customizable button text, colors, and styles
  - Heart icon with smooth animations
  - Login requirement for authenticated wishlist management
  
- **Customer Account Integration**: Full-page wishlist management
  - View all wishlisted products with images and pricing
  - Remove products from wishlist
  - Direct navigation to product pages
  - Responsive grid layout
  
- **Customer Metafields**: Persistent wishlist storage
  - Wishlist data stored in customer metafields
  - Secure and scalable storage solution
  - Automatic sync across sessions

- **Admin Dashboard**: Merchant wishlist management
  - View customer wishlists in admin customer details
  - See which products are popular across wishlists
  - CRUD operations support

### Early Access Pages (Future Enhancement)
- Access-controlled custom pages
- Exclusive discounts for early access customers
- Customer authentication integration

## Architecture

### Extensions

#### 1. Theme App Extension (`wishlist-button-theme`)
Provides the "Add to Wishlist" button for product pages.

**Files:**
- `blocks/wishlist-button.liquid` - Main button component
- `assets/wishlist-button.css` - Button styles
- `assets/wishlist-button.js` - Button functionality
- `shopify.extension.toml` - Extension configuration

**Settings:**
- Button text (default and added state)
- Show/hide heart icon
- Button style (primary, secondary, outline)
- Button color
- Icon color

#### 2. Customer Account UI Extension (`wishlist-customer-account`)
Full-page extension for customer wishlist management.

**Files:**
- `src/WishlistPage.jsx` - Main wishlist page
- `src/ProfileBlock.jsx` - Profile page link to wishlist
- `shopify.extension.toml` - Extension configuration

**Features:**
- Grid display of wishlist products
- Product images, titles, and pricing
- Remove from wishlist functionality
- Empty state handling
- Loading states

#### 3. Admin UI Extension (`wishlist-admin`)
Block extension for viewing customer wishlists in admin.

**Files:**
- `src/WishlistBlock.jsx` - Admin block component
- `shopify.extension.toml` - Extension configuration

**Features:**
- Display customer wishlist in customer details
- Product cards with images and details
- Link to product admin pages
- Stock and status information

## Quick Start

### For Merchants

1. Install the app from the Shopify App Store
2. Go to **Online Store → Themes → Customize**
3. Add the **"Add to Wishlist"** block to product pages
4. Customize button appearance and save
5. Test by logging in as a customer and adding products to wishlist

### For Developers

```bash
# Clone and install
git clone <repository-url>
cd earlyaccess
npm install

# Install extension dependencies
cd frontend/wishlist-customer-account && npm install
cd ../wishlist-admin && npm install
cd ../..

# Start development server
npm run dev
```

Follow the CLI prompts to connect to your development store and start testing.

## Installation

### Prerequisites
- Shopify Partner account
- Development store
- Node.js 18+ and npm
- Shopify CLI 3.86+

### Detailed Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd earlyaccess
   ```

2. **Backend Setup (Optional)**
   
   > **Note**: The backend API is optional. Extensions work with direct Shopify GraphQL calls. The backend provides caching, analytics, and reduces bundle sizes.
   
   If using backend:
   ```bash
   cd backend2
   npm install
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```
   PORT=3000
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your_access_token
   ALLOWED_ORIGINS=https://your-store.myshopify.com
   ```

3. **Install Root Dependencies**
   ```bash
   cd ..
   npm install
   ```

4. **Frontend Setup**
   ```bash
   cd frontend/wishlist-customer-account
   npm install
   cd ../wishlist-admin
   npm install
   cd ../..
   ```

5. **Configure API URL (Only if using backend)**
   
   If using the optional backend API, update these files:
   - `frontend/wishlist-button-theme/assets/wishlist-button.js`
   - `frontend/wishlist-customer-account/src/api/backendApi.js`
   - `frontend/wishlist-admin/src/api/backendApi.js`

   For local development:
   ```javascript
   const BACKEND_API_URL = 'http://localhost:3000';
   ```

   For production:
   ```javascript
   const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';
   ```

6. **Start development**
   ```bash
   npm run dev
   ```
   
   This starts the Shopify app dev server. If using backend API, start it separately:
   ```bash
   cd backend2 && npm run dev
   ```

7. **Follow CLI prompts**
   - Select your app
   - Select your development store
   - Press `p` to open developer console

## Development

### Running the Application

**Without Backend API** (Default):
```bash
npm run dev
```

**With Backend API** (Optional):

Terminal 1 - Backend:

#### Option 1: Run Backend and Frontend Together (Recommended)
```bash
npm run dev:full
```
```bash
cd backend2
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Testing Extensions

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

#### Testing Theme Extension

1. Navigate to your development store
2. Go to Online Store > Themes
3. Click Customize on your theme
4. Add the "Add to Wishlist" app block to product pages
5. Configure button settings in the theme editor
6. Preview and test the functionality

### Testing Customer Account Extension

1. Run `shopify app dev`
2. Press `p` to open developer console
3. Click the preview link for customer account extension
4. Navigate to customer profile
5. Click "View Wishlist" to see the full page

### Testing Admin Extension

1. Go to your development store admin
2. Navigate to Customers
3. Select a customer
4. Scroll to see the "Customer Wishlist" block

## API Integration

### Customer Metafields

The app uses customer metafields to store wishlist data:

**Wishlist Products** (`app.wishlist`)
- Type: `list.product_reference`
- Access: Customer read/write, Admin read/write
- Stores array of product IDs

**Wishlist Timestamps** (`app.wishlist_timestamps`)
- Type: `json`
- Access: Customer read, Admin read
- Stores when each product was added

### GraphQL Queries

#### Get Customer Wishlist
```graphql
query {
  customer {
    id
    metafield(namespace: "app", key: "wishlist") {
      value
    }
  }
}
```

#### Update Wishlist
```graphql
mutation UpdateWishlist($customerId: ID!, $metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      id
      namespace
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

#### Get Products
```graphql
query GetProducts($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      title
      handle
      onlineStoreUrl
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
      }
    }
  }
}
```

## Deployment

### Create App Version

```bash
npm run deploy
```

This will:
1. Build all extensions
2. Create a new app version
3. Upload to Shopify

### Release to Production

1. Test thoroughly on development store
2. Create app version with `shopify app deploy`
3. Review in Partner Dashboard
4. Release to users

### App Distribution

The app is configured for custom distribution. To make it public:
1. Add an embedded app home page
2. Update `application_url` in `shopify.app.toml`
3. Submit for App Store review

## Configuration

### Access Scopes

The app requires the following scopes:
- `write_customers` - Update customer metafields
- `read_customers` - Read customer data
- `write_products` - Future: Early access product management
- `read_products` - Display product information
- `write_discounts` - Future: Early access discounts
- `read_discounts` - Future: Display discount information
- `write_metaobjects` - Future: Early access page data
- `read_metaobjects` - Future: Display early access pages

### Metafield Definitions

Defined in `shopify.app.toml`:
- `customer.metafields.app.wishlist` - Product list
- `customer.metafields.app.wishlist_timestamps` - Timestamps JSON

## Customization

### Theme Extension Styling

Edit `extensions/wishlist-button-theme/assets/wishlist-button.css` to customize:
- Button appearance
- Icon styles
- Hover effects
- Responsive breakpoints
- Toast notifications

### Customer Account Page

Edit `extensions/wishlist-customer-account/src/WishlistPage.jsx` to customize:
- Grid layout
- Product card design
- Empty state message
- Loading indicators

### Admin Block

Edit `extensions/wishlist-admin/src/WishlistBlock.jsx` to customize:
- Block appearance
- Product card layout
- Data display

## Troubleshooting

### Button Not Showing
- Ensure theme supports app blocks
- Verify block is added in theme editor
- Check customer is logged in for full functionality

### Wishlist Not Saving
- Verify access scopes are granted
- Check metafield definitions are created
- Review browser console for errors

### Admin Block Not Visible
- Ensure extension is deployed
- Check admin UI extensions are enabled
- Verify customer has wishlist data

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
- **[API.md](./API.md)** - Complete API reference and GraphQL queries
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions for various platforms
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes
- **[BUNDLE_SIZE_VERIFICATION.md](./BUNDLE_SIZE_VERIFICATION.md)** - Bundle optimization notes

## Future Enhancements

### Early Access Pages
- Create custom pages with access control
- Implement customer group authentication
- Add exclusive discount functionality
- Build merchant configuration UI

### Additional Features
- Email notifications for price drops
- Wishlist sharing functionality
- Product recommendations based on wishlist
- Analytics and reporting dashboard
- Bulk operations for wishlist management

## Support

For issues or questions:
1. **Documentation**: Check the docs listed above
2. **Testing**: See [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. **Architecture**: Review [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Shopify Docs**: https://shopify.dev
5. **Issues**: Open an issue in the repository

## Related Documentation

- **Backend2 API**: See [backend2/README.md](./backend2/README.md) for Laravel backend
- **Frontend**: See [frontend/README.md](./frontend/README.md) for extension details

## License

MIT License - See LICENSE file for details

## Credits

Built with:
- Shopify CLI
- Shopify UI Extensions
- Preact
- Liquid templating
