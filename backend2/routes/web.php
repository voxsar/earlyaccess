<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\WishListController;
use Illuminate\Support\Facades\Route;

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
})->middleware(['verify.shopify'])->name('home');

/*
|--------------------------------------------------------------------------
| Admin Dashboard Routes
|--------------------------------------------------------------------------
|
| These routes are for the admin dashboard to view customers and products
| in the wishlist system. They require shop authentication.
|
*/

Route::middleware(['verify.shopify'])->group(function () {
    // Customers with wishlists
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');

    // Individual customer's wishlist
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');

    // All wishlisted products
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');

    // AJAX API endpoints
    Route::get('/api/customers-data', [CustomerController::class, 'getCustomersData'])->name('api.customers');
    Route::get('/api/products-data', [ProductController::class, 'getProductsData'])->name('api.products');
    Route::get('/api/customer-wishlist/{customerId}', [CustomerController::class, 'getCustomerWishlist'])->name('api.customer.wishlist');
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
    Route::get('/remove', [WishListController::class, 'removeFromWishlist'])
        ->name('wishlist.remove');
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
