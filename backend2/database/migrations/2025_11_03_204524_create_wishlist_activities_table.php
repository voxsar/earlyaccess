<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wishlist_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->string('product_shopify_id')->nullable();
            $table->string('product_name')->nullable();
            $table->enum('activity_type', ['add', 'remove', 'create_new'])->default('add');
            $table->text('metadata')->nullable(); // JSON field for additional data
            $table->timestamps();
            
            // Add index for faster queries
            $table->index(['customer_id', 'created_at']);
            $table->index('activity_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wishlist_activities');
    }
};
