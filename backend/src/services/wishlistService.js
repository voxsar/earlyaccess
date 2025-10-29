/**
 * Wishlist Service
 * Handles business logic for wishlist operations
 */
const shopifyService = require('./shopifyService');

const WISHLIST_METAFIELD_NAMESPACE = 'app';
const WISHLIST_METAFIELD_KEY = 'wishlist';
const TIMESTAMPS_METAFIELD_KEY = 'wishlist_timestamps';

/**
 * Add product to customer's wishlist
 */
async function addToWishlist(customerId, productId) {
  try {
    // Get current wishlist
    const currentWishlist = await getCustomerWishlist(customerId);

    // Check if product is already in wishlist
    if (currentWishlist.includes(productId)) {
      return {
        itemCount: currentWishlist.length,
        wishlist: currentWishlist,
      };
    }

    // Add product to wishlist
    const updatedWishlist = [...currentWishlist, productId];

    // Update metafield
    await shopifyService.updateCustomerMetafield(
      customerId,
      WISHLIST_METAFIELD_NAMESPACE,
      WISHLIST_METAFIELD_KEY,
      JSON.stringify(updatedWishlist),
      'list.product_reference'
    );

    // Update timestamps
    await updateTimestamps(customerId, productId, 'add');

    return {
      itemCount: updatedWishlist.length,
      wishlist: updatedWishlist,
    };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw new Error('Failed to add product to wishlist');
  }
}

/**
 * Remove product from customer's wishlist
 */
async function removeFromWishlist(customerId, productId) {
  try {
    // Get current wishlist
    const currentWishlist = await getCustomerWishlist(customerId);

    // Remove product from wishlist
    const updatedWishlist = currentWishlist.filter((id) => id !== productId);

    // Update metafield
    await shopifyService.updateCustomerMetafield(
      customerId,
      WISHLIST_METAFIELD_NAMESPACE,
      WISHLIST_METAFIELD_KEY,
      JSON.stringify(updatedWishlist),
      'list.product_reference'
    );

    // Update timestamps
    await updateTimestamps(customerId, productId, 'remove');

    return {
      itemCount: updatedWishlist.length,
      wishlist: updatedWishlist,
    };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw new Error('Failed to remove product from wishlist');
  }
}

/**
 * Get customer's wishlist
 */
async function getCustomerWishlist(customerId) {
  try {
    const metafield = await shopifyService.getCustomerMetafield(
      customerId,
      WISHLIST_METAFIELD_NAMESPACE,
      WISHLIST_METAFIELD_KEY
    );

    if (!metafield?.value) {
      return [];
    }

    return JSON.parse(metafield.value);
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return [];
  }
}

/**
 * Get wishlist with full product details
 */
async function getWishlistWithProducts(customerId) {
  try {
    // Get product IDs from wishlist
    const productIds = await getCustomerWishlist(customerId);

    if (!productIds || productIds.length === 0) {
      return [];
    }

    // Get timestamps
    const timestamps = await getTimestamps(customerId);

    // Get product details
    const products = await shopifyService.getProductsByIds(productIds);

    // Combine products with timestamps
    const wishlistItems = products.map((product) => ({
      productId: product.id,
      title: product.title,
      handle: product.handle,
      price: product.priceRange?.minVariantPrice?.amount,
      currency: product.priceRange?.minVariantPrice?.currencyCode,
      imageUrl: product.featuredImage?.url,
      url: product.onlineStoreUrl || `/products/${product.handle}`,
      availableForSale: product.availableForSale,
      addedAt: timestamps[product.id] || null,
    }));

    return wishlistItems;
  } catch (error) {
    console.error('Error getting wishlist with products:', error);
    throw new Error('Failed to get wishlist');
  }
}

/**
 * Update timestamps for wishlist items
 */
async function updateTimestamps(customerId, productId, action) {
  try {
    const timestamps = await getTimestamps(customerId);

    if (action === 'add') {
      timestamps[productId] = new Date().toISOString();
    } else if (action === 'remove') {
      delete timestamps[productId];
    }

    await shopifyService.updateCustomerMetafield(
      customerId,
      WISHLIST_METAFIELD_NAMESPACE,
      TIMESTAMPS_METAFIELD_KEY,
      JSON.stringify(timestamps),
      'json'
    );
  } catch (error) {
    console.error('Error updating timestamps:', error);
    // Don't throw error for timestamps, it's not critical
  }
}

/**
 * Get timestamps for wishlist items
 */
async function getTimestamps(customerId) {
  try {
    const metafield = await shopifyService.getCustomerMetafield(
      customerId,
      WISHLIST_METAFIELD_NAMESPACE,
      TIMESTAMPS_METAFIELD_KEY
    );

    if (!metafield?.value) {
      return {};
    }

    return JSON.parse(metafield.value);
  } catch (error) {
    console.error('Error getting timestamps:', error);
    return {};
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getCustomerWishlist,
  getWishlistWithProducts,
};
