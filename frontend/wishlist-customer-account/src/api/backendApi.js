/**
 * Backend API Connector
 * Handles all API calls to the backend server
 */

const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';

/**
 * Add product to wishlist
 */
export async function addToWishlist(customerId, productId, productHandle, shopUrl) {
	const response = await fetch(`${BACKEND_API_URL}/api/wishlist/add`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Customer-Id': customerId,
			'X-Shop-Domain': shopUrl,
		},
		body: JSON.stringify({
			productId,
			productHandle,
			shopUrl,
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
export async function removeFromWishlist(customerId, productId, shopUrl) {
	const response = await fetch(`${BACKEND_API_URL}/api/wishlist/remove`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Customer-Id': customerId,
			'X-Shop-Domain': shopUrl,
		},
		body: JSON.stringify({
			productId,
			shopUrl,
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
export async function getWishlist(customerId, sessionToken, shopUrl) {
	console.log('Fetching wishlist for customer ID:', customerId);

	const headers = {
		'Content-Type': 'application/json',
	};

	// Use session token if available (embedded app), otherwise fall back to customer ID
	if (sessionToken) {
		headers['Authorization'] = `Bearer ${sessionToken}`;
	} else {
		headers['X-Customer-Id'] = customerId;
	}

	// Add shop URL to headers
	if (shopUrl) {
		headers['X-Shop-Domain'] = shopUrl;
	}

	const response = await fetch(`${BACKEND_API_URL}/api/wishlist/current`, {
		method: 'GET',
		headers,
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		console.error('Wishlist fetch failed:', {
			status: response.status,
			statusText: response.statusText,
			error: errorData
		});
		throw new Error(`Failed to get wishlist: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data.data.items;
}

/**
 * Get specific customer's wishlist (admin use)
 */
export async function getCustomerWishlist(customerId, shopUrl) {
	const headers = {
		'Content-Type': 'application/json',
	};

	// Add shop URL to headers
	if (shopUrl) {
		headers['X-Shop-Domain'] = shopUrl;
	}

	const response = await fetch(
		`${BACKEND_API_URL}/api/wishlist/${customerId}`,
		{
			method: 'GET',
			headers,
		}
	);

	if (!response.ok) {
		throw new Error('Failed to get customer wishlist');
	}

	const data = await response.json();
	return data.data.items;
}
