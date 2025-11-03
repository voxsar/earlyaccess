# Unified Wishlist Component - Usage Guide

## Overview

The **Wishlist Component** is a unified theme app block that can function in two different modes:

1. **Regular Button Mode** - Traditional add-to-wishlist button for product pages
2. **Floating Button Mode** - Site-wide floating button with full popup interface

## 🔧 Setup Instructions

### Step 1: Deploy the Extension
The extension has been successfully deployed as **earlyaccess-wishlist-26**.

### Step 2: Merchant Configuration

#### For Regular Wishlist Button (Product Pages):
1. Go to **Themes → Customize**
2. Navigate to a **Product template**
3. Add **"Wishlist Component"** block to any section
4. In block settings, set **Display Mode** to **"Regular Button"**
5. Configure:
   - Button text ("Add to Wishlist")
   - Button text when added ("Added to Wishlist")
   - Show heart icon (checkbox)
   - Button style (Primary/Secondary/Outline)
   - Button color
   - Icon color

#### For Floating Wishlist Button (Site-wide):
1. Go to **Themes → Customize**
2. Navigate to any template (recommended: theme.liquid or index)
3. Add **"Wishlist Component"** block to any section
4. In block settings, set **Display Mode** to **"Floating Button"**
5. Configure Position:
   - Horizontal Position (Left/Right)
   - Vertical Position (Top/Center/Bottom)
   - Horizontal Offset (0-100px)
   - Vertical Offset (0-200px)
6. Configure Style:
   - Floating button text ("My Wishlist")
   - Background color
   - Text color
   - Hover color

## 📱 Customer Experience

### Regular Button Mode:
- Button appears on product pages only
- Customers can add/remove products to/from wishlist
- Shows "Add to Wishlist" or "Added to Wishlist" states
- Requires customer login
- Works with existing wishlist backend

### Floating Button Mode:
- Button hovers on chosen corner of all pages
- Shows live wishlist count badge
- Click opens popup with full wishlist
- Popup shows:
  - Product name (clickable link)
  - Added date (DD MMM, YYYY)
  - Product image
  - Product price
  - Individual "Add to Cart" and "Remove" buttons
  - Bulk "Add All to Cart" and "Remove All" actions

## 🛠️ Technical Details

### Files Structure:
```
blocks/
├── wishlist-button.liquid     (Original button - kept for compatibility)
└── wishlist-unified.liquid    (New unified component)

assets/
├── wishlist-button.css        (Original styles)
├── wishlist-button.js         (Original functionality)
├── wishlist-unified.css       (Unified styles)
└── wishlist-unified.js        (Unified functionality)
```

### API Integration:
Both modes use the same Laravel backend endpoints:
- `POST /api/wishlist/add` - Add product to wishlist
- `POST /api/wishlist/remove` - Remove product from wishlist
- `GET /api/wishlist/customer/{id}` - Get wishlist with full product details
- `GET /api/wishlist/customer/{id}/count` - Get wishlist count
- `POST /api/wishlist/clear` - Clear entire wishlist

### Browser Compatibility:
- Modern browsers with ES6+ support
- Responsive design for mobile devices
- Accessibility features (ARIA labels, keyboard navigation)

## 🎨 Customization Options

### CSS Variables (Floating Mode):
```css
--floating-position-side: left|right
--floating-position-vertical: top|center|bottom
--floating-offset-horizontal: 20px
--floating-offset-vertical: 50px
--button-bg-color: #000000
--button-text-color: #ffffff
--button-hover-bg-color: #333333
```

### CSS Variables (Regular Mode):
```css
--button-color: #000000
--icon-color: #ff0000
```

## 📋 Best Practices

### For Regular Button Mode:
- Use on product pages for adding individual products
- Place near the "Add to Cart" button
- Keep consistent with your theme's button styling

### For Floating Button Mode:
- Use only once per site (avoid multiple floating buttons)
- Position where it won't interfere with important content
- Consider mobile experience when positioning
- Test on different screen sizes

## 🔄 Migration from Separate Components

If you were previously using separate wishlist buttons:
1. Remove old wishlist button blocks
2. Add the new **"Wishlist Component"** 
3. Choose appropriate display mode for each location
4. Reconfigure settings as needed

## 🚀 Advanced Features

### Event System:
The component dispatches custom events:
```javascript
// Listen for wishlist changes
window.addEventListener('wishlist:change', (e) => {
  const { action, productId } = e.detail;
  // action: 'added', 'removed', 'cleared'
});
```

### Local Storage Sync:
- Maintains local storage for offline functionality
- Syncs with backend when available
- Provides immediate UI feedback

### Error Handling:
- Graceful API failure handling
- User-friendly error messages
- Automatic retry mechanisms

## 📞 Support

If you encounter any issues:
1. Check browser console for JavaScript errors
2. Verify customer login status
3. Confirm backend API accessibility
4. Test with different products and customers

The unified component provides a complete wishlist solution that can adapt to different use cases while maintaining a consistent user experience.