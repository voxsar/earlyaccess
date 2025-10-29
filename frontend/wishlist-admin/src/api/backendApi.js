/**
 * Backend API Connector for Admin
 * Handles all API calls to the backend server
 */

const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';

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
