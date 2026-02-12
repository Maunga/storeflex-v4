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
        DB::statement('ALTER TABLE weight_information ALTER COLUMN views DROP DEFAULT');
        DB::statement('ALTER TABLE weight_information ALTER COLUMN views TYPE integer USING views::integer');
        DB::statement('ALTER TABLE weight_information ALTER COLUMN views SET DEFAULT 0');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE weight_information ALTER COLUMN views DROP DEFAULT');
        DB::statement('ALTER TABLE weight_information ALTER COLUMN views TYPE varchar(255) USING views::varchar');
        DB::statement("ALTER TABLE weight_information ALTER COLUMN views SET DEFAULT '0'");
    }
};
