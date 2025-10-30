/**
 * Test Authorization Code Grant OAuth Flow
 * Tests the complete OAuth implementation
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const crypto = require('crypto');

// Check if required environment variables are set
const requiredEnvVars = ['SHOPIFY_API_SECRET', 'SHOPIFY_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
	console.log('⚠️  Warning: Missing environment variables:', missingEnvVars.join(', '));
	console.log('Some tests will be skipped. Please configure your .env file.\n');
}

// Helper function to verify HMAC
function verifyHmac(query, hmac) {
	const apiSecret = process.env.SHOPIFY_API_SECRET;
	if (!apiSecret) {
		throw new Error('SHOPIFY_API_SECRET not set');
	}
	
	const params = { ...query };
	delete params.hmac;
	delete params.signature;
	
	const sortedParams = Object.keys(params)
		.sort()
		.map(key => `${key}=${params[key]}`)
		.join('&');
	
	const hash = crypto
		.createHmac('sha256', apiSecret)
		.update(sortedParams)
		.digest('hex');
	
	return hash === hmac;
}

// Helper function to validate shop hostname
function isValidShopHostname(shop) {
	if (!shop) return false;
	// Shop must start with alphanumeric
	// Can contain alphanumeric and hyphens (but not at the end before .myshopify.com)
	const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]\.myshopify\.com$/;
	
	// Also allow single character shop names
	const singleCharRegex = /^[a-zA-Z0-9]\.myshopify\.com$/;
	
	return shopRegex.test(shop) || singleCharRegex.test(shop);
}

// Helper function to generate HMAC for testing
function generateHmac(params) {
	const apiSecret = process.env.SHOPIFY_API_SECRET;
	if (!apiSecret) {
		throw new Error('SHOPIFY_API_SECRET not set');
	}
	
	const sortedParams = Object.keys(params)
		.sort()
		.map(key => `${key}=${params[key]}`)
		.join('&');
	
	return crypto
		.createHmac('sha256', apiSecret)
		.update(sortedParams)
		.digest('hex');
}

console.log('🧪 Testing Authorization Code Grant Implementation\n');

// Test 1: HMAC Verification
console.log('Test 1: HMAC Verification');
if (process.env.SHOPIFY_API_SECRET) {
	const testParams = {
		code: '0907a61c0c8d55e99db179b68161bc00',
		shop: 'some-shop.myshopify.com',
		state: '0.6784241404160823',
		timestamp: '1337178173'
	};

	const testHmac = generateHmac(testParams);
	console.log('Generated HMAC:', testHmac);

	const isValid = verifyHmac(testParams, testHmac);
	console.log('HMAC Verification:', isValid ? '✅ PASS' : '❌ FAIL');

	// Test with invalid HMAC
	const invalidHmac = verifyHmac(testParams, 'invalid_hmac_value');
	console.log('Invalid HMAC rejection:', !invalidHmac ? '✅ PASS' : '❌ FAIL');
} else {
	console.log('⏭️  Skipped (SHOPIFY_API_SECRET not set)');
}

console.log('\n---\n');

// Test 2: Shop Hostname Validation
console.log('Test 2: Shop Hostname Validation');
const validShops = [
	'example.myshopify.com',
	'my-shop.myshopify.com',
	'shop123.myshopify.com',
	'a-b-c.myshopify.com'
];

const invalidShops = [
	'example.com',
	'https://example.myshopify.com',
	'-invalid.myshopify.com',
	'invalid-.myshopify.com',
	'shop..myshopify.com',
	'shop@test.myshopify.com',
	'../../../etc/passwd'
];

console.log('Valid shops:');
validShops.forEach(shop => {
	const result = isValidShopHostname(shop);
	console.log(`  ${shop}: ${result ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\nInvalid shops (should be rejected):');
invalidShops.forEach(shop => {
	const result = isValidShopHostname(shop);
	console.log(`  ${shop}: ${!result ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n---\n');

// Test 3: OAuth URL Generation
console.log('Test 3: OAuth URL Generation');
if (process.env.SHOPIFY_API_KEY) {
	const shop = process.env.SHOPIFY_SHOP_DOMAIN || 'example.myshopify.com';
	const nonce = crypto.randomBytes(32).toString('hex');
	const scopes = process.env.SHOPIFY_SCOPES || 'read_customers,write_customers,read_products';
	const redirectUri = process.env.SHOPIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
	const apiKey = process.env.SHOPIFY_API_KEY;

	const authUrl = `https://${shop}/admin/oauth/authorize?` +
		`client_id=${apiKey}&` +
		`scope=${scopes}&` +
		`redirect_uri=${encodeURIComponent(redirectUri)}&` +
		`state=${nonce}&` +
		`grant_options[]=offline`;

	console.log('Generated OAuth URL:');
	console.log(authUrl);
	console.log('\nURL Components:');
	console.log(`  Shop: ${shop}`);
	console.log(`  Client ID: ${apiKey.substring(0, 8)}...`); // Only log first 8 chars
	console.log(`  Scopes: ${scopes}`);
	console.log(`  Redirect URI: ${redirectUri}`);
	console.log(`  State/Nonce: ${nonce.substring(0, 16)}...`);
	console.log(`  Grant Type: offline (for long-lived access token)`);
} else {
	console.log('⏭️  Skipped (SHOPIFY_API_KEY not set)');
}

console.log('\n---\n');

// Test 4: Session Storage
console.log('Test 4: Session Storage');
const sessionStorage = require('./src/services/sessionStorage');

(async () => {
	try {
		// Test storing a session
		const testSession = {
			accessToken: 'shpat_test_token_12345',
			scope: 'read_customers,write_customers',
			shop: 'test-shop.myshopify.com',
			installedAt: new Date().toISOString()
		};

		console.log('Storing test session...');
		await sessionStorage.storeSession('test-shop.myshopify.com', testSession);
		console.log('✅ Session stored');

		// Test retrieving the session
		console.log('\nRetrieving test session...');
		const retrieved = await sessionStorage.getSession('test-shop.myshopify.com');
		
		if (retrieved && retrieved.accessToken === testSession.accessToken) {
			console.log('✅ Session retrieved successfully');
			console.log('Session data:', JSON.stringify(retrieved, null, 2));
		} else {
			console.log('❌ Session retrieval failed');
		}

		// Test deleting the session
		console.log('\nDeleting test session...');
		await sessionStorage.deleteSession('test-shop.myshopify.com');
		
		const deletedCheck = await sessionStorage.getSession('test-shop.myshopify.com');
		if (!deletedCheck) {
			console.log('✅ Session deleted successfully');
		} else {
			console.log('❌ Session deletion failed');
		}

	} catch (error) {
		console.error('❌ Session storage test failed:', error.message);
	}

	console.log('\n---\n');
	console.log('✅ All tests completed!\n');
	console.log('Next steps:');
	console.log('1. Configure your .env file with correct Shopify credentials');
	console.log('2. Update SHOPIFY_REDIRECT_URI in .env to match your server URL');
	console.log('3. Add the redirect URI to your Shopify app settings in Partner Dashboard');
	console.log('4. Start the server with: npm run dev');
	console.log('5. Visit: http://localhost:3000/api/auth/shopify?shop=your-store.myshopify.com');
})();
