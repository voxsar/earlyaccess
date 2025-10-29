/**
 * Backend API Connector
 * Handles all API calls to the backend server
 */

const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';

/**
 * Add product to wishlist
 */
export async function addToWishlist(customerId, productId, productHandle) {
  const response = await fetch(`${BACKEND_API_URL}/api/wishlist/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Customer-Id': customerId,
    },
    body: JSON.stringify({
      productId,
      productHandle,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add to wishlist');
  }

  return response.json();
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(customerId, productId) {
  const response = await fetch(`${BACKEND_API_URL}/api/wishlist/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Customer-Id': customerId,
    },
    body: JSON.stringify({
      productId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to remove from wishlist');
  }

  return response.json();
}

/**
 * Get current customer's wishlist
 */
export async function getWishlist(customerId) {
  const response = await fetch(`${BACKEND_API_URL}/api/wishlist/current`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Customer-Id': customerId,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get wishlist');
  }

  const data = await response.json();
  return data.data.items;
}

/**
 * Get specific customer's wishlist (admin use)
 */
export async function getCustomerWishlist(customerId) {
  const response = await fetch(
    `${BACKEND_API_URL}/api/wishlist/${customerId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get customer wishlist');
  }

  const data = await response.json();
  return data.data.items;
}
