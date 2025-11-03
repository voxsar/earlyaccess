<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'product_shopify_id',
        'product_name',
        'activity_type',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the customer that owns the activity
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
