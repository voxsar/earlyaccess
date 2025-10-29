/**
 * Authentication Middleware
 * Validates customer session and authentication
 */

/**
 * Verify customer authentication
 * In production, this should verify Shopify customer session tokens
 */
async function authMiddleware(req, res, next) {
	try {
		// Extract customer ID from request
		// This can come from various sources depending on your setup:
		// 1. Shopify session token (recommended for production)
		// 2. Custom session management
		// 3. OAuth tokens

		const customerIdFromHeader = req.headers['x-customer-id'];
		const customerIdFromBody = req.body?.customerId;
		const sessionToken = req.headers['authorization'];

		console.log('Auth middleware - Headers:', {
			'x-customer-id': customerIdFromHeader,
			'authorization': sessionToken ? 'present' : 'missing'
		});
		console.log('Auth middleware - Body customerId:', customerIdFromBody);

		// For now, we'll accept customer ID from headers or body
		// In production, verify the session token with Shopify
		if (sessionToken) {
			// TODO: Verify Shopify session token
			// const customer = await verifyShopifySessionToken(sessionToken);
			// req.customer = customer;
			req.customer = {
				id: customerIdFromHeader || customerIdFromBody,
			};
		} else if (customerIdFromHeader) {
			req.customer = {
				id: customerIdFromHeader,
			};
		} else if (customerIdFromBody) {
			req.customer = {
				id: customerIdFromBody,
			};
		} else {
			console.log('Auth middleware - No customer ID found in headers or body');
			return res.status(401).json({
				success: false,
				error: {
					code: 'UNAUTHORIZED',
					message: 'Customer authentication required',
				},
			});
		}

		console.log('Auth middleware - Customer authenticated:', req.customer.id);
		next();
	} catch (error) {
		console.error('Authentication error:', error);
		return res.status(401).json({
			success: false,
			error: {
				code: 'AUTHENTICATION_FAILED',
				message: 'Failed to authenticate customer',
			},
		});
	}
}

module.exports = authMiddleware;
