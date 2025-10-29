/**
 * Mock Shopify Service for Development
 * Use this temporarily until you get a proper access token
 */

// Mock data for development
const mockCustomerMetafield = {
	id: 'gid://shopify/Metafield/123',
	value: '[]',
	type: 'json'
};

const mockProducts = [
	{
		id: 'gid://shopify/Product/123',
		title: 'Sample Product',
		handle: 'sample-product',
		onlineStoreUrl: 'https://artslab-plugin-test.myshopify.com/products/sample-product',
		priceRange: {
			minVariantPrice: {
				amount: '19.99',
				currencyCode: 'USD'
			}
		},
		featuredImage: {
			url: 'https://via.placeholder.com/300',
			altText: 'Sample product image'
		},
		availableForSale: true,
		totalInventory: 10
	}
];

const mockCustomer = {
	id: 'gid://shopify/Customer/123',
	email: 'customer@example.com',
	firstName: 'John',
	lastName: 'Doe'
};

/**
 * Mock get customer metafield
 */
async function getCustomerMetafield(customerId, namespace, key) {
	console.log(`🎭 MOCK: Getting metafield for customer ${customerId}`);

	// Simulate network delay
	await new Promise(resolve => setTimeout(resolve, 100));

	if (key === 'wishlist') {
		return mockCustomerMetafield;
	}

	return null;
}

/**
 * Mock update customer metafield
 */
async function updateCustomerMetafield(customerId, namespace, key, value, type) {
	console.log(`🎭 MOCK: Updating metafield for customer ${customerId}`, { namespace, key, value, type });

	// Simulate network delay
	await new Promise(resolve => setTimeout(resolve, 100));

	return {
		id: 'gid://shopify/Metafield/123',
		namespace,
		key,
		value
	};
}

/**
 * Mock get products by IDs
 */
async function getProductsByIds(productIds) {
	console.log(`🎭 MOCK: Getting products for IDs:`, productIds);

	// Simulate network delay
	await new Promise(resolve => setTimeout(resolve, 100));

	return productIds.map((id, index) => ({
		...mockProducts[0],
		id: id,
		title: `Product ${index + 1}`,
		handle: `product-${index + 1}`
	}));
}

/**
 * Mock get customer by ID
 */
async function getCustomerById(customerId) {
	console.log(`🎭 MOCK: Getting customer ${customerId}`);

	// Simulate network delay
	await new Promise(resolve => setTimeout(resolve, 100));

	return {
		...mockCustomer,
		id: customerId
	};
}

module.exports = {
	getCustomerMetafield,
	updateCustomerMetafield,
	getProductsByIds,
	getCustomerById,
};