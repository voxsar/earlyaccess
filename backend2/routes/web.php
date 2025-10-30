<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WishListController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| Wishlist API Routes
|--------------------------------------------------------------------------
|
| These routes are for the wishlist functionality and require shop authentication.
| They use the Shopify app authentication middleware.
|
*/

Route::middleware([])->prefix('api/wishlist')->group(function () {
    // Add product to wishlist
    Route::post('/add', [WishListController::class, 'addToWishlist'])
        ->name('wishlist.add');
    
    // Remove product from wishlist  
    Route::post('/remove', [WishListController::class, 'removeFromWishlist'])
        ->name('wishlist.remove');
    
    // Clear entire wishlist
    Route::post('/clear', [WishListController::class, 'clearWishlist'])
        ->name('wishlist.clear');
    
    // Get specific customer's wishlist
    Route::get('/customer/{customerId}', [WishListController::class, 'getWishlist'])
        ->name('wishlist.get');
    
    // Get wishlist item count
    Route::get('/customer/{customerId}/count', [WishListController::class, 'getWishlistCount'])
        ->name('wishlist.count');
    
    // Check if product is in wishlist
    Route::get('/customer/{customerId}/product/{productId}', [WishListController::class, 'checkProductInWishlist'])
        ->name('wishlist.check');
    
    // Get current customer's wishlist (for authenticated customer)
    Route::get('/current', [WishListController::class, 'getCurrentWishlist'])
        ->name('wishlist.current');
});
