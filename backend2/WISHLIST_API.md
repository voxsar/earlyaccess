# Wishlist API Documentation

This document describes the Laravel-based Wishlist API that replicates the functionality from the JavaScript backend.

## Overview

The Wishlist API allows Shopify apps to manage customer wishlists using Shopify's customer metafields. It provides endpoints to add, remove, and retrieve wishlist items with full product details.

## Authentication

All endpoints require Shopify app authentication using the `verify.shopify` middleware. The authenticated shop user must be available via `Auth::user()`.

## Base URL

All endpoints are prefixed with `/api/wishlist`

## Endpoints

### Add Product to Wishlist

**POST** `/api/wishlist/add`

Add a product to a customer's wishlist.

#### Request Body
```json
{
  "customerId": "gid://shopify/Customer/123456789",
  "productId": "gid://shopify/Product/987654321",
  "productHandle": "optional-product-handle"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "itemCount": 3,
    "wishlist": [
      "gid://shopify/Product/111",
      "gid://shopify/Product/222", 
      "gid://shopify/Product/987654321"
    ]
  }
}
```

### Remove Product from Wishlist

**POST** `/api/wishlist/remove`

Remove a product from a customer's wishlist.

#### Request Body
```json
{
  "customerId": "gid://shopify/Customer/123456789",
  "productId": "gid://shopify/Product/987654321"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "itemCount": 2,
    "wishlist": [
      "gid://shopify/Product/111",
      "gid://shopify/Product/222"
    ]
  }
}
```

### Clear Entire Wishlist

**POST** `/api/wishlist/clear`

Clear all products from a customer's wishlist.

#### Request Body
```json
{
  "customerId": "gid://shopify/Customer/123456789"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "itemCount": 0,
    "wishlist": []
  }
}
```

### Get Customer's Wishlist

**GET** `/api/wishlist/customer/{customerId}`

Get a customer's wishlist with full product details.

#### Response
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "gid://shopify/Product/111",
        "title": "Awesome T-Shirt",
        "handle": "awesome-t-shirt",
        "price": "29.99",
        "currency": "USD",
        "imageUrl": "https://cdn.shopify.com/...",
        "url": "https://shop.myshopify.com/products/awesome-t-shirt",
        "availableForSale": true,
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Get Wishlist Item Count

**GET** `/api/wishlist/customer/{customerId}/count`

Get the number of items in a customer's wishlist.

#### Response
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

### Check if Product is in Wishlist

**GET** `/api/wishlist/customer/{customerId}/product/{productId}`

Check if a specific product is in the customer's wishlist.

#### Response
```json
{
  "success": true,
  "data": {
    "isInWishlist": true
  }
}
```

### Get Current Customer's Wishlist

**GET** `/api/wishlist/current`

Get the current authenticated customer's wishlist. This endpoint expects the `customerId` to be provided via request parameter or session.

#### Request Parameters
```
customerId (optional): If not provided, will look in session
```

#### Response
Same as "Get Customer's Wishlist" endpoint.

## Error Responses

All endpoints return standardized error responses:

### Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Shop not authenticated"
  }
}
```

### Bad Request (400)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST", 
    "message": "Customer ID is required"
  }
}
```

### Validation Error (422)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "errors": {
      "customerId": ["The customer id field is required."]
    }
  }
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to add product to wishlist"
  }
}
```

## Implementation Details

### Architecture

The implementation follows a service-oriented architecture:

- **WishListController**: Handles HTTP requests, validation, and responses
- **WishlistService**: Contains business logic for wishlist operations
- **ShopifyService**: Handles GraphQL API interactions with Shopify

### Data Storage

Wishlists are stored as Shopify customer metafields:

- **Namespace**: `app`
- **Wishlist Key**: `wishlist`
- **Type**: `list.product_reference`
- **Timestamps Key**: `wishlist_timestamps`
- **Timestamps Type**: `json`

### Features

- ✅ Add/remove products from wishlist
- ✅ Get wishlist with full product details
- ✅ Track timestamps when products are added
- ✅ Clear entire wishlist
- ✅ Get wishlist item count
- ✅ Check if product is in wishlist
- ✅ Merge wishlists (service method available)
- ✅ Error handling and logging
- ✅ Input validation
- ✅ Standardized API responses

### Shopify API Requirements

The app requires the following Shopify API scopes:
- `read_customers`
- `write_customers` 
- `read_products`
- `write_customer_metafields`
- `read_customer_metafields`

### Usage Example

```javascript
// Frontend JavaScript example
async function addToWishlist(customerId, productId) {
  try {
    const response = await fetch('/api/wishlist/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        customerId: customerId,
        productId: productId
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Added to wishlist:', data.data);
      // Update UI with new item count
      updateWishlistUI(data.data.itemCount);
    } else {
      console.error('Error:', data.error.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

## Testing

Basic tests are included in `tests/Feature/WishlistTest.php` covering:
- Authentication requirements
- Input validation
- Route accessibility

Run tests with:
```bash
php artisan test --filter WishlistTest
```