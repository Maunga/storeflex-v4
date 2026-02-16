<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Make address columns nullable for pickup orders.
     */
    public function up(): void
    {
        Schema::table('billing_information', function (Blueprint $table) {
            $table->string('address_1')->nullable()->change();
            $table->string('city')->nullable()->change();
            $table->string('country')->nullable()->change();
            $table->string('postcode')->nullable()->change();
        });

        Schema::table('shipping_information', function (Blueprint $table) {
            $table->string('address_1')->nullable()->change();
            $table->string('city')->nullable()->change();
            $table->string('country')->nullable()->change();
            $table->string('postcode')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Update NULL values before making columns NOT NULL
        DB::table('billing_information')->whereNull('address_1')->update(['address_1' => 'N/A']);
        DB::table('billing_information')->whereNull('city')->update(['city' => 'N/A']);
        DB::table('billing_information')->whereNull('country')->update(['country' => 'N/A']);
        DB::table('billing_information')->whereNull('postcode')->update(['postcode' => '00000']);

        DB::table('shipping_information')->whereNull('address_1')->update(['address_1' => 'N/A']);
        DB::table('shipping_information')->whereNull('city')->update(['city' => 'N/A']);
        DB::table('shipping_information')->whereNull('country')->update(['country' => 'N/A']);
        DB::table('shipping_information')->whereNull('postcode')->update(['postcode' => '00000']);

        Schema::table('billing_information', function (Blueprint $table) {
            $table->string('address_1')->nullable(false)->change();
            $table->string('city')->nullable(false)->change();
            $table->string('country')->nullable(false)->change();
            $table->string('postcode')->nullable(false)->change();
        });

        Schema::table('shipping_information', function (Blueprint $table) {
            $table->string('address_1')->nullable(false)->change();
            $table->string('city')->nullable(false)->change();
            $table->string('country')->nullable(false)->change();
            $table->string('postcode')->nullable(false)->change();
        });
    }
};
