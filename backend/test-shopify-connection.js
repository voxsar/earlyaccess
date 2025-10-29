#!/usr/bin/env node

/**
 * Test Shopify API Connection
 * Run this script to verify your Shopify API credentials are working
 */

require('dotenv').config();
const { shopifyApi, ApiVersion } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');

async function testShopifyConnection() {
	console.log('🔍 Testing Shopify API Connection...\n');

	// Check environment variables
	const requiredVars = [
		'SHOPIFY_API_KEY',
		'SHOPIFY_API_SECRET',
		'SHOPIFY_SHOP_DOMAIN',
		'SHOPIFY_ACCESS_TOKEN'
	];

	console.log('📋 Environment Variables:');
	const missingVars = [];

	requiredVars.forEach(varName => {
		const value = process.env[varName];
		if (value && value !== 'your_access_token_here') {
			console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
		} else {
			console.log(`❌ ${varName}: Not set or using placeholder`);
			missingVars.push(varName);
		}
	});

	if (missingVars.length > 0) {
		console.log(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`);
		console.log('\n📖 To fix this:');
		console.log('1. Go to your Shopify store admin');
		console.log('2. Navigate to Settings → Apps and sales channels');
		console.log('3. Click "Develop apps"');
		console.log('4. Create a private app with customer and product scopes');
		console.log('5. Copy the Admin API access token');
		console.log('6. Update your .env file with the token');
		return;
	}

	try {
		// Initialize Shopify API
		const shopify = shopifyApi({
			apiKey: process.env.SHOPIFY_API_KEY,
			apiSecretKey: process.env.SHOPIFY_API_SECRET,
			scopes: ['read_customers', 'write_customers', 'read_products'],
			hostName: process.env.SHOPIFY_SHOP_DOMAIN.replace('https://', '').replace('.myshopify.com', ''),
			apiVersion: ApiVersion.April24,
			isEmbeddedApp: false,
		});

		// Create GraphQL client
		const session = {
			shop: process.env.SHOPIFY_SHOP_DOMAIN.replace('https://', ''),
			accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
		};

		const client = new shopify.clients.Graphql({ session });

		// Test API call - get shop info
		console.log('\n🔄 Testing API call...');
		const response = await client.query({
			data: {
				query: `
                    query {
                        shop {
                            name
                            myshopifyDomain
                            plan {
                                displayName
                            }
                        }
                    }
                `
			}
		});

		if (response.body?.data?.shop) {
			const shop = response.body.data.shop;
			console.log('✅ Connection successful!');
			console.log(`🏪 Shop: ${shop.name}`);
			console.log(`🌐 Domain: ${shop.myshopifyDomain}`);
			console.log(`📋 Plan: ${shop.plan.displayName}`);
		} else {
			console.log('❌ API call failed - no shop data returned');
			console.log('Response:', JSON.stringify(response.body, null, 2));
		}

	} catch (error) {
		console.log('❌ Connection failed:');
		console.log(`Error: ${error.message}`);

		if (error.message.includes('access token')) {
			console.log('\n💡 This error suggests your access token is invalid or missing scopes.');
			console.log('   Make sure your private app has the required scopes enabled.');
		}
	}
}

// Run the test
testShopifyConnection().catch(console.error);