<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Wishlist;
use App\Models\WishlistActivity;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class WishlistService
{
    const WISHLIST_METAFIELD_NAMESPACE = 'app';

    const WISHLIST_METAFIELD_KEY = 'wishlist';

    const TIMESTAMPS_METAFIELD_KEY = 'wishlist_timestamps';

    /**
     * Add product to customer's wishlist
     */
    public static function addToWishlist($customerId, $productId, $shop)
    {
        $productId = $productId;
        try {
            // Get current wishlist
            $currentWishlist = self::getCustomerWishlist($customerId, $shop);

            // Check if product is already in wishlist
            if (in_array($productId, $currentWishlist)) {
                return [
                    'itemCount' => count($currentWishlist),
                    'wishlist' => $currentWishlist,
                ];
            }

            // Add product to wishlist
            $updatedWishlist = array_merge($currentWishlist, [$productId]);

            // Update metafield
            ShopifyService::updateCustomerMetafield(
                $customerId,
                self::WISHLIST_METAFIELD_NAMESPACE,
                self::WISHLIST_METAFIELD_KEY,
                json_encode($updatedWishlist),
                'list.product_reference',
                $shop
            );

            // Update timestamps
            self::updateTimestamps($customerId, $productId, 'add', $shop);

            // Update local database
            self::updateLocalDatabase($customerId, $productId, 'add', $shop);

            return [
                'itemCount' => count($updatedWishlist),
                'wishlist' => $updatedWishlist,
            ];

        } catch (\Exception $error) {
            Log::error('Error adding to wishlist: '.$error->getMessage());
            throw new \Exception('Failed to add product to wishlist');
        }
    }

    /**
     * Remove product from customer's wishlist
     */
    public static function removeFromWishlist($customerId, $productId, $shop)
    {
        try {
            Log::info('Removing productId: '.$productId.' from customerId: '.$customerId);
            // Get current wishlist
            $currentWishlist = self::getCustomerWishlist($customerId, $shop);
            Log::info('Current Wishlist: '.json_encode($currentWishlist));
            // Remove product from wishlist
            $updatedWishlist = array_values(array_filter($currentWishlist, function ($id) use ($productId) {
                return $id !== $productId;
            }));

            // Update metafield
            ShopifyService::updateCustomerMetafield(
                $customerId,
                self::WISHLIST_METAFIELD_NAMESPACE,
                self::WISHLIST_METAFIELD_KEY,
                json_encode($updatedWishlist),
                'list.product_reference',
                $shop
            );

            // Update timestamps
            self::updateTimestamps($customerId, $productId, 'remove', $shop);

            // Update local database
            self::updateLocalDatabase($customerId, $productId, 'remove', $shop);

            return [
                'itemCount' => count($updatedWishlist),
                'wishlist' => $updatedWishlist,
            ];

        } catch (\Exception $error) {
            Log::error('Error removing from wishlist: '.$error->getMessage());
            throw new \Exception('Failed to remove product from wishlist');
        }
    }

    /**
     * Get customer's wishlist
     */
    public static function getCustomerWishlist($customerId, $shop)
    {
        try {
            $metafield = ShopifyService::getCustomerMetafield(
                $customerId,
                self::WISHLIST_METAFIELD_NAMESPACE,
                self::WISHLIST_METAFIELD_KEY,
                $shop
            );

            if (! $metafield || ! isset($metafield['value'])) {
                return [];
            }

            return json_decode($metafield['value'], true) ?: [];
        } catch (\Exception $error) {
            Log::error('Error getting wishlist: '.$error->getMessage());

            return [];
        }
    }

    /**
     * Get wishlist with full product details
     */
    public static function getWishlistWithProducts($customerId, $shop)
    {
        try {
            // Get product IDs from wishlist
            $productIds = self::getCustomerWishlist($customerId, $shop);

            if (empty($productIds)) {
                return [];
            }

            // Get timestamps
            $timestamps = self::getTimestamps($customerId, $shop);

            // Get product details
            $products = ShopifyService::getProductsByIds($productIds, $shop);

            // Combine products with timestamps
            $wishlistItems = [];
            foreach ($products as $product) {
                $wishlistItems[] = [
                    'productId' => $product['id'],
                    'title' => $product['title'] ?? '',
                    'handle' => $product['handle'] ?? '',
                    'price' => $product['priceRange']['minVariantPrice']['amount'] ?? null,
                    'currency' => $product['priceRange']['minVariantPrice']['currencyCode'] ?? null,
                    'imageUrl' => $product['featuredImage']['url'] ?? null,
                    'url' => $product['onlineStoreUrl'] ?? "/products/{$product['handle']}",
                    'addedAt' => $timestamps[$product['id']] ?? null,
                ];
            }

            return $wishlistItems;
        } catch (\Exception $error) {
            Log::error('Error getting wishlist with products: '.$error->getMessage());
            throw new \Exception('Failed to get wishlist');
        }
    }

    /**
     * Update timestamps for wishlist items
     */
    private static function updateTimestamps($customerId, $productId, $action, $shop)
    {
        try {
            $timestamps = self::getTimestamps($customerId, $shop);

            if ($action === 'add') {
                $timestamps[$productId] = Carbon::now()->toISOString();
            } elseif ($action === 'remove') {
                unset($timestamps[$productId]);
            }

            ShopifyService::updateCustomerMetafield(
                $customerId,
                self::WISHLIST_METAFIELD_NAMESPACE,
                self::TIMESTAMPS_METAFIELD_KEY,
                json_encode($timestamps),
                'json',
                $shop
            );
        } catch (\Exception $error) {
            Log::error('Error updating timestamps: '.$error->getMessage());
            // Don't throw error for timestamps, it's not critical
        }
    }

    /**
     * Get timestamps for wishlist items
     */
    private static function getTimestamps($customerId, $shop)
    {
        try {
            $metafield = ShopifyService::getCustomerMetafield(
                $customerId,
                self::WISHLIST_METAFIELD_NAMESPACE,
                self::TIMESTAMPS_METAFIELD_KEY,
                $shop
            );

            if (! $metafield || ! isset($metafield['value'])) {
                return [];
            }

            return json_decode($metafield['value'], true) ?: [];
        } catch (\Exception $error) {
            Log::error('Error getting timestamps: '.$error->getMessage());

            return [];
        }
    }

    /**
     * Clear entire wishlist for a customer
     */
    public static function clearWishlist($customerId, $shop)
    {
        try {
            // Update wishlist to empty array
            ShopifyService::updateCustomerMetafield(
                $customerId,
                self::WISHLIST_METAFIELD_NAMESPACE,
                self::WISHLIST_METAFIELD_KEY,
                json_encode([]),
                'list.product_reference',
                $shop
            );

            // Clear timestamps
            ShopifyService::updateCustomerMetafield(
                $customerId,
                self::WISHLIST_METAFIELD_NAMESPACE,
                self::TIMESTAMPS_METAFIELD_KEY,
                json_encode([]),
                'json',
                $shop
            );

            // Update local database - clear all wishlist items for this customer
            $numericCustomerId = str_replace('gid://shopify/Customer/', '', $customerId);
            $customer = Customer::where('shopify_customer_id', $numericCustomerId)->first();

            if ($customer) {
                Wishlist::where('customer_id', $customer->id)->delete();
                $customer->update(['wishlist_count' => 0]);
            }

            return [
                'itemCount' => 0,
                'wishlist' => [],
            ];

        } catch (\Exception $error) {
            Log::error('Error clearing wishlist: '.$error->getMessage());
            throw new \Exception('Failed to clear wishlist');
        }
    }

    /**
     * Get wishlist item count for a customer
     */
    public static function getWishlistCount($customerId, $shop)
    {
        try {
            $wishlist = self::getCustomerWishlist($customerId, $shop);

            return count($wishlist);
        } catch (\Exception $error) {
            Log::error('Error getting wishlist count: '.$error->getMessage());

            return 0;
        }
    }

    /**
     * Check if a product is in customer's wishlist
     */
    public static function isInWishlist($customerId, $productId, $shop)
    {
        try {
            $wishlist = self::getCustomerWishlist($customerId, $shop);

            return in_array($productId, $wishlist);
        } catch (\Exception $error) {
            Log::error('Error checking if product is in wishlist: '.$error->getMessage());

            return false;
        }
    }

    /**
     * Move wishlist items from one customer to another (e.g., guest to logged-in user)
     */
    public static function mergeWishlists($fromCustomerId, $toCustomerId, $shop)
    {
        try {
            $fromWishlist = self::getCustomerWishlist($fromCustomerId, $shop);
            $toWishlist = self::getCustomerWishlist($toCustomerId, $shop);

            // Merge and remove duplicates
            $mergedWishlist = array_unique(array_merge($toWishlist, $fromWishlist));

            // Update target customer's wishlist
            ShopifyService::updateCustomerMetafield(
                $toCustomerId,
                self::WISHLIST_METAFIELD_NAMESPACE,
                self::WISHLIST_METAFIELD_KEY,
                json_encode($mergedWishlist),
                'list.product_reference',
                $shop
            );

            // Clear source customer's wishlist
            self::clearWishlist($fromCustomerId, $shop);

            return [
                'itemCount' => count($mergedWishlist),
                'wishlist' => $mergedWishlist,
            ];

        } catch (\Exception $error) {
            Log::error('Error merging wishlists: '.$error->getMessage());
            throw new \Exception('Failed to merge wishlists');
        }
    }

    /**
     * Update local database records for customer and wishlist
     */
    private static function updateLocalDatabase($customerId, $productId, $action, $shop)
    {
        try {
            // Extract numeric IDs from Shopify GIDs
            $numericCustomerId = str_replace('gid://shopify/Customer/', '', $customerId);
            $numericProductId = str_replace('gid://shopify/Product/', '', $productId);

            // Get or create customer record
            $customer = self::getOrCreateCustomer($customerId, $shop);

            // Check if customer was successfully retrieved/created
            if (! $customer) {
                Log::error('Failed to get or create customer for ID: '.$customerId);

                return; // Exit early if customer is null
            }

            if ($action === 'add') {
                // Get product details for the wishlist record
                $productDetails = ShopifyService::getProductsByIds([$productId], $shop);
                $productTitle = isset($productDetails[0]) ? $productDetails[0]['title'] : 'Unknown Product';

                // Check if this wishlist item already exists
                $existingWishlistItem = Wishlist::where('customer_id', $customer->id)
                    ->where('product_shopify_id', $numericProductId)
                    ->first();

                if (! $existingWishlistItem) {
                    // Create new wishlist item
                    Wishlist::create([
                        'product_name' => $productTitle,
                        'product_shopify_id' => $numericProductId,
                        'customer_id' => $customer->id,
                    ]);

                    // Update customer wishlist count
                    $customer->increment('wishlist_count');
                    
                    // Track activity - determine if this is a new wishlist creation
                    $activityType = $customer->wishlist_count == 1 ? 'create_new' : 'add';
                    
                    self::trackActivity($customer->id, $numericProductId, $productTitle, $activityType);
                }
            } elseif ($action === 'remove') {
                // Get product name before removing
                $wishlistItem = Wishlist::where('customer_id', $customer->id)
                    ->where('product_shopify_id', $numericProductId)
                    ->first();
                
                $productTitle = $wishlistItem ? $wishlistItem->product_name : 'Unknown Product';
                
                // Remove wishlist item
                $removedCount = Wishlist::where('customer_id', $customer->id)
                    ->where('product_shopify_id', $numericProductId)
                    ->delete();

                if ($removedCount > 0) {
                    // Update customer wishlist count
                    $customer->decrement('wishlist_count');
                    
                    // Track activity
                    self::trackActivity($customer->id, $numericProductId, $productTitle, 'remove');
                }
            }

        } catch (\Exception $error) {
            Log::error('Error updating local database: '.$error);
            // Don't throw error for database updates, it's not critical for the main functionality
        }
    }

    /**
     * Get or create customer record
     */
    private static function getOrCreateCustomer($customerId, $shop)
    {
        try {
            $numericCustomerId = str_replace('gid://shopify/Customer/', '', $customerId);

            // Check if customer exists in local database
            $customer = Customer::where('shopify_customer_id', $numericCustomerId)->first();

            if (! $customer) {
                // Get customer details from Shopify
                $shopifyCustomer = ShopifyService::getCustomerById($customerId, $shop);

                if ($shopifyCustomer) {
                    // Create new customer record
                    $customer = Customer::create([
                        'name' => trim($shopifyCustomer['firstName'].' '.$shopifyCustomer['lastName']),
                        'email' => $shopifyCustomer['email'],
                        'shopify_customer_id' => $numericCustomerId,
                        'wishlist_count' => 0,
                    ]);
                } else {
                    Log::error('Could not retrieve customer details from Shopify for customer ID: '.$customerId);
                }
            }

            return $customer;
        } catch (\Exception $error) {
            Log::error('Error getting or creating customer: '.$error->getMessage());

            return null; // Return null instead of throwing to let calling method handle it
        }
    }

    /**
     * Track wishlist activity
     */
    private static function trackActivity($customerId, $productShopifyId, $productName, $activityType)
    {
        try {
            WishlistActivity::create([
                'customer_id' => $customerId,
                'product_shopify_id' => $productShopifyId,
                'product_name' => $productName,
                'activity_type' => $activityType,
            ]);
        } catch (\Exception $error) {
            Log::error('Error tracking activity: '.$error->getMessage());
            // Don't throw - activity tracking is not critical
        }
    }
}
