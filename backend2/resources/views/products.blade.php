@extends('shopify-app::layouts.default')

@section('content')
    <ui-title-bar title="Wishlisted Products">
        <button onclick="location.href='{{ route('customers.index') }}'" variant="secondary">
            View Customers
        </button>
        <button onclick="location.reload()" variant="primary">
            Refresh
        </button>
    </ui-title-bar>

    <div style="padding: 20px;">
        @if($products->count() > 0)
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="padding: 20px; border-bottom: 1px solid #e5e5e5;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 600;">
                        All Wishlisted Products ({{ $products->count() }})
                    </h2>
                    <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
                        Products that have been added to customer wishlists, sorted by popularity
                    </p>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f9f9f9;">
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Product Name
                                </th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Shopify ID
                                </th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Customer Count
                                </th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Popularity
                                </th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($products as $index => $product)
                                @php
                                    $popularityLevel = $product->customer_count >= 10 ? 'high' : ($product->customer_count >= 5 ? 'medium' : 'low');
                                    $popularityColor = $popularityLevel === 'high' ? '#4caf50' : ($popularityLevel === 'medium' ? '#ff9800' : '#2196f3');
                                    $popularityLabel = $popularityLevel === 'high' ? 'High' : ($popularityLevel === 'medium' ? 'Medium' : 'Low');
                                @endphp
                                <tr style="border-bottom: 1px solid #f0f0f0;">
                                    <td style="padding: 12px;">
                                        <div style="display: flex; align-items: center;">
                                            @if($index < 3)
                                                <span style="background: #gold; color: #000; padding: 2px 6px; border-radius: 12px; font-size: 10px; font-weight: bold; margin-right: 8px; min-width: 20px; text-align: center;">
                                                    {{ $index + 1 }}
                                                </span>
                                            @endif
                                            <div>
                                                <div style="font-weight: 500;">
                                                    {{ $product->product_name ?: 'Unknown Product' }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 12px;">
                                            {{ $product->product_shopify_id }}
                                        </code>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                            {{ $product->customer_count }} customer{{ $product->customer_count !== 1 ? 's' : '' }}
                                        </span>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <span style="background: {{ $popularityColor }}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                            {{ $popularityLabel }}
                                        </span>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <div style="display: flex; gap: 8px; justify-content: center;">
                                            <a href="https://admin.shopify.com/store/{{ $shopDomain }}/products/{{ $product->product_shopify_id }}" 
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
                
                <!-- Summary Stats -->
                <div style="padding: 20px; border-top: 1px solid #e5e5e5; background-color: #f9f9f9;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #2196f3;">
                                {{ $products->count() }}
                            </div>
                            <div style="font-size: 14px; color: #666;">
                                Total Products
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #4caf50;">
                                {{ $products->sum('customer_count') }}
                            </div>
                            <div style="font-size: 14px; color: #666;">
                                Total Wishlist Items
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #ff9800;">
                                {{ $products->count() > 0 ? round($products->sum('customer_count') / $products->count(), 1) : 0 }}
                            </div>
                            <div style="font-size: 14px; color: #666;">
                                Avg. per Product
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @else
            <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-size: 48px; margin-bottom: 16px;">🛍️</div>
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No products in wishlists yet</h3>
                <p style="margin: 0; color: #666;">When customers add products to their wishlist, they'll appear here.</p>
            </div>
        @endif
    </div>
@endsection