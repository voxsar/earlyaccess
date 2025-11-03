<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'product_shopify_id',
        'customer_id',
    ];

    /**
     * Get the customer that owns the wishlist item
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the Shopify admin URL for this product
     */
    public function getShopifyUrlAttribute()
    {
        // This would need the shop domain - you might want to pass it as a parameter
        // For now, we'll return a placeholder that can be filled in the view
        return "https://admin.shopify.com/store/artslab-plugin-test/products/{$this->product_shopify_id}";
    }
}
