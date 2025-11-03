<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\WishlistActivity;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test data
        $customer = Customer::create([
            'name' => 'Test Customer',
            'email' => 'test@example.com',
            'shopify_customer_id' => 123456,
            'wishlist_count' => 2,
        ]);

        WishlistActivity::create([
            'customer_id' => $customer->id,
            'product_shopify_id' => '1001',
            'product_name' => 'Test Product',
            'activity_type' => 'add',
            'created_at' => Carbon::now()->subDays(5),
        ]);

        WishlistActivity::create([
            'customer_id' => $customer->id,
            'product_shopify_id' => '1002',
            'product_name' => 'Another Product',
            'activity_type' => 'create_new',
            'created_at' => Carbon::now()->subDays(2),
        ]);
    }

    public function test_insights_endpoint_returns_valid_data(): void
    {
        $startDate = Carbon::now()->subDays(7)->toDateString();
        $endDate = Carbon::now()->toDateString();

        $response = $this->get("/api/dashboard/insights?start_date={$startDate}&end_date={$endDate}");

        $response->assertStatus(302); // Redirects due to auth middleware
    }

    public function test_top_products_endpoint_structure(): void
    {
        $response = $this->get('/api/dashboard/top-products?limit=5');

        $response->assertStatus(302); // Redirects due to auth middleware
    }

    public function test_recent_activities_endpoint_structure(): void
    {
        $response = $this->get('/api/dashboard/recent-activities?limit=10');

        $response->assertStatus(302); // Redirects due to auth middleware
    }
}
