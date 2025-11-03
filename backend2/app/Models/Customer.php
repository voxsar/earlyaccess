<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'shopify_customer_id',
        'wishlist_count',
    ];

    /**
     * Get the wishlist items for the customer
     */
    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Get the Shopify admin URL for this customer
     */
    public function getShopifyUrlAttribute()
    {
        // This would need the shop domain - you might want to pass it as a parameter
        // For now, we'll return a placeholder that can be filled in the view
        return "https://admin.shopify.com/store/artslab-plugin-test/customers/{$this->shopify_customer_id}";
    }
}
