/**
 * Shopify Authentication Middleware
 * Loads stored access tokens for authenticated API requests
 */

const sessionStorage = require('../services/sessionStorage');

/**
 * Middleware to load shop session from storage
 * This should be used for backend API routes that need to make Shopify API calls
 */
async function shopifyAuthMiddleware(req, res, next) {
	try {
		// Get shop from various sources
		const shop = req.query.shop || req.body.shop || req.headers['x-shopify-shop'];
		
		if (!shop) {
			return res.status(400).json({
				success: false,
				error: {
					code: 'MISSING_SHOP',
					message: 'Shop parameter is required'
				}
			});
		}

		// Try to load session from storage
		const storedSession = await sessionStorage.getSession(shop);
		
		if (!storedSession || !storedSession.accessToken) {
			return res.status(401).json({
				success: false,
				error: {
					code: 'NOT_AUTHENTICATED',
					message: 'Shop not authenticated. Please install the app first.',
					shop: shop
				}
			});
		}

		// Attach session to request for use by controllers
		req.shopifySession = {
			shop: storedSession.shop,
			accessToken: storedSession.accessToken,
			scope: storedSession.scope
		};

		console.log(`✅ Loaded session for shop: ${shop}`);
		next();
	} catch (error) {
		console.error('Error loading Shopify session:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'SESSION_ERROR',
				message: 'Failed to load shop session'
			}
		});
	}
}

module.exports = shopifyAuthMiddleware;
