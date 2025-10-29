/**
 * OAuth and Authentication routes
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
// Node.js 18+ has built-in fetch

/**
 * GET /api/auth/shopify
 * Initiate Shopify OAuth flow
 */
router.get('/shopify', (req, res) => {
	const { shop } = req.query;

	if (!shop) {
		return res.status(400).json({
			success: false,
			error: {
				code: 'MISSING_SHOP',
				message: 'Shop parameter is required'
			}
		});
	}

	// Generate state parameter for security
	const state = crypto.randomBytes(32).toString('hex');
	req.session.state = state;

	const scopes = 'read_customers,write_customers,read_products,write_customer_metafields,read_customer_metafields';
	const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
	const apiKey = process.env.SHOPIFY_API_KEY;

	const authUrl = `https://${shop}/admin/oauth/authorize?` +
		`client_id=${apiKey}&` +
		`scope=${scopes}&` +
		`redirect_uri=${redirectUri}&` +
		`state=${state}`;

	res.redirect(authUrl);
});

/**
 * GET /api/auth/callback
 * Handle Shopify OAuth callback
 */
router.get('/callback', async (req, res) => {
	const { code, state, shop } = req.query;

	// Verify state parameter
	if (state !== req.session.state) {
		return res.status(400).json({
			success: false,
			error: {
				code: 'INVALID_STATE',
				message: 'Invalid state parameter'
			}
		});
	}

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
		// Exchange authorization code for access token
		const tokenUrl = `https://${shop}/admin/oauth/access_token`;
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
			throw new Error(`OAuth token exchange failed: ${response.status}`);
		}

		const tokenData = await response.json();

		// Store access token in session or database
		req.session.accessToken = tokenData.access_token;
		req.session.shop = shop;

		res.json({
			success: true,
			message: 'Authentication successful',
			shop
		});
	} catch (error) {
		console.error('OAuth callback error:', error);
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
router.get('/verify', (req, res) => {
	if (req.session.accessToken && req.session.shop) {
		res.json({
			success: true,
			authenticated: true,
			shop: req.session.shop
		});
	} else {
		res.json({
			success: true,
			authenticated: false
		});
	}
});

module.exports = router;