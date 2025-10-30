/**
 * Backend API Connector for Admin
 * Handles all API calls to the backend server
 */

const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';

/**
 * Get specific customer's wishlist (admin use)
 */
export async function getCustomerWishlist(customerId, sessionToken) {
	if (!sessionToken) {
		throw new Error('Session token is required for admin API calls');
	}

	// Extract numeric customer ID from Shopify GID format if needed
	const numericCustomerId = customerId.includes('gid://shopify/Customer/')
		? customerId.split('/').pop()
		: customerId;

	const response = await fetch(
		`${BACKEND_API_URL}/api/wishlist/customer/${numericCustomerId}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionToken}`,
			},
		}
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error?.message || 'Failed to get customer wishlist');
	}

	const data = await response.json();
	return data.data.items;
}
