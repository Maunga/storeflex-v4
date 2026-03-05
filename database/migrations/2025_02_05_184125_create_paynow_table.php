<?php

use App\Enums\PaynowStatus;
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
        Schema::create('paynow', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('paynowreference')->unique();
            $table->decimal('amount', 8, 2);
            $table->string('paynow_status');
            $table->string('currency')->nullable();
            $table->string('pollurl');
            $table->string('hash');
            $table->enum('status', array_column(PaynowStatus::cases(), 'value'))->default(PaynowStatus::PENDING);
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paynow');
    }
};
