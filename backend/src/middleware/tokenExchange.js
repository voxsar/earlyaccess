/**
 * Token Exchange Middleware
 * Handles OAuth 2.0 token exchange for embedded Shopify apps
 */

const crypto = require('crypto');
// Node.js 18+ has built-in fetch

/**
 * Verify and decode session token from App Bridge
 */
function verifySessionToken(sessionToken) {
	try {
		const [header, payload, signature] = sessionToken.split('.');

		// Decode payload
		const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());

		// Verify signature using SHOPIFY_API_SECRET
		const expectedSignature = crypto
			.createHmac('sha256', process.env.SHOPIFY_API_SECRET)
			.update(`${header}.${payload}`)
			.digest('base64url');

		if (signature !== expectedSignature) {
			throw new Error('Invalid session token signature');
		}

		// Check expiration
		if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
			throw new Error('Session token expired');
		}

		return decodedPayload;
	} catch (error) {
		throw new Error(`Invalid session token: ${error.message}`);
	}
}

/**
 * Exchange session token for access token
 */
async function exchangeToken(sessionToken, shop) {
	const tokenExchangeUrl = `https://${shop}/admin/oauth/access_token`;

	const requestBody = new URLSearchParams({
		grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
		client_id: process.env.SHOPIFY_API_KEY,
		client_secret: process.env.SHOPIFY_API_SECRET,
		subject_token: sessionToken,
		subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
		requested_token_type: 'urn:ietf:params:oauth:token-type:access_token'
	});

	try {
		const response = await fetch(tokenExchangeUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json'
			},
			body: requestBody
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
		}

		const tokenData = await response.json();
		return tokenData.access_token;
	} catch (error) {
		console.error('Token exchange error:', error);
		throw error;
	}
}

/**
 * Middleware to handle token exchange authentication
 */
async function tokenExchangeAuth(req, res, next) {
	try {
		// Get session token from Authorization header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				success: false,
				error: {
					code: 'MISSING_SESSION_TOKEN',
					message: 'Session token required in Authorization header'
				}
			});
		}

		const sessionToken = authHeader.substring(7); // Remove 'Bearer '

		// Verify session token
		const sessionPayload = verifySessionToken(sessionToken);
		const shop = sessionPayload.dest.replace('https://', '');

		// Exchange session token for access token
		const accessToken = await exchangeToken(sessionToken, shop);

		// Add session info to request
		req.shopifySession = {
			shop,
			accessToken,
			userId: sessionPayload.sub,
			sessionToken
		};

		next();
	} catch (error) {
		console.error('Token exchange auth error:', error);
		return res.status(401).json({
			success: false,
			error: {
				code: 'TOKEN_EXCHANGE_FAILED',
				message: error.message
			}
		});
	}
}

module.exports = {
	tokenExchangeAuth,
	verifySessionToken,
	exchangeToken
};