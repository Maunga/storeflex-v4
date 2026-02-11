<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

DB::statement('ALTER TABLE weight_information ALTER COLUMN views DROP DEFAULT');
DB::statement('ALTER TABLE weight_information ALTER COLUMN views TYPE integer USING views::integer');
DB::statement('ALTER TABLE weight_information ALTER COLUMN views SET DEFAULT 0');

echo "Done - views column changed to integer\n";

// Verify
$col = DB::selectOne("SELECT data_type FROM information_schema.columns WHERE table_name = 'weight_information' AND column_name = 'views'");
echo "Column type is now: " . $col->data_type . "\n";
