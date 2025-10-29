/**
 * OAuth and Authentication routes
 * Implements Shopify Authorization Code Grant flow
 * https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/authorization-code-grant
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const sessionStorage = require('../services/sessionStorage');
// Node.js 18+ has built-in fetch

/**
 * Verify HMAC signature from Shopify
 * Step 1: Verify the installation request
 */
function verifyHmac(query, hmac) {
	const apiSecret = process.env.SHOPIFY_API_SECRET;
	
	// Create a copy of query params without hmac and signature
	const params = { ...query };
	delete params.hmac;
	delete params.signature;
	
	// Sort parameters alphabetically and build query string
	const sortedParams = Object.keys(params)
		.sort()
		.map(key => `${key}=${params[key]}`)
		.join('&');
	
	// Generate HMAC-SHA256 hash
	const hash = crypto
		.createHmac('sha256', apiSecret)
		.update(sortedParams)
		.digest('hex');
	
	// Use constant-time comparison to prevent timing attacks
	return crypto.timingSafeEqual(
		Buffer.from(hash, 'utf8'),
		Buffer.from(hmac, 'utf8')
	);
}

/**
 * Validate shop hostname
 * Step 3: Validate authorization code
 */
function isValidShopHostname(shop) {
	if (!shop) return false;
	
	// Shop must end with .myshopify.com
	// Must start with alphanumeric
	// Can contain alphanumeric, hyphens (but not at the end before .myshopify.com)
	const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]\.myshopify\.com$/;
	
	// Also allow single character shop names
	const singleCharRegex = /^[a-zA-Z0-9]\.myshopify\.com$/;
	
	return shopRegex.test(shop) || singleCharRegex.test(shop);
}

/**
 * GET /api/auth/shopify
 * Initiate Shopify OAuth flow
 * Step 2: Request authorization code
 */
router.get('/shopify', (req, res) => {
	const { shop, hmac, timestamp } = req.query;

	if (!shop) {
		return res.status(400).json({
			success: false,
			error: {
				code: 'MISSING_SHOP',
				message: 'Shop parameter is required'
			}
		});
	}

	// Validate shop hostname
	if (!isValidShopHostname(shop)) {
		return res.status(400).json({
			success: false,
			error: {
				code: 'INVALID_SHOP',
				message: 'Invalid shop hostname'
			}
		});
	}

	// Verify HMAC if present (for installation requests)
	if (hmac) {
		try {
			const isValid = verifyHmac(req.query, hmac);
			if (!isValid) {
				return res.status(401).json({
					success: false,
					error: {
						code: 'INVALID_HMAC',
						message: 'HMAC verification failed'
					}
				});
			}
		} catch (error) {
			console.error('HMAC verification error:', error);
			return res.status(401).json({
				success: false,
				error: {
					code: 'HMAC_ERROR',
					message: 'Failed to verify HMAC'
				}
			});
		}
	}

	// Generate nonce (state parameter) for security
	const nonce = crypto.randomBytes(32).toString('hex');
	
	// Store nonce in session for verification
	req.session.nonce = nonce;
	req.session.shop = shop;
	
	// Set signed cookie with nonce for additional security
	res.cookie('shopify_nonce', nonce, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		signed: true,
		maxAge: 10 * 60 * 1000 // 10 minutes
	});

	const scopes = process.env.SHOPIFY_SCOPES || 'read_customers,write_customers,read_products,write_customer_metafields,read_customer_metafields';
	const redirectUri = process.env.SHOPIFY_REDIRECT_URI || `${process.env.APPLICATION_URL || 'http://localhost:3000'}/api/auth/callback`;
	const apiKey = process.env.SHOPIFY_API_KEY;

	// Build authorization URL
	const authUrl = `https://${shop}/admin/oauth/authorize?` +
		`client_id=${apiKey}&` +
		`scope=${scopes}&` +
		`redirect_uri=${encodeURIComponent(redirectUri)}&` +
		`state=${nonce}&` +
		`grant_options[]=offline`; // Request offline access token

	console.log(`🔐 Initiating OAuth flow for shop: ${shop}`);
	res.redirect(authUrl);
});

/**
 * GET /api/auth/callback
 * Handle Shopify OAuth callback
 * Step 3: Validate authorization code
 * Step 4: Get an access token
 */
