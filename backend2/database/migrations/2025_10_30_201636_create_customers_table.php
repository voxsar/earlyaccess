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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
			//name
			$table->string('name')->nullable();
			//email
			$table->string('email')->unique();
			//shopify_customer_id
			$table->bigInteger('shopify_customer_id')->unique();
			//number of wishlist items
			$table->integer('wishlist_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
