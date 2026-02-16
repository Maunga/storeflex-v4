<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * The original paynow table used an enum('status') which in PostgreSQL creates
     * a CHECK constraint named "paynow_status_check". The previous migration that
     * changed the column to string did not drop this constraint, causing inserts to fail.
     */
    public function up(): void
    {
        // Drop the CHECK constraint that PostgreSQL created for the enum column
        DB::statement('ALTER TABLE paynow DROP CONSTRAINT IF EXISTS paynow_status_check');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add the constraint if needed
        DB::statement("ALTER TABLE paynow ADD CONSTRAINT paynow_status_check CHECK (status IN ('PENDING', 'PUSHED', 'PAID', 'FAILED', 'CANCELLED'))");
    }
};