router.get('/callback', async (req, res) => {
	const { code, state, shop, hmac, timestamp } = req.query;

	console.log('📥 OAuth callback received', { shop, hasCode: !!code, hasState: !!state, hasHmac: !!hmac });

	// Security Check 1: Verify nonce/state parameter
	const sessionNonce = req.session.nonce;
	const cookieNonce = req.signedCookies.shopify_nonce;
	
	if (!state || state !== sessionNonce || state !== cookieNonce) {
		console.error('❌ State/nonce verification failed', { state, sessionNonce, cookieNonce });
		return res.status(401).json({
			success: false,
			error: {
				code: 'INVALID_STATE',
				message: 'Invalid state parameter - nonce mismatch'
			}
		});
	}

	// Security Check 2: Verify HMAC
	if (hmac) {
		try {
			const isValid = verifyHmac(req.query, hmac);
			if (!isValid) {
				console.error('❌ HMAC verification failed');
				return res.status(401).json({
					success: false,
					error: {
						code: 'INVALID_HMAC',
						message: 'HMAC verification failed'
					}
				});
			}
		} catch (error) {
			console.error('❌ HMAC verification error:', error);
			return res.status(401).json({
				success: false,
				error: {
					code: 'HMAC_ERROR',
					message: 'Failed to verify HMAC'
				}
			});
		}
	}

	// Security Check 3: Validate shop hostname
	if (!isValidShopHostname(shop)) {
		console.error('❌ Invalid shop hostname:', shop);
		return res.status(400).json({
			success: false,
			error: {
				code: 'INVALID_SHOP',
				message: 'Invalid shop hostname'
			}
		});
	}

	// Check required parameters
	if (!code || !shop) {
		return res.status(400).json({
			success: false,
			error: {
				code: 'MISSING_PARAMETERS',
				message: 'Missing required parameters'
			}
		});
	}

	try {
		// Step 4: Exchange authorization code for access token
		const tokenUrl = `https://${shop}/admin/oauth/access_token`;
		console.log(`🔄 Exchanging code for access token at ${tokenUrl}`);
		
		const response = await fetch(tokenUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: process.env.SHOPIFY_API_KEY,
				client_secret: process.env.SHOPIFY_API_SECRET,
				code
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ OAuth token exchange failed:', response.status, errorText);
			throw new Error(`OAuth token exchange failed: ${response.status}`);
		}

		const tokenData = await response.json();
		console.log('✅ Access token received', { shop, scope: tokenData.scope });

		// Security Check 4: Verify scopes
		const requestedScopes = (process.env.SHOPIFY_SCOPES || 'read_customers,write_customers,read_products,write_customer_metafields,read_customer_metafields').split(',');
		const grantedScopes = tokenData.scope.split(',');
		
		// Check if all requested scopes were granted (ignoring read scopes implied by write scopes)
		const missingScopes = requestedScopes.filter(scope => {
			// If we have write scope, read scope is implied
			if (scope.startsWith('read_')) {
				const writeScope = scope.replace('read_', 'write_');
				return !grantedScopes.includes(scope) && !grantedScopes.includes(writeScope);
			}
			return !grantedScopes.includes(scope);
		});

		if (missingScopes.length > 0) {
			console.warn('⚠️  Some scopes were not granted:', missingScopes);
		}

		// Store access token persistently
		await sessionStorage.storeSession(shop, {
			accessToken: tokenData.access_token,
			scope: tokenData.scope,
			shop: shop,
			installedAt: new Date().toISOString()
		});

		// Also store in session for immediate use
		req.session.accessToken = tokenData.access_token;
		req.session.shop = shop;

		// Clear nonce after successful authentication
		delete req.session.nonce;
		res.clearCookie('shopify_nonce');

		console.log(`✅ Authentication successful for shop: ${shop}`);

		// Step 5: Redirect to app UI
		const appUrl = process.env.APPLICATION_URL || 'http://localhost:3000';
		res.redirect(`${appUrl}?shop=${shop}&installed=true`);
		
	} catch (error) {
		console.error('❌ OAuth callback error:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'OAUTH_ERROR',
				message: error.message
			}
		});
	}
});


/**
 * GET /api/auth/verify
 * Verify current authentication
 */
router.get('/verify', async (req, res) => {
	const shop = req.query.shop || req.session.shop;
	
	if (!shop) {
		return res.json({
			success: true,
			authenticated: false,
			message: 'No shop specified'
		});
	}

	try {
		// Check session storage for persistent token
		const storedSession = await sessionStorage.getSession(shop);
		
		if (storedSession && storedSession.accessToken) {
			// Update session if not already set
			if (!req.session.accessToken) {
				req.session.accessToken = storedSession.accessToken;
				req.session.shop = shop;
			}
			
			return res.json({
				success: true,
				authenticated: true,
				shop: shop,
				scope: storedSession.scope,
				installedAt: storedSession.installedAt
			});
		}
		
		// Check in-memory session
		if (req.session.accessToken && req.session.shop) {
			return res.json({
				success: true,
				authenticated: true,
				shop: req.session.shop
			});
		}
		
		res.json({
			success: true,
			authenticated: false,
			message: 'No active session found'
		});
	} catch (error) {
		console.error('Error verifying authentication:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'VERIFICATION_ERROR',
				message: 'Failed to verify authentication'
			}
		});
	}
});

/**
 * POST /api/auth/uninstall
 * Handle app uninstallation (cleanup)
 */
router.post('/uninstall', async (req, res) => {
	const { shop } = req.body;
	
	if (!shop) {
		return res.status(400).json({
			success: false,
			error: {
				code: 'MISSING_SHOP',
				message: 'Shop parameter is required'
			}
		});
	}

	try {
		// Remove stored session
		await sessionStorage.deleteSession(shop);
		
		// Clear session
		if (req.session.shop === shop) {
			req.session.destroy();
		}
		
		console.log(`🗑️  App uninstalled for shop: ${shop}`);
		
		res.json({
			success: true,
			message: 'Session removed successfully'
		});
	} catch (error) {
		console.error('Error handling uninstall:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'UNINSTALL_ERROR',
				message: 'Failed to handle uninstallation'
			}
		});
	}
});

module.exports = router;