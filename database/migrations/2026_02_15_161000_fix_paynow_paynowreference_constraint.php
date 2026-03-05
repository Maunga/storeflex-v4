<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('paynow', function (Blueprint $table) {
            // Drop the unique constraint on paynowreference first
            $table->dropUnique('paynow_paynowreference_unique');
        });
        
        // Now make the column nullable (after constraint is dropped)
        Schema::table('paynow', function (Blueprint $table) {
            $table->string('paynowreference')->nullable()->change();
        });
        
        // Set empty strings to NULL 
        DB::table('paynow')->where('paynowreference', '')->update(['paynowreference' => null]);
        
        // Add a partial unique index in PostgreSQL (unique only when not null and not empty)
        DB::statement("
            CREATE UNIQUE INDEX paynow_paynowreference_unique 
            ON paynow (paynowreference) 
            WHERE paynowreference IS NOT NULL AND paynowreference != ''
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the partial unique index
        DB::statement("DROP INDEX IF EXISTS paynow_paynowreference_unique");
        
        Schema::table('paynow', function (Blueprint $table) {
            $table->string('paynowreference')->nullable(false)->change();
            $table->unique('paynowreference');
        });
    }
};
