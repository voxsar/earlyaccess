/**
 * Shopify Service
 * Handles interactions with Shopify Admin GraphQL API
 */
const { shopifyApi, ApiVersion } = require('@shopify/shopify-api');
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
		scopes: ['read_customers', 'write_customers', 'read_products'],
		hostName: shopDomain.replace('.myshopify.com', ''),
		apiVersion: ApiVersion.October24,
		isEmbeddedApp: false,
	});

	return shopify;
}

/**
 * Create GraphQL client
 */
function getGraphQLClient() {
	const shopifyInstance = ensureShopifyInitialized();

	const session = {
		shop: process.env.SHOPIFY_SHOP_DOMAIN,
		accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
	};

	return new shopifyInstance.clients.Graphql({ session });
}

/**
 * Get customer metafield
 */
async function getCustomerMetafield(customerId, namespace, key) {
	const client = getGraphQLClient();

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
		const response = await client.query({
			data: {
				query,
				variables: {
					customerId,
					namespace,
					key,
				},
			},
		});

		return response.body?.data?.customer?.metafield;
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
	type
) {
	const client = getGraphQLClient();

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
		const response = await client.query({
			data: {
				query: mutation,
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
			},
		});

		const errors = response.body?.data?.metafieldsSet?.userErrors;
		if (errors && errors.length > 0) {
			throw new Error(`Metafield update failed: ${errors[0].message}`);
		}

		return response.body?.data?.metafieldsSet?.metafields[0];
	} catch (error) {
		console.error('Error updating customer metafield:', error);
		throw error;
	}
}

/**
 * Get products by IDs
 */
async function getProductsByIds(productIds) {
	const client = getGraphQLClient();

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
		const response = await client.query({
			data: {
				query,
				variables: {
					ids: productIds,
				},
			},
		});

		return response.body?.data?.nodes || [];
	} catch (error) {
		console.error('Error getting products:', error);
		throw error;
	}
}

/**
 * Get customer by ID
 */
async function getCustomerById(customerId) {
	const client = getGraphQLClient();

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
		const response = await client.query({
			data: {
				query,
				variables: {
					customerId,
				},
			},
		});

		return response.body?.data?.customer;
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
