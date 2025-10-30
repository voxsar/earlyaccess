@extends('shopify-app::layouts.default')

@section('content')
    <!-- You are: (shop domain name) -->
    <p>You are: {{ $shopDomain ?? Auth::user()->name }}</p>

    <ui-title-bar title="Wishlist Admin Dashboard">
        <button onclick="location.href='{{ route('products.index') }}'" variant="secondary">
            View Products
        </button>
        <button onclick="location.href='{{ route('customers.index') }}'" variant="primary">
            View Customers
        </button>
    </ui-title-bar>

    <div style="padding: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <!-- Customers Card -->
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-right: 12px;">
                        <span style="font-size: 24px;">👥</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Customers</h3>
                        <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">View customers with wishlist items</p>
                    </div>
                </div>
                <a href="{{ route('customers.index') }}" 
                   style="display: inline-block; background: #2196f3; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px;">
                    View All Customers
                </a>
            </div>

            <!-- Products Card -->
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="background: #f3e5f5; padding: 12px; border-radius: 8px; margin-right: 12px;">
                        <span style="font-size: 24px;">🛍️</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Products</h3>
                        <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">View all wishlisted products</p>
                    </div>
                </div>
                <a href="{{ route('products.index') }}" 
                   style="display: inline-block; background: #9c27b0; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px;">
                    View All Products
                </a>
            </div>
        </div>

        <!-- Quick Stats -->
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; margin-top: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Quick Overview</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">
                This dashboard allows you to manage and view wishlist data from your Shopify store. 
                Customers and products are automatically synced when wishlist actions are performed through the API.
            </p>
            <div style="margin-top: 16px;">
                <a href="https://partners.shopify.com/organizations" target="_blank" 
                   style="color: #2196f3; text-decoration: none; font-size: 14px; margin-right: 20px;">
                    Shopify Partners →
                </a>
                <a href="https://help.shopify.com/en/api" target="_blank" 
                   style="color: #2196f3; text-decoration: none; font-size: 14px;">
                    API Documentation →
                </a>
            </div>
        </div>
    </div>
@endsection