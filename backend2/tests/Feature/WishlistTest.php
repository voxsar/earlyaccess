<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    private $shop;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test shop/user
        $this->shop = User::factory()->create([
            'name' => 'Test Shop',
            'email' => 'test-shop@example.com',
            'shopify_domain' => 'test-shop.myshopify.com',
            'shopify_token' => 'test-token'
        ]);
    }

    public function test_add_to_wishlist_requires_authentication()
    {
        $response = $this->postJson('/api/wishlist/add', [
            'customerId' => 'gid://shopify/Customer/123',
            'productId' => 'gid://shopify/Product/456'
        ]);

        $response->assertStatus(401)
                ->assertJson([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED'
                    ]
                ]);
    }

    public function test_add_to_wishlist_requires_customer_id()
    {
        $response = $this->actingAs($this->shop)
                        ->postJson('/api/wishlist/add', [
                            'productId' => 'gid://shopify/Product/456'
                        ]);

        $response->assertStatus(422); // Validation error
    }

    public function test_add_to_wishlist_requires_product_id()
    {
        $response = $this->actingAs($this->shop)
                        ->postJson('/api/wishlist/add', [
                            'customerId' => 'gid://shopify/Customer/123'
                        ]);

        $response->assertStatus(422); // Validation error
    }

    public function test_get_wishlist_requires_customer_id()
    {
        $response = $this->actingAs($this->shop)
                        ->getJson('/api/wishlist/customer/');

        $response->assertStatus(404); // Route not found without customer ID
    }

    public function test_remove_from_wishlist_requires_authentication()
    {
        $response = $this->postJson('/api/wishlist/remove', [
            'customerId' => 'gid://shopify/Customer/123',
            'productId' => 'gid://shopify/Product/456'
        ]);

        $response->assertStatus(401)
                ->assertJson([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED'
                    ]
                ]);
    }

    public function test_clear_wishlist_requires_authentication()
    {
        $response = $this->postJson('/api/wishlist/clear', [
            'customerId' => 'gid://shopify/Customer/123'
        ]);

        $response->assertStatus(401)
                ->assertJson([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED'
                    ]
                ]);
    }

    public function test_get_wishlist_count_requires_authentication()
    {
        $response = $this->getJson('/api/wishlist/customer/gid://shopify/Customer/123/count');

        $response->assertStatus(401)
                ->assertJson([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED'
                    ]
                ]);
    }

    public function test_check_product_in_wishlist_requires_authentication()
    {
        $response = $this->getJson('/api/wishlist/customer/gid://shopify/Customer/123/product/gid://shopify/Product/456');

        $response->assertStatus(401)
                ->assertJson([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHORIZED'
                    ]
                ]);
    }
}