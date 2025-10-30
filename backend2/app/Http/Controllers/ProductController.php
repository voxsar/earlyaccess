<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of all wishlisted products with customer counts
     */
    public function index()
    {
        // Get all wishlisted products with customer counts
        $products = Wishlist::select('product_shopify_id', 'product_name')
            ->selectRaw('COUNT(*) as customer_count')
            ->groupBy('product_shopify_id', 'product_name')
            ->orderBy('customer_count', 'desc')
            ->get();

        // Get shop domain for Shopify URLs
        $shop = User::first();
        $shopDomain = $shop ? $shop->name : 'your-shop';

        return view('products', compact('products', 'shopDomain'));
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
     * Display the specified resource.
     */
    public function show(Wishlist $wishlist)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Wishlist $wishlist)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Wishlist $wishlist)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Wishlist $wishlist)
    {
        //
    }
}
