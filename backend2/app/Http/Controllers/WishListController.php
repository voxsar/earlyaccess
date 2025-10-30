<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\WishlistService;
use App\Services\ShopifyService;

class WishListController extends Controller
{

    /**
     * Add product to wishlist
     */
    public function addToWishlist(Request $request)
    {
        try {
            $request->validate([
                'customerId' => 'required|string',
                'productId' => 'required|string',
                'productHandle' => 'sometimes|string'
            ]);

            $customerId = $request->customerId;
            $productId = $request->productId;

            // Get current shop
            $shop = User::first();
            
            if (!$shop) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED',
                        'message' => 'Shop not authenticated'
                    ]
                ], 401);
            }

            $result = WishlistService::addToWishlist($customerId, $productId, $shop);

            return response()->json([
                'success' => true,
                'data' => [
                    'itemCount' => $result['itemCount'],
                    'wishlist' => $result['wishlist']
                ]
            ]);

        } catch (\Exception $error) {
            Log::error('Error adding to wishlist: ' . $error->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INTERNAL_ERROR',
                    'message' => 'Failed to add product to wishlist'
                ]
            ], 500);
        }
    }

    /**
     * Remove product from wishlist
     */
    public function removeFromWishlist(Request $request)
    {
            $request->validate([
                'customerId' => 'required|string',
                'productId' => 'required|string'
            ]);

            $customerId = $request->customerId;
            $productId = $request->productId;

            // Get current shop
            $shop = User::first();
            
            if (!$shop) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED',
                        'message' => 'Shop not authenticated'
                    ]
                ], 401);
            }

            $result = WishlistService::removeFromWishlist($customerId, $productId, $shop);

            return response()->json([
                'success' => true,
                'data' => [
                    'itemCount' => $result['itemCount'],
                    'wishlist' => $result['wishlist']
                ]
            ]);

        
    }

    /**
     * Get wishlist with product details
     */
    public function getWishlist(Request $request, $customerId)
    {
        try {
            if (!$customerId) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'INVALID_REQUEST',
                        'message' => 'Customer ID is required'
                    ]
                ], 400);
            }

            // Get current shop
            $shop = User::first();
            
            if (!$shop) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED',
                        'message' => 'Shop not authenticated'
                    ]
                ], 401);
            }

            $wishlist = WishlistService::getWishlistWithProducts($customerId, $shop);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $wishlist
                ]
            ]);

        } catch (\Exception $error) {
            Log::error('Error getting wishlist: ' . $error->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INTERNAL_ERROR',
                    'message' => 'Failed to get wishlist'
                ]
            ], 500);
        }
    }

    /**
     * Get current customer's wishlist (for authenticated customer)
     */
    public function getCurrentWishlist(Request $request)
    {
        try {
            // This would need custom middleware to authenticate customer
            // For now, we'll expect customerId to be passed or in session
            $customerId = $request->input('customerId') ?? session('customerId');

            if (!$customerId) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED',
                        'message' => 'Customer not authenticated'
                    ]
                ], 401);
            }

            // Get current shop
            $shop = User::first();
            
            if (!$shop) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED',
                        'message' => 'Shop not authenticated'
                    ]
                ], 401);
            }

            $wishlist = WishlistService::getWishlistWithProducts($customerId, $shop);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $wishlist
                ]
            ]);

        } catch (\Exception $error) {
            Log::error('Error getting current wishlist: ' . $error->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INTERNAL_ERROR',
                    'message' => 'Failed to get wishlist'
                ]
            ], 500);
        }
    }

    /**
     * Clear entire wishlist for a customer
     */
    public function clearWishlist(Request $request)
    {
        try {
            $request->validate([
                'customerId' => 'required|string'
            ]);

            $customerId = $request->customerId;

            // Get current shop
            $shop = User::first();
            
            if (!$shop) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED',
                        'message' => 'Shop not authenticated'
                    ]
                ], 401);
            }

            $result = WishlistService::clearWishlist($customerId, $shop);

            return response()->json([
                'success' => true,
                'data' => [
                    'itemCount' => $result['itemCount'],
                    'wishlist' => $result['wishlist']
                ]
            ]);

        } catch (\Exception $error) {
            Log::error('Error clearing wishlist: ' . $error->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INTERNAL_ERROR',
                    'message' => 'Failed to clear wishlist'
                ]
            ], 500);
        }
    }

    /**
     * Get wishlist item count for a customer
     */
    public function getWishlistCount(Request $request, $customerId)
    {
        try {
            if (!$customerId) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'INVALID_REQUEST',
                        'message' => 'Customer ID is required'
                    ]
                ], 400);
            }

            // Get current shop
            $shop = User::first();
            
            if (!$shop) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED',
                        'message' => 'Shop not authenticated'
                    ]
                ], 401);
            }

            $count = WishlistService::getWishlistCount($customerId, $shop);

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => $count
                ]
            ]);

        } catch (\Exception $error) {
            Log::error('Error getting wishlist count: ' . $error->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INTERNAL_ERROR',
                    'message' => 'Failed to get wishlist count'
                ]
            ], 500);
        }
    }

    /**
     * Check if a product is in customer's wishlist
     */
    public function checkProductInWishlist(Request $request, $customerId, $productId)
    {
        try {
            if (!$customerId || !$productId) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'INVALID_REQUEST',
                        'message' => 'Customer ID and Product ID are required'
                    ]
                ], 400);
            }

            // Get current shop
            $shop = User::first();
            
            if (!$shop) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED',
                        'message' => 'Shop not authenticated'
                    ]
                ], 401);
            }

            $isInWishlist = WishlistService::isInWishlist($customerId, $productId, $shop);

            return response()->json([
                'success' => true,
                'data' => [
                    'isInWishlist' => $isInWishlist
                ]
            ]);

        } catch (\Exception $error) {
            Log::error('Error checking if product is in wishlist: ' . $error->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INTERNAL_ERROR',
                    'message' => 'Failed to check wishlist status'
                ]
            ], 500);
        }
    }
}
