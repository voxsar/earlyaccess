/**
 * Shopify Service
 * Handles interactions with Shopify Admin GraphQL API
 */
const { shopifyApi, ApiVersion } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
const path = require('path');

// Lazy-initialized Shopify API instance. This avoids initializing the
// library at module-import time (which can fail if environment variables
// haven't been loaded yet, e.g. when pm2 starts the process with a
// different working directory).
let shopify = null;

function ensureShopifyInitialized() {
	if (shopify) return shopify;

	const apiKey = process.env.SHOPIFY_API_KEY;
	const apiSecretKey = process.env.SHOPIFY_API_SECRET;
	const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;

	if (!apiKey || !apiSecretKey || !shopDomain) {
		// Don't throw during import; throw when someone actually tries to use
		// the client so the server can start and surface a clear runtime error.
		throw new Error(
			'Shopify API not configured. Ensure SHOPIFY_API_KEY, SHOPIFY_API_SECRET and SHOPIFY_SHOP_DOMAIN are set before calling Shopify API methods.'
		);
	}

	shopify = shopifyApi({
		apiKey,
		apiSecretKey,
		scopes: ['read_customers', 'write_customers', 'read_products', 'write_customer_metafields', 'read_customer_metafields'],
		hostName: shopDomain.replace('.myshopify.com', ''),
		apiVersion: ApiVersion.April24,
		isEmbeddedApp: true, // Enable token exchange for embedded apps
	});

	return shopify;
}

/**
 * Create GraphQL client with session from token exchange
 */
function getGraphQLClient(session) {
	const shopifyInstance = ensureShopifyInitialized();

	if (!session) {
		throw new Error('Shopify session is required. Ensure token exchange middleware is used.');
	}

	if (!session.accessToken || !session.shop) {
		throw new Error('Invalid session: missing accessToken or shop');
	}

	console.log('🔗 Creating GraphQL client for shop:', session.shop);

	return new shopifyInstance.clients.Graphql({ session });
}

/**
 * Create GraphQL client with static token (fallback for development)
 */
function getGraphQLClientStatic() {
	const shopifyInstance = ensureShopifyInitialized();

	const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
	if (!accessToken) {
		throw new Error('SHOPIFY_ACCESS_TOKEN environment variable is required');
	}

	if (!accessToken.startsWith('shpat_')) {
		console.warn('⚠️  Access token should start with "shpat_". Current token may be invalid.');
	}

	const session = {
		shop: process.env.SHOPIFY_SHOP_DOMAIN,
		accessToken: accessToken,
	};

	console.log('🔗 Creating static GraphQL client for shop:', session.shop);

	return new shopifyInstance.clients.Graphql({ session });
}

/**
 * Get customer metafield
 */
async function getCustomerMetafield(customerId, namespace, key, session = null) {
	const client = session ? getGraphQLClient(session) : getGraphQLClientStatic();

	const query = `
    query getCustomerMetafield($customerId: ID!, $namespace: String!, $key: String!) {
      customer(id: $customerId) {
        id
        metafield(namespace: $namespace, key: $key) {
          id
          value
          type
        }
      }
    }
  `;

	try {
		const response = await client.request(query, {
			variables: {
				customerId,
				namespace,
				key,
			},
		});

		return response.data?.customer?.metafield;
	} catch (error) {
		console.error('Error getting customer metafield:', error);
		throw error;
	}
}

/**
 * Update customer metafield
 */
async function updateCustomerMetafield(
	customerId,
	namespace,
	key,
	value,
	type,
	session = null
) {
	const client = session ? getGraphQLClient(session) : getGraphQLClientStatic();

	const mutation = `
    mutation updateCustomerMetafield($metafields: [MetafieldsSetInput!]!) {
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
  `;

	try {
		const response = await client.request(mutation, {
			variables: {
				metafields: [
					{
						ownerId: customerId,
						namespace,
						key,
						value,
						type,
					},
				],
			},
		});

		const errors = response.data?.metafieldsSet?.userErrors;
		if (errors && errors.length > 0) {
			throw new Error(`Metafield update failed: ${errors[0].message}`);
		}

		return response.data?.metafieldsSet?.metafields[0];
	} catch (error) {
		console.error('Error updating customer metafield:', error);
		throw error;
	}
}

/**
 * Get products by IDs
 */
async function getProductsByIds(productIds, session = null) {
	const client = session ? getGraphQLClient(session) : getGraphQLClientStatic();

	const query = `
    query getProducts($ids: [ID!]!) {
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
          }
          featuredImage {
            url
            altText
          }
          availableForSale
          totalInventory
        }
      }
    }
  `;

	try {
		const response = await client.request(query, {
			variables: {
				ids: productIds,
			},
		});

		return response.data?.nodes || [];
	} catch (error) {
		console.error('Error getting products:', error);
		throw error;
	}
}

/**
 * Get customer by ID
 */
async function getCustomerById(customerId, session = null) {
	const client = session ? getGraphQLClient(session) : getGraphQLClientStatic();

	const query = `
    query getCustomer($customerId: ID!) {
      customer(id: $customerId) {
        id
        email
        firstName
        lastName
      }
    }
  `;

	try {
		const response = await client.request(query, {
			variables: {
				customerId,
			},
		});

		return response.data?.customer;
	} catch (error) {
		console.error('Error getting customer:', error);
		throw error;
	}
}

module.exports = {
	getCustomerMetafield,
	updateCustomerMetafield,
	getProductsByIds,
	getCustomerById,
};
