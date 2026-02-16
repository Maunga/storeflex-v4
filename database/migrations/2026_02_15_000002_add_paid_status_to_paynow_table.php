<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL: Convert enum column to varchar to allow any value
        // The application will handle validation via the PaynowStatus enum
        Schema::table('paynow', function (Blueprint $table) {
            $table->string('status')->default('PENDING')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse - string type is more flexible
    }
};
