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
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'payment_reference')) {
                $table->string('payment_reference')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('orders', 'payment_provider')) {
                $table->string('payment_provider')->nullable()->after('payment_reference');
            }
            if (!Schema::hasColumn('orders', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->default(0)->after('balance');
            }
        });

        // Create payment_receipts table to track individual payments
        Schema::create('payment_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('provider'); // ecocash, paynow, paypal, stripe
            $table->string('reference'); // Our reference
            $table->string('provider_reference')->nullable(); // Provider's transaction ID
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('USD');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->json('metadata')->nullable(); // Store raw provider response
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_receipts');
        
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_reference', 'payment_provider', 'amount_paid']);
        });
    }
};
