/**
 * Test Token Exchange Implementation
 * Run this to test the token exchange functionality
 */

const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Test configuration
const TEST_CONFIG = {
	backendUrl: 'http://localhost:3089',
	shopDomain: process.env.SHOPIFY_SHOP_DOMAIN || 'artslab-plugin-test.myshopify.com',
	apiKey: process.env.SHOPIFY_API_KEY,
	apiSecret: process.env.SHOPIFY_API_SECRET
};

/**
 * Create a mock session token for testing
 */
function createMockSessionToken() {
	const header = {
		alg: 'HS256',
		typ: 'JWT'
	};

	const payload = {
		iss: `https://${TEST_CONFIG.shopDomain}/admin`,
		dest: `https://${TEST_CONFIG.shopDomain}`,
		aud: TEST_CONFIG.apiKey,
		sub: '1', // User ID
		exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
		nbf: Math.floor(Date.now() / 1000),
		iat: Math.floor(Date.now() / 1000),
		jti: crypto.randomUUID(),
		sid: crypto.randomUUID()
	};

	const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

	const signature = crypto
		.createHmac('sha256', TEST_CONFIG.apiSecret)
		.update(`${encodedHeader}.${encodedPayload}`)
		.digest('base64url');

	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Test token exchange endpoint
 */
async function testTokenExchange() {
	console.log('🧪 Testing Token Exchange Implementation\n');

	try {
		// Create mock session token
		const sessionToken = createMockSessionToken();
		console.log('✓ Created mock session token');

		// Test token exchange auth middleware
		const response = await fetch(`${TEST_CONFIG.backendUrl}/api/wishlist/current`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json'
			}
		});

		console.log(`📡 Response status: ${response.status}`);

		const responseData = await response.json();
		console.log('📋 Response data:', JSON.stringify(responseData, null, 2));

		if (response.status === 401) {
			console.log('\n⚠️  Expected 401 - Token exchange requires actual Shopify session token');
			console.log('This test confirms the middleware is working but needs real App Bridge token');
		} else if (response.status === 200) {
			console.log('\n✅ Token exchange successful!');
		} else {
			console.log('\n❌ Unexpected response');
		}

	} catch (error) {
		console.error('❌ Test failed:', error.message);
	}
}

/**
 * Test authentication flow
 */
async function testAuthFlow() {
	console.log('\n🔐 Testing OAuth Authentication Flow\n');

	try {
		// Test auth verify endpoint
		const verifyResponse = await fetch(`${TEST_CONFIG.backendUrl}/api/auth/verify`);
		const verifyData = await verifyResponse.json();

		console.log('✓ Auth verify endpoint:', verifyData);

		// Test Shopify OAuth initiation (this will redirect)
		console.log(`\n🔗 OAuth URL: ${TEST_CONFIG.backendUrl}/api/auth/shopify?shop=${TEST_CONFIG.shopDomain}`);
		console.log('Visit this URL to initiate OAuth flow');

	} catch (error) {
		console.error('❌ Auth flow test failed:', error.message);
	}
}

/**
 * Test health endpoint
 */
async function testHealth() {
	console.log('\n🏥 Testing Health Endpoint\n');

	try {
		const response = await fetch(`${TEST_CONFIG.backendUrl}/api/health`);
		const data = await response.json();

		console.log('✓ Health check:', data);
		return response.status === 200;
	} catch (error) {
		console.error('❌ Health check failed:', error.message);
		return false;
	}
}

/**
 * Main test function
 */
async function runTests() {
	console.log('🚀 Starting Token Exchange Tests\n');
	console.log('Configuration:');
	console.log(`- Backend URL: ${TEST_CONFIG.backendUrl}`);
	console.log(`- Shop Domain: ${TEST_CONFIG.shopDomain}`);
	console.log(`- API Key: ${TEST_CONFIG.apiKey ? 'Set' : 'Not set'}`);
	console.log(`- API Secret: ${TEST_CONFIG.apiSecret ? 'Set' : 'Not set'}\n`);

	// Test basic connectivity
	const healthOk = await testHealth();
	if (!healthOk) {
		console.log('❌ Backend not responding, aborting tests');
		return;
	}

	// Test token exchange
	await testTokenExchange();

	// Test auth flow
	await testAuthFlow();

	console.log('\n🎉 Tests completed!');
	console.log('\nNext steps:');
	console.log('1. Update your frontend to send App Bridge session tokens');
	console.log('2. Use the OAuth flow for initial authentication');
	console.log('3. Test with real Shopify App Bridge session tokens');
}

// Run tests if called directly
if (require.main === module) {
	runTests().catch(console.error);
}

module.exports = {
	createMockSessionToken,
	testTokenExchange,
	testAuthFlow,
	runTests
};