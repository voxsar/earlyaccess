/**
 * Test Shopify Connection
 * This script helps verify your Shopify API configuration
 */

require('dotenv').config();
const { shopifyApi, ApiVersion } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');

async function testConnection() {
	console.log('🔍 Testing Shopify API connection...\n');

	// Check environment variables
	console.log('Environment Variables:');
	console.log('SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY ? '✓ Set' : '✗ Missing');
	console.log('SHOPIFY_API_SECRET:', process.env.SHOPIFY_API_SECRET ? '✓ Set' : '✗ Missing');
	console.log('SHOPIFY_SHOP_DOMAIN:', process.env.SHOPIFY_SHOP_DOMAIN);
	console.log('SHOPIFY_ACCESS_TOKEN:', process.env.SHOPIFY_ACCESS_TOKEN ? '✓ Set' : '✗ Missing');
	console.log('');

	if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET || !process.env.SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
		console.error('❌ Missing required environment variables!');
		process.exit(1);
	}

	try {
		// Initialize Shopify API
		const shopify = shopifyApi({
			apiKey: process.env.SHOPIFY_API_KEY,
			apiSecretKey: process.env.SHOPIFY_API_SECRET,
			scopes: ['read_customers', 'write_customers', 'read_products', 'write_customer_metafields', 'read_customer_metafields'],
			hostName: process.env.SHOPIFY_SHOP_DOMAIN.replace('.myshopify.com', ''),
			apiVersion: ApiVersion.April24,
			isEmbeddedApp: false,
		});

		// Create session
		const session = {
			shop: process.env.SHOPIFY_SHOP_DOMAIN,
			accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
		};

		// Test GraphQL client
		const client = new shopify.clients.Graphql({ session });

		// Simple test query to get shop info
		const query = `
            query {
                shop {
                    name
                    url
                    myshopifyDomain
                }
            }
        `;

		console.log('🔄 Testing GraphQL connection...');
		const response = await client.request(query);

		if (response.data && response.data.shop) {
			console.log('✅ Connection successful!');
			console.log('Shop Name:', response.data.shop.name);
			console.log('Shop URL:', response.data.shop.url);
			console.log('MyShopify Domain:', response.data.shop.myshopifyDomain);
		} else {
			console.log('⚠️  Unexpected response structure:', response);
		}

	} catch (error) {
		console.error('❌ Connection failed:', error.message);

		if (error.response) {
			console.error('Response Status:', error.response.code);
			console.error('Response Body:', error.response.body);
		}

		if (error.message.includes('401') || error.message.includes('Unauthorized')) {
			console.log('\n💡 Tips for fixing 401 Unauthorized errors:');
			console.log('1. Verify your SHOPIFY_ACCESS_TOKEN is correct');
			console.log('2. Check that your app has the required scopes');
			console.log('3. Ensure the access token hasn\'t expired');
			console.log('4. Verify the shop domain is correct');
		}
	}
}

testConnection();