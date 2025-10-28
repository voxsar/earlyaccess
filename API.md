# API Documentation - Early Access + Wishlist App

## Overview

This document describes the API interactions and data flow for the Wishlist app.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Shopify Store                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  Theme          │  │  Customer        │  │  Admin       │ │
│  │  Extension      │  │  Account         │  │  Extension   │ │
│  │  (Storefront)   │  │  Extension       │  │              │ │
│  └────────┬────────┘  └────────┬─────────┘  └──────┬───────┘ │
│           │                     │                    │         │
│           └─────────────────────┼────────────────────┘         │
│                                 │                              │
│                    ┌────────────▼──────────────┐              │
│                    │   Customer Metafields     │              │
│                    │   - app.wishlist          │              │
│                    │   - app.wishlist_timestamps│             │
│                    └───────────────────────────┘              │
│                                                                 │
│           ┌─────────────────────────────────────────────────┐ │
│           │         Shopify APIs                            │ │
│           │  - Admin GraphQL API                            │ │
│           │  - Storefront API                               │ │
│           │  - Customer Account API                         │ │
│           └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Models

### Customer Wishlist Metafield

**Namespace**: `app`  
**Key**: `wishlist`  
**Type**: `list.product_reference`

Stores an array of product IDs (gid://shopify/Product/XXXXX format).

**Example Value**:
```json
[
  "gid://shopify/Product/7234567890",
  "gid://shopify/Product/7234567891",
  "gid://shopify/Product/7234567892"
]
```

**Access**:
- Customer: Read/Write
- Admin: Read/Write

### Wishlist Timestamps Metafield

**Namespace**: `app`  
**Key**: `wishlist_timestamps`  
**Type**: `json`

Stores when each product was added to the wishlist.

**Example Value**:
```json
{
  "gid://shopify/Product/7234567890": "2025-10-28T10:30:00Z",
  "gid://shopify/Product/7234567891": "2025-10-27T15:45:00Z",
  "gid://shopify/Product/7234567892": "2025-10-26T09:20:00Z"
}
```

**Access**:
- Customer: Read
- Admin: Read

## API Endpoints

### Theme Extension API (Future Implementation)

These endpoints would be implemented in your app's backend:

#### Add to Wishlist
```
POST /apps/wishlist/api/add
```

**Request Body**:
```json
{
  "productId": "gid://shopify/Product/7234567890",
  "productHandle": "cool-t-shirt"
}
```

**Response**:
```json
{
  "success": true,
  "wishlist": [
    "gid://shopify/Product/7234567890",
    "gid://shopify/Product/7234567891"
  ]
}
```

#### Remove from Wishlist
```
POST /apps/wishlist/api/remove
```

**Request Body**:
```json
{
  "productId": "gid://shopify/Product/7234567890"
}
```

**Response**:
```json
{
  "success": true,
  "wishlist": [
    "gid://shopify/Product/7234567891"
  ]
}
```

#### Get Wishlist
```
GET /apps/wishlist/api/list
```

**Response**:
```json
{
  "success": true,
  "wishlist": [
    {
      "productId": "gid://shopify/Product/7234567890",
      "addedAt": "2025-10-28T10:30:00Z"
    },
    {
      "productId": "gid://shopify/Product/7234567891",
      "addedAt": "2025-10-27T15:45:00Z"
    }
  ]
}
```

## GraphQL Queries

### Customer Account API

#### Get Customer Wishlist
```graphql
query GetCustomerWishlist {
  customer {
    id
    email
    firstName
    lastName
    metafield(namespace: "app", key: "wishlist") {
      id
      value
      type
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "customer": {
      "id": "gid://shopify/Customer/5678901234",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "metafield": {
        "id": "gid://shopify/Metafield/1234567890",
        "value": "[\"gid://shopify/Product/7234567890\",\"gid://shopify/Product/7234567891\"]",
        "type": "list.product_reference"
      }
    }
  }
}
```

#### Update Customer Wishlist
```graphql
mutation UpdateCustomerWishlist($customerId: ID!, $metafields: [MetafieldsSetInput!]!) {
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

**Variables**:
```json
{
  "customerId": "gid://shopify/Customer/5678901234",
  "metafields": [
    {
      "ownerId": "gid://shopify/Customer/5678901234",
      "namespace": "app",
      "key": "wishlist",
      "value": "[\"gid://shopify/Product/7234567890\"]",
      "type": "list.product_reference"
    }
  ]
}
```

### Storefront API

#### Get Products by IDs
```graphql
query GetWishlistProducts($ids: [ID!]!) {
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
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
        width
        height
      }
      availableForSale
      totalInventory
      variants(first: 1) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
    }
  }
}
```

**Variables**:
```json
{
  "ids": [
    "gid://shopify/Product/7234567890",
    "gid://shopify/Product/7234567891"
  ]
}
```

### Admin API

#### Get Customer with Wishlist
```graphql
query GetCustomerWishlist($customerId: ID!) {
  customer(id: $customerId) {
    id
    email
    firstName
    lastName
    metafield(namespace: "app", key: "wishlist") {
      id
      value
      type
    }
  }
}
```

#### Get Products (Admin)
```graphql
query GetProducts($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      title
      handle
      status
      vendor
      productType
      tags
      featuredImage {
        url
        altText
      }
      priceRangeV2 {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      totalInventory
      totalVariants
      createdAt
      updatedAt
    }
  }
}
```

## Events

### Browser Events

The app dispatches custom events that other scripts can listen to:

#### Wishlist Change Event
```javascript
window.addEventListener('wishlist:change', (event) => {
  console.log('Action:', event.detail.action); // 'added' or 'removed'
  console.log('Product ID:', event.detail.productId);
});
```

**Event Detail**:
```javascript
{
  action: 'added' | 'removed',
  productId: 'gid://shopify/Product/7234567890'
}
```

## Error Handling

### API Error Responses

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Customer not logged in
- `PRODUCT_NOT_FOUND` - Product doesn't exist
- `METAFIELD_UPDATE_FAILED` - Failed to update metafield
- `INVALID_REQUEST` - Missing or invalid parameters
- `RATE_LIMIT_EXCEEDED` - Too many requests

### GraphQL Errors

GraphQL queries return errors in the `userErrors` field:

```json
{
  "data": {
    "metafieldsSet": {
      "metafields": null,
      "userErrors": [
        {
          "field": ["metafields", "0", "value"],
          "message": "Value is not a valid JSON string"
        }
      ]
    }
  }
}
```

## Rate Limits

### Storefront API
- 2 requests per second per IP
- Burst allowance: 60 requests

### Admin API
- Bucket size: 40
- Leak rate: 2 per second
- Maximum burst: 40 requests

### Customer Account API
- 10 requests per second per customer
- Burst allowance: 100 requests

## Security

### Authentication

- **Theme Extension**: Uses customer session cookies
- **Customer Account Extension**: Authenticated via customer account login
- **Admin Extension**: Authenticated via admin session

### Authorization

Access is controlled via metafield access settings:

```toml
[customer.metafields.app.wishlist]
access.customer_account = "read_write"
access.admin = "merchant_read_write"
```

### Data Validation

- Product IDs are validated before storage
- JSON values are parsed and validated
- Invalid data is rejected with appropriate errors

## Performance Considerations

### Caching

- Theme extension uses localStorage for quick UI updates
- Customer account extension queries only when page loads
- Admin extension caches results per customer page view

### Optimization

- Batch product queries when possible
- Limit wishlist size (recommend max 100 items)
- Use pagination for large wishlists
- Implement debouncing for rapid add/remove actions

## Future API Endpoints

### Early Access (Planned)

```
POST /apps/wishlist/api/early-access/create
GET /apps/wishlist/api/early-access/{pageId}
PUT /apps/wishlist/api/early-access/{pageId}
DELETE /apps/wishlist/api/early-access/{pageId}
```

### Analytics (Planned)

```
GET /apps/wishlist/api/analytics/popular-products
GET /apps/wishlist/api/analytics/customer-insights
GET /apps/wishlist/api/analytics/conversion-rates
```

## Webhooks (Future)

### Customer Update
Triggered when customer wishlist changes.

```json
{
  "customerId": "gid://shopify/Customer/5678901234",
  "wishlistSize": 5,
  "action": "added",
  "productId": "gid://shopify/Product/7234567890"
}
```

### Product Update
Triggered when a wishlisted product changes.

```json
{
  "productId": "gid://shopify/Product/7234567890",
  "changeType": "price_changed",
  "affectedCustomers": 25
}
```

## Testing

### Test Queries

Use Shopify GraphiQL to test queries:
- Admin API: `https://your-store.myshopify.com/admin/api/graphql.json`
- Storefront API: `https://your-store.myshopify.com/api/2025-10/graphql.json`

### Sample Customer IDs

For testing, create test customers and note their GIDs:
```
gid://shopify/Customer/5678901234
```

### Sample Product IDs

Note product IDs from your development store:
```
gid://shopify/Product/7234567890
```

## Support

For API questions:
- Review [Shopify API documentation](https://shopify.dev/docs/api)
- Check [GraphQL Admin API reference](https://shopify.dev/docs/api/admin-graphql)
- See [Storefront API reference](https://shopify.dev/docs/api/storefront)
