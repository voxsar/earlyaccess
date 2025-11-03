@extends('shopify-app::layouts.default')

@section('content')
    <ui-title-bar title="Customer Wishlist">
        <button onclick="location.href='{{ route('customers.index') }}'" variant="secondary">
            Back to Customers
        </button>
        <button onclick="location.href='https://admin.shopify.com/store/{{ $shopDomain }}/customers/{{ $customer->shopify_customer_id }}'" 
                variant="primary">
            View in Shopify
        </button>
    </ui-title-bar>

    <div style="padding: 20px;">
        <!-- Customer Info -->
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
                            {{ $customer->name ?: 'Customer' }}
                        </h2>
                        <p style="margin: 0; color: #666;">
                            {{ $customer->email }} • {{ $customer->wishlist_count }} item{{ $customer->wishlist_count !== 1 ? 's' : '' }} in wishlist
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #666;">Shopify Customer ID</div>
                        <div style="font-weight: 500;">{{ $customer->shopify_customer_id }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Wishlist Items -->
        @if($customer->wishlists->count() > 0)
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="padding: 20px; border-bottom: 1px solid #e5e5e5;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">
                        Wishlist Items ({{ $customer->wishlists->count() }})
                    </h3>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f9f9f9;">
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Product
                                </th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Shopify ID
                                </th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Added Date
                                </th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($customer->wishlists as $wishlistItem)
                                <tr style="border-bottom: 1px solid #f0f0f0;">
                                    <td style="padding: 12px;">
                                        <div style="font-weight: 500;">
                                            {{ $wishlistItem->product_name }}
                                        </div>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 12px;">
                                            {{ $wishlistItem->product_shopify_id }}
                                        </code>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <div style="font-size: 13px;">
                                            {{ $wishlistItem->created_at->format('M j, Y') }}
                                        </div>
                                        <div style="font-size: 11px; color: #666;">
                                            {{ $wishlistItem->created_at->format('g:i A') }}
                                        </div>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <a href="https://admin.shopify.com/store/{{ $shopDomain }}/products/{{ $wishlistItem->product_shopify_id }}" 
                                           target="_blank"
                                           style="background: #2196f3; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                                            View in Shopify
                                        </a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        @else
            <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-size: 48px; margin-bottom: 16px;">💝</div>
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No wishlist items</h3>
                <p style="margin: 0; color: #666;">This customer hasn't added any products to their wishlist yet.</p>
            </div>
        @endif
    </div>
@endsection