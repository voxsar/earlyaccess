# Unified Wishlist Component - Theme App Block

A comprehensive wishlist component that can function as both a regular product button and a floating site-wide button with popup interface.

## Features

### 🎯 **Floating Button**
- Hovers on the side of the page (left or right)
- Configurable position (top, center, bottom)
- Adjustable horizontal and vertical offsets
- Real-time wishlist count badge
- Responsive design that adapts to mobile devices

### 📋 **Wishlist Popup**
- Clean, modern popup interface
- Product listing with full details:
  - Product name
  - Added date (DD MMM, YYYY format)
  - Main product image
  - Product price with currency formatting
  - Add to cart and remove buttons

### 🛒 **Functionality**
- **Individual Actions**: Add to cart or remove items individually
- **Bulk Actions**: 
  - "Add All to Cart" - adds all available products to cart
  - "Remove All" - clears the entire wishlist
- **Real-time Updates**: Automatically syncs with backend API
- **Error Handling**: Graceful error handling with user feedback
- **Toast Notifications**: Success and error messages

### ⚙️ **Configuration Options**

#### Position Settings
- **Horizontal Position**: Left or Right side
- **Vertical Position**: Top, Center, or Bottom
- **Horizontal Offset**: 0-100px adjustable spacing from edge
- **Vertical Offset**: 0-200px adjustable spacing from top/bottom

#### Styling Options
- **Button Text**: Customizable button label
- **Background Color**: Button background color
- **Text Color**: Button text and icon color
- **Hover Color**: Button hover state color

## Installation

1. The unified component files are created in the theme extension:
   - `blocks/wishlist-unified.liquid` - Dual-mode component
   - `assets/wishlist-unified.css` - Unified styling
   - `assets/wishlist-unified.js` - Complete functionality

2. The extension is configured in `shopify.extension.toml` as a single theme extension

3. Deploy the extension to your Shopify app

## Usage

### For Merchants
1. Install the app in your Shopify store
2. Go to **Themes → Customize**
3. Add **"Wishlist Component"** block to any section
4. Choose **Display Mode**:
   - **Regular Button**: For product pages (add to wishlist)
   - **Floating Button**: For site-wide wishlist access with popup
5. Configure the position and styling options based on chosen mode
6. Save the changes

### For Customers
1. The floating button appears on all pages when logged in
2. Click the button to open the wishlist popup
3. View, manage, and interact with wishlist items
4. Add items to cart or remove them from the wishlist
5. Use bulk actions to manage multiple items at once

## Technical Details

### API Integration
- Connects to the Laravel backend API
- Endpoints used:
  - `GET /api/wishlist/customer/{customerId}` - Fetch wishlist items
  - `GET /api/wishlist/customer/{customerId}/count` - Get item count
  - `POST /api/wishlist/remove` - Remove items
  - `POST /api/wishlist/clear` - Clear entire wishlist

### Data Structure
Each wishlist item includes:
```javascript
{
  productId: "gid://shopify/Product/123",
  title: "Product Name",
  handle: "product-handle",
  price: "29.99",
  currency: "USD",
  imageUrl: "https://cdn.shopify.com/...",
  url: "https://shop.myshopify.com/products/...",
  availableForSale: true,
  addedAt: "2024-01-15T10:30:00.000Z"
}
```

### Browser Compatibility
- Modern browsers with ES6+ support
- Graceful fallbacks for older browsers
- Responsive design for mobile devices

### Performance
- Lazy loading of popup content
- Efficient API calls with caching
- Optimized animations and transitions
- Minimal DOM manipulation

## Customization

### CSS Variables
The component uses CSS custom properties for easy theming:
```css
--floating-position-side: left|right
--floating-position-vertical: top|center|bottom
--floating-offset-horizontal: 20px
--floating-offset-vertical: 50px
--button-bg-color: #000000
--button-text-color: #ffffff
--button-hover-bg-color: #333333
```

### JavaScript Events
Listen for wishlist changes:
```javascript
window.addEventListener('wishlist:change', (e) => {
  const { action, productId } = e.detail;
  // Handle wishlist changes
});
```

### Styling Override
Add custom CSS to further customize the appearance:
```css
.wishlist-floating-button {
  /* Your custom styles */
}

.wishlist-popup {
  /* Your custom popup styles */
}
```

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support (ESC to close)
- Focus management in popup
- High contrast support
- Semantic HTML structure

## Mobile Responsiveness

- Button text hides on mobile to save space
- Popup adapts to smaller screens
- Touch-friendly button sizes
- Optimized layout for mobile devices

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari 12+, Chrome Mobile 70+)

## Troubleshooting

### Button Not Appearing
- Check if customer is logged in
- Verify app embed is enabled in theme customizer
- Check browser console for JavaScript errors

### API Errors
- Verify backend API is running and accessible
- Check CORS settings
- Verify customer ID is valid

### Styling Issues
- Check CSS custom properties are being applied
- Verify theme doesn't override styles
- Check responsive breakpoints

## Development Notes

- Uses vanilla JavaScript (no framework dependencies)
- Modular class-based architecture
- Follows Shopify app extension best practices
- Comprehensive error handling and logging
- Performance optimized with minimal DOM queries