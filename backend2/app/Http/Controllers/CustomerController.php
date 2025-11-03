<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers with wishlist items
     */
    public function index()
    {
        // Get customers who have at least one wishlist item
        $customers = Customer::withCount('wishlists')
            ->orderBy('wishlist_count', 'desc')
            ->get();

        // Get shop domain for Shopify URLs
        $shop = User::first();
        $shopDomain = $shop ? $shop->name : 'your-shop';

        return view('customers', compact('customers', 'shopDomain'));
    }

    /**
     * Get customers data as JSON for AJAX
     */
    public function getCustomersData()
    {
        $customers = Customer::withCount('wishlists')
            ->orderBy('wishlist_count', 'desc')
            ->get();

        $shop = User::first();
        $shopDomain = $shop ? $shop->name : 'your-shop';

        return response()->json([
            'customers' => $customers,
            'shopDomain' => $shopDomain,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified customer's wishlist
     */
    public function show(Customer $customer)
    {
        // Load wishlist items for this customer
        $customer->load('wishlists');

        // Get shop domain for Shopify URLs
        $shop = User::first();
        $shopDomain = $shop ? $shop->name : 'your-shop';

        return view('wishlist', compact('customer', 'shopDomain'));
    }

    /**
     * Get customer wishlist data as JSON for AJAX
     */
    public function getCustomerWishlist($customerId)
    {
        $customer = Customer::with('wishlists')->findOrFail($customerId);

        $shop = User::first();
        $shopDomain = $shop ? $shop->name : 'your-shop';

        return response()->json([
            'customer' => $customer,
            'shopDomain' => $shopDomain,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        //
    }
}
