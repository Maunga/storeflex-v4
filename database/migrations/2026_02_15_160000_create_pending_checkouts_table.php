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
        Schema::create('pending_checkouts', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('provider');
            $table->decimal('amount', 10, 2);
            $table->integer('payment_percentage')->default(100);
            $table->json('checkout_data');
            $table->string('status')->default('pending'); // pending, paid, expired, cancelled
            $table->timestamp('expires_at');
            $table->timestamps();
            
            $table->index(['reference', 'status']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_checkouts');
    }
};
