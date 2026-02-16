<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Fix inconsistency: amount_paid was decimal but total/balance are integers (cents).
     * Convert amount_paid to integer to match.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Change amount_paid to integer (cents) to match total and balance
            $table->integer('amount_paid')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('amount_paid', 10, 2)->default(0)->change();
        });
    }
};
