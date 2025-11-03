# Testing Guide

This guide covers comprehensive testing of the Early Access + Wishlist Shopify App.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development Testing](#local-development-testing)
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing-optional)
- [Integration Testing](#integration-testing)
- [Error Testing](#error-testing)
- [Performance Testing](#performance-testing)
- [Bundle Size Verification](#bundle-size-verification)

## Prerequisites

- Backend server running
- Shopify development store configured
- Shopify CLI installed

## Backend Testing

### 1. Start Backend Server

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

Expected output:
```
🚀 Backend API server running on port 3000
📍 Environment: development
🏪 Shopify Store: your-store.myshopify.com
```

### 2. Test Health Endpoints

```bash
# Basic health check
curl http://localhost:3000/api/health

# Expected response:
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-29T00:00:00.000Z",
  "service": "earlyaccess-backend",
  "version": "1.0.0"
}

# Readiness check
curl http://localhost:3000/api/health/ready

# Expected response (if env vars set):
{
  "success": true,
  "status": "ready",
  "timestamp": "2025-10-29T00:00:00.000Z"
}
```

### 3. Test Wishlist Endpoints

**Add to Wishlist**:
```bash
curl -X POST http://localhost:3000/api/wishlist/add \
  -H "Content-Type: application/json" \
  -H "X-Customer-Id: gid://shopify/Customer/YOUR_CUSTOMER_ID" \
  -d '{
    "productId": "gid://shopify/Product/YOUR_PRODUCT_ID",
    "productHandle": "test-product"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "itemCount": 1,
    "wishlist": ["gid://shopify/Product/YOUR_PRODUCT_ID"]
  }
}
```

**Get Wishlist**:
```bash
curl http://localhost:3000/api/wishlist/current \
  -H "X-Customer-Id: gid://shopify/Customer/YOUR_CUSTOMER_ID"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "gid://shopify/Product/...",
        "title": "Product Name",
        "price": "29.99",
        "currency": "USD",
        "imageUrl": "https://...",
        "url": "/products/...",
        "availableForSale": true,
        "addedAt": "2025-10-29T00:00:00.000Z"
      }
    ]
  }
}
```

**Remove from Wishlist**:
```bash
curl -X POST http://localhost:3000/api/wishlist/remove \
  -H "Content-Type: application/json" \
  -H "X-Customer-Id: gid://shopify/Customer/YOUR_CUSTOMER_ID" \
  -d '{
    "productId": "gid://shopify/Product/YOUR_PRODUCT_ID"
  }'
```

### 4. Test Error Handling

**Missing Customer ID**:
```bash
curl -X POST http://localhost:3000/api/wishlist/add \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "gid://shopify/Product/123"
  }'
```

Expected response:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Customer authentication required"
  }
}
```

**Invalid Endpoint**:
```bash
curl http://localhost:3000/api/invalid
```

Expected response:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Endpoint not found"
  }
}
```

## Frontend Testing

### 1. Configure API URL

For local testing, update API URL in all frontend files to `http://localhost:3000`:

```javascript
// frontend/wishlist-button-theme/assets/wishlist-button.js
const BACKEND_API_URL = 'http://localhost:3000';

// frontend/wishlist-customer-account/src/api/backendApi.js
const BACKEND_API_URL = 'http://localhost:3000';

// frontend/wishlist-admin/src/api/backendApi.js
const BACKEND_API_URL = 'http://localhost:3000';
```

### 2. Start Shopify Development Server

```bash
# From root directory
npm run dev
```

### 3. Test Theme Extension

1. Open your development store
2. Go to Online Store > Themes
3. Click "Customize"
4. Add "Add to Wishlist" app block to a product page
5. Preview the page
6. Click the wishlist button
7. Verify:
   - Toast notification appears
   - Button state changes
   - Browser console shows successful API call
   - Backend logs show request

**Expected Console Log**:
```
POST http://localhost:3000/api/wishlist/add 200 OK
```

**Expected Backend Log**:
```
2025-10-29T00:00:00.000Z - POST /api/wishlist/add
```

### 4. Test Customer Account Extension

1. Click preview link for customer account extension
2. Log in as a test customer
3. Navigate to wishlist page
4. Verify:
   - Products load correctly
   - Product images display
   - Prices are formatted
   - Remove button works
   - Empty state shows when no items

**Browser Console Check**:
```javascript
// Should see successful API calls
GET http://localhost:3000/api/wishlist/current 200 OK
```

### 5. Test Admin Extension

1. Go to development store admin
2. Navigate to Customers
3. Select a customer with wishlist items
4. Scroll down to see "Customer Wishlist" block
5. Verify:
   - Wishlist items display
   - Product images load
   - Product links work
   - Stock status shows
   - Pricing displays

**Browser Console Check**:
```javascript
GET http://localhost:3000/api/wishlist/gid://shopify/Customer/123 200 OK
```

## Integration Testing

### End-to-End Wishlist Flow

1. **Add Product to Wishlist (Storefront)**
   - Navigate to product page
   - Click "Add to Wishlist" button
   - Verify toast notification
   - Check backend logs
   - Verify button state changes

2. **View Wishlist (Customer Account)**
   - Navigate to customer account
   - Open wishlist page
   - Verify product appears
   - Check product details are correct

3. **Remove Product (Customer Account)**
   - Click "Remove" button on product
   - Verify product is removed
   - Check empty state appears if no items left

4. **View in Admin**
   - Open customer details in admin
   - Verify wishlist block shows items
   - Check product links work

### Cross-Device Testing

1. Test on desktop browser
2. Test on mobile browser (responsive design)
3. Test on tablet
4. Verify all devices can:
   - Add to wishlist
   - View wishlist
   - Remove from wishlist

## Error Testing

### Backend Errors

**Test 1: Shopify API Failure**
- Temporarily use invalid Shopify credentials
- Attempt to add product to wishlist
- Verify error is handled gracefully
- Check error response format

**Test 2: Network Timeout**
- Simulate slow/failed network
- Verify timeout handling
- Check retry logic (if implemented)

**Test 3: Invalid Data**
- Send malformed product ID
- Verify validation errors
- Check error messages are clear

### Frontend Errors

**Test 1: Backend Unavailable**
- Stop backend server
- Attempt to use wishlist features
- Verify error messages display
- Check user experience

**Test 2: CORS Issues**
- Change backend CORS settings
- Attempt API calls
- Verify CORS errors are handled
- Check error messages

**Test 3: Authentication Failures**
- Use invalid customer ID
- Verify authentication errors
- Check error handling

## Performance Testing

### Load Testing

Use tools like `ab` (Apache Bench) or `wrk`:

```bash
# Install ab (if not installed)
sudo apt-get install apache2-utils

# Test health endpoint
ab -n 1000 -c 10 http://localhost:3000/api/health

# Test add to wishlist (with auth)
ab -n 100 -c 5 -T application/json -H "X-Customer-Id: gid://shopify/Customer/123" \
  -p post_data.json http://localhost:3000/api/wishlist/add
```

**Metrics to Check**:
- Requests per second
- Average response time
- Failed requests
- 95th percentile response time

### Frontend Performance

1. Open browser dev tools
2. Go to Network tab
3. Test wishlist operations
4. Verify:
   - API calls complete in < 500ms
   - Images load quickly
   - No memory leaks
   - Smooth UI updates

## Automated Testing

### Backend Unit Tests

Create test files in `backend/src/__tests__/`:

```javascript
// Example: backend/src/__tests__/wishlistService.test.js
const wishlistService = require('../services/wishlistService');

describe('Wishlist Service', () => {
  test('should add product to wishlist', async () => {
    const result = await wishlistService.addToWishlist(
      'gid://shopify/Customer/123',
      'gid://shopify/Product/456'
    );
    expect(result.itemCount).toBeGreaterThan(0);
  });
});
```

Run tests:
```bash
cd backend
npm test
```

### Frontend Tests

For React/Preact components, use testing libraries:

```bash
cd frontend/wishlist-customer-account
npm install --save-dev @testing-library/react @testing-library/preact
npm test
```

## Monitoring & Logging

### Backend Logs

Check logs for:
- API requests and responses
- Error messages
- Performance metrics
- Shopify API calls

```bash
# View logs in real-time
cd backend
npm run dev

# Logs should show:
2025-10-29T00:00:00.000Z - POST /api/wishlist/add
2025-10-29T00:00:00.000Z - GET /api/wishlist/current
```

### Browser Console

Monitor browser console for:
- API call successes/failures
- JavaScript errors
- Network issues
- Performance warnings

## Checklist

### Backend Tests
- [ ] Health check endpoint works
- [ ] Readiness check passes
- [ ] Add to wishlist succeeds
- [ ] Remove from wishlist succeeds
- [ ] Get wishlist returns data
- [ ] Error handling works
- [ ] Authentication validates
- [ ] CORS configured correctly

### Frontend Tests
- [ ] Theme extension loads
- [ ] Button adds to wishlist
- [ ] Button state updates
- [ ] Toast notifications work
- [ ] Customer account page loads
- [ ] Products display correctly
- [ ] Remove functionality works
- [ ] Admin block displays
- [ ] Admin links work

### Integration Tests
- [ ] End-to-end flow works
- [ ] Data syncs between frontend and backend
- [ ] Multi-device support
- [ ] Error handling is graceful
- [ ] Performance is acceptable

## Troubleshooting

### Common Issues

**Issue**: Backend won't start
- **Solution**: Check .env file exists and has all required variables
- **Solution**: Ensure port 3000 is available
- **Solution**: Check Node.js version (need 18+)

**Issue**: CORS errors in browser
- **Solution**: Verify ALLOWED_ORIGINS includes your store URL
- **Solution**: Check backend CORS middleware configuration
- **Solution**: Ensure frontend is making requests to correct URL

**Issue**: Extensions not loading
- **Solution**: Check `extensions` symlink exists
- **Solution**: Run `shopify app dev` from root directory
- **Solution**: Verify extension configurations are correct

**Issue**: API calls failing
- **Solution**: Check backend is running (if using backend API)
- **Solution**: Verify API URL in frontend code
- **Solution**: Check network tab in browser dev tools
- **Solution**: Review backend logs for errors (if using backend API)

## Bundle Size Verification

Shopify UI extensions have a 64 KB bundle size limit. Verify your extensions stay under this limit.

### 1. Build and Check Bundle Sizes
```bash
npm run dev
```

Look for output like:
```
✓ wishlist-admin: ~20 KB
✓ wishlist-fullpage: ~25 KB  
✓ wishlist-profile-block: ~10 KB
```

All should be **under 64 KB**.

### 2. Why Bundle Size Matters

Large bundles cause:
- Slower page load times
- Poor user experience
- Deployment failures
- Shopify will reject extensions over 64 KB

### 3. Common Causes of Large Bundles

- **Bundling React**: Ensure React is externalized
- **Large dependencies**: Remove unnecessary packages
- **Unused code**: Import only what you need
- **Large strings**: Minify GraphQL queries
- **Debug code**: Remove console.logs and comments

### 4. How to Reduce Bundle Size

**Check Dependencies**:
```bash
cd extensions/wishlist-admin
cat package.json
```

Should only have `@shopify/ui-extensions-react`, not explicit `react` or `react-reconciler`.

**Minify GraphQL Queries**:
```javascript
// Bad - 200 bytes
const query = `
  query GetCustomer($customerId: ID!) {
    customer(id: $customerId) {
      id
      email
      firstName
      lastName
      metafield(namespace: "app", key: "wishlist") {
        value
      }
    }
  }
`;

// Good - 100 bytes
const query = `query($customerId:ID!){customer(id:$customerId){metafield(namespace:"app",key:"wishlist"){value}}}`;
```

**Remove Unused Imports**:
```javascript
// Bad
import { useState, useEffect, useCallback, useMemo, useRef } from 'preact/hooks';

// Good - only import what you use
import { useState, useEffect } from 'preact/hooks';
```

### 5. Testing Bundle Optimization

After optimizations:
1. Clear node_modules cache: `rm -rf extensions/*/node_modules`
2. Reinstall: `cd extensions/wishlist-admin && npm install`
3. Build: `npm run dev` from root
4. Verify sizes are under 64 KB
5. Test functionality still works

### 6. Production Build Test

Test production build sizes:
```bash
shopify app deploy
```

Review sizes in deployment output. All must be under 64 KB for successful deployment.

## Next Steps

After testing locally:
1. Verify all tests pass
2. Check bundle sizes are acceptable
3. Update API URLs to production (if using backend)
4. Deploy backend to hosting platform (if using backend)
5. Deploy frontend via Shopify CLI: `shopify app deploy`
6. Test in production environment
7. Monitor for issues

## Support

For testing issues:
- Review backend logs
- Check browser console
- Verify network requests
- Test API endpoints directly with curl
- Check Shopify CLI output
