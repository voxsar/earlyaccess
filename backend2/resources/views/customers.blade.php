@extends('shopify-app::layouts.default')

@section('content')
    <ui-title-bar title="Customers with Wishlists">
        <button onclick="location.href='{{ route('products.index') }}'" variant="secondary">
            View All Products
        </button>
        <button onclick="location.reload()" variant="primary">
            Refresh
        </button>
    </ui-title-bar>

    <div style="padding: 20px;">
        @if($customers->count() > 0)
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="padding: 20px; border-bottom: 1px solid #e5e5e5;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 600;">
                        Customers with Wishlist Items ({{ $customers->count() }})
                    </h2>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f9f9f9;">
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Customer
                                </th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Email
                                </th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Wishlist Count
                                </th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($customers as $customer)
                                <tr style="border-bottom: 1px solid #f0f0f0;">
                                    <td style="padding: 12px;">
                                        <div style="font-weight: 500;">
                                            {{ $customer->name ?: 'N/A' }}
                                        </div>
                                        <div style="font-size: 12px; color: #666; margin-top: 2px;">
                                            ID: {{ $customer->shopify_customer_id }}
                                        </div>
                                    </td>
                                    <td style="padding: 12px;">
                                        {{ $customer->email }}
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                            {{ $customer->wishlist_count }}
                                        </span>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <div style="display: flex; gap: 8px; justify-content: center;">
                                            <a href="{{ route('customers.show', $customer->id) }}" 
                                               style="background: #4caf50; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                                                View Wishlist
                                            </a>
                                            <a href="{{ $customer->shopify_url }}" 
                                               target="_blank"
                                               style="background: #2196f3; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                                                View in Shopify
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        @else
            <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No customers with wishlist items yet</h3>
                <p style="margin: 0; color: #666;">When customers add products to their wishlist, they'll appear here.</p>
            </div>
        @endif
    </div>
@endsection