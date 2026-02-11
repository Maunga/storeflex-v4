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
        Schema::create('user_checkout_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Shipping Information
            $table->string('shipping_first_name');
            $table->string('shipping_last_name');
            $table->string('shipping_address_1')->nullable();
            $table->string('shipping_address_2')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_state')->nullable();
            $table->string('shipping_postcode')->nullable()->default('263');
            $table->string('shipping_country')->nullable();
            $table->string('shipping_email');
            $table->string('shipping_phone');
            
            // Billing Information
            $table->string('billing_first_name');
            $table->string('billing_last_name');
            $table->string('billing_address_1')->nullable();
            $table->string('billing_address_2')->nullable();
            $table->string('billing_city')->nullable();
            $table->string('billing_state')->nullable();
            $table->string('billing_postcode')->nullable()->default('263');
            $table->string('billing_country')->nullable();
            $table->string('billing_email');
            $table->string('billing_phone');
            
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_checkout_profiles');
    }
};
