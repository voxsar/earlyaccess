/**
 * Wishlist API routes
 */
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/wishlist/add
 * Add a product to customer's wishlist
 */
router.post('/add', wishlistController.addToWishlist);

/**
 * POST /api/wishlist/remove
 * Remove a product from customer's wishlist
 */
router.post('/remove', wishlistController.removeFromWishlist);

/**
 * GET /api/wishlist/:customerId
 * Get customer's wishlist with full product details
 */
router.get('/:customerId', authMiddleware, wishlistController.getWishlist);

/**
 * GET /api/wishlist/current
 * Get current logged-in customer's wishlist
 */
router.get('/current', authMiddleware, wishlistController.getCurrentWishlist);

module.exports = router;
