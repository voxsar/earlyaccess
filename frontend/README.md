# Early Access Frontend

Frontend components for the Early Access + Wishlist Shopify App. This includes all UI extensions that integrate with Shopify's storefront, customer account, and admin interfaces.

## Structure

```
frontend/
├── wishlist-button-theme/       # Storefront theme extension
├── wishlist-customer-account/   # Customer account UI extension
└── wishlist-admin/              # Admin UI extension
```

## Extensions

### 1. Wishlist Button Theme Extension

**Location:** `wishlist-button-theme/`

A theme app extension that provides an "Add to Wishlist" button for product pages.

**Features:**
- Customizable button text and styling
- Heart icon with animations
- Toast notifications
- Local storage for quick UI updates
- Backend API integration

**Files:**
- `blocks/wishlist-button.liquid` - Button Liquid template
- `assets/wishlist-button.css` - Button styles
- `assets/wishlist-button.js` - Button functionality
- `shopify.extension.toml` - Extension configuration

**Integration with Backend:**
The button makes API calls to:
- `POST /api/wishlist/add` - Add product to wishlist
- `POST /api/wishlist/remove` - Remove product from wishlist

### 2. Customer Account UI Extension

**Location:** `wishlist-customer-account/`

Full-page extension for customer wishlist management in the customer account area.

**Features:**
- Grid display of wishlist products
- Product images, titles, and pricing
- Remove from wishlist functionality
- Empty state handling
- Loading states

**Files:**
- `src/WishlistPage.jsx` - Main wishlist page component
- `src/ProfileBlock.jsx` - Profile page link to wishlist
- `package.json` - Dependencies
- `shopify.extension.toml` - Extension configuration

**Integration with Backend:**
Uses backend API endpoints:
- `GET /api/wishlist/current` - Get current customer's wishlist
- `POST /api/wishlist/remove` - Remove items

### 3. Admin UI Extension

**Location:** `wishlist-admin/`

Block extension for viewing customer wishlists in the Shopify admin.

**Features:**
- Display customer wishlist in customer details
- Product cards with images and details
- Links to product admin pages
- Stock and status information

**Files:**
- `src/WishlistBlock.jsx` - Admin block component
- `package.json` - Dependencies
- `shopify.extension.toml` - Extension configuration

**Integration with Backend:**
Uses backend API:
- `GET /api/wishlist/:customerId` - Get specific customer's wishlist

## API Integration

All frontend extensions now communicate with the backend API instead of making direct GraphQL calls to Shopify.

### Backend API URL

Configure the backend API URL in each extension:

```javascript
const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';
```

### Authentication

Frontend extensions pass customer authentication via:
- Session tokens (from Shopify)
- Customer IDs in headers

Example:
```javascript
fetch(`${BACKEND_API_URL}/api/wishlist/add`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Customer-Id': customerId,
  },
  body: JSON.stringify({ productId }),
});
```

## Installation

### Prerequisites

- Shopify CLI installed
- Development store
- Backend API running

### Setup

1. **Install dependencies for React/Preact extensions**
   ```bash
   cd wishlist-customer-account && npm install
   cd ../wishlist-admin && npm install
   ```

2. **Configure backend API URL**
   Update the API URL in each extension's code to point to your backend:
   - `wishlist-button-theme/assets/wishlist-button.js`
   - `wishlist-customer-account/src/WishlistPage.jsx`
   - `wishlist-admin/src/WishlistBlock.jsx`

3. **Start development**
   From the root directory:
   ```bash
   npm run dev
   ```

## Development

### Testing Theme Extension

1. Run `shopify app dev`
2. Open your development store
3. Go to Online Store > Themes
4. Click Customize
5. Add the "Add to Wishlist" block to product pages
6. Test button functionality

### Testing Customer Account Extension

1. Run `shopify app dev`
2. Press `p` to open developer console
3. Click preview link for customer account extension
4. Log in as a customer
5. Navigate to wishlist page

### Testing Admin Extension

1. Run `shopify app dev`
2. Go to development store admin
3. Navigate to Customers
4. Select a customer with wishlist items
5. View the "Customer Wishlist" block

## Customization

### Theme Extension

Edit `wishlist-button-theme/assets/wishlist-button.css` for styling:
- Button colors
- Icon styles
- Hover effects
- Toast notifications

### Customer Account Extension

Edit `wishlist-customer-account/src/WishlistPage.jsx`:
- Grid layout
- Product card design
- Empty state message

### Admin Extension

Edit `wishlist-admin/src/WishlistBlock.jsx`:
- Block layout
- Product card display
- Data presentation

## Deployment

### Build Extensions

```bash
shopify app deploy
```

This will:
1. Build all extensions
2. Create a new app version
3. Upload to Shopify

### Release

1. Test thoroughly on development store
2. Review in Partner Dashboard
3. Release to production stores

## Troubleshooting

### Extensions Not Loading

- Verify backend API is running and accessible
- Check CORS configuration on backend
- Review browser console for errors
- Ensure Shopify CLI is up to date

### API Calls Failing

- Check backend API URL is correct
- Verify customer authentication is working
- Review network tab in browser dev tools
- Check backend logs for errors

### Wishlist Not Updating

- Verify backend API is receiving requests
- Check customer ID is being passed correctly
- Review backend logs for Shopify API errors
- Ensure metafield definitions exist

## License

MIT License
