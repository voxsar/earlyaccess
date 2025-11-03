<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\WishlistActivity;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DashboardTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test shop user
        $shop = User::firstOrCreate(
            ['email' => 'test@shop.com'],
            [
                'name' => 'test-shop.myshopify.com',
                'email' => 'test@shop.com',
                'password' => bcrypt('password'),
            ]
        );

        // Create test customers
        $customers = [];
        for ($i = 1; $i <= 10; $i++) {
            $customers[] = Customer::create([
                'name' => "Customer {$i}",
                'email' => "customer{$i}@example.com",
                'shopify_customer_id' => 1000 + $i,
                'wishlist_count' => 0,
            ]);
        }

        // Product names for variety
        $products = [
            'Awesome T-Shirt',
            'Cool Sneakers',
            'Stylish Jacket',
            'Premium Headphones',
            'Smart Watch',
            'Designer Bag',
            'Sunglasses',
            'Laptop Stand',
            'Wireless Mouse',
            'Keyboard',
            'Phone Case',
            'Water Bottle',
        ];

        // Create wishlist items and activities
        $now = Carbon::now();
        foreach ($customers as $index => $customer) {
            $numItems = rand(1, 5);
            
            for ($j = 0; $j < $numItems; $j++) {
                $productIndex = rand(0, count($products) - 1);
                $productShopifyId = 2000 + $productIndex;
                $productName = $products[$productIndex];
                
                // Create wishlist item
                Wishlist::create([
                    'customer_id' => $customer->id,
                    'product_shopify_id' => $productShopifyId,
                    'product_name' => $productName,
                ]);
                
                // Determine activity type
                $activityType = $j === 0 ? 'create_new' : 'add';
                
                // Create activity with varying dates
                $daysAgo = rand(0, 30);
                $createdAt = $now->copy()->subDays($daysAgo);
                
                WishlistActivity::create([
                    'customer_id' => $customer->id,
                    'product_shopify_id' => $productShopifyId,
                    'product_name' => $productName,
                    'activity_type' => $activityType,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
                
                // Update customer wishlist count
                $customer->increment('wishlist_count');
            }
            
            // Add some remove activities
            if (rand(0, 1)) {
                $productIndex = rand(0, count($products) - 1);
                $productShopifyId = 2000 + $productIndex;
                $productName = $products[$productIndex];
                
                $daysAgo = rand(0, 15);
                $createdAt = $now->copy()->subDays($daysAgo);
                
                WishlistActivity::create([
                    'customer_id' => $customer->id,
                    'product_shopify_id' => $productShopifyId,
                    'product_name' => $productName,
                    'activity_type' => 'remove',
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }
        }
        
        $this->command->info('Dashboard test data seeded successfully!');
    }
}
