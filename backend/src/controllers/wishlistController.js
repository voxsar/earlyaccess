/**
 * Wishlist Controller
 * Handles wishlist operations
 */
const wishlistService = require('../services/wishlistService');

/**
 * Add product to wishlist
 */
async function addToWishlist(req, res, next) {
  try {
    const { productId, productHandle } = req.body;
    const customerId = req.customer?.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Product ID is required',
        },
      });
    }

    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Customer not authenticated',
        },
      });
    }

    const result = await wishlistService.addToWishlist(customerId, productId);

    res.status(200).json({
      success: true,
      data: {
        itemCount: result.itemCount,
        wishlist: result.wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove product from wishlist
 */
async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    const customerId = req.customer?.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Product ID is required',
        },
      });
    }

    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Customer not authenticated',
        },
      });
    }

    const result = await wishlistService.removeFromWishlist(
      customerId,
      productId
    );

    res.status(200).json({
      success: true,
      data: {
        itemCount: result.itemCount,
        wishlist: result.wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get wishlist with product details
 */
async function getWishlist(req, res, next) {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Customer ID is required',
        },
      });
    }

    const wishlist = await wishlistService.getWishlistWithProducts(customerId);

    res.status(200).json({
      success: true,
      data: {
        items: wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current customer's wishlist
 */
async function getCurrentWishlist(req, res, next) {
  try {
    const customerId = req.customer?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Customer not authenticated',
        },
      });
    }

    const wishlist = await wishlistService.getWishlistWithProducts(customerId);

    res.status(200).json({
      success: true,
      data: {
        items: wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getCurrentWishlist,
};
