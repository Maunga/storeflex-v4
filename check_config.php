<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$keys = [
    'app.oxylabs_endpoint',
    'app.oxylabs_token',
    'app.amazon_ae_prefix',
    'app.amazon_ae_cache_prefix',
    'app.amazon_ae_url',
    'app.cache_time',
    'app.woocommerce_url',
    'app.shipping_price_aed_per_kg',
    'app.aed_rate_to_usd',
    'app.fixed_commission_per_item_aed',
    'app.overall_commission_percentage',
];

foreach ($keys as $key) {
    $val = config($key);
    $display = is_null($val) ? 'NULL' : (is_string($val) ? $val : (string) $val);
    echo str_pad($key, 42) . ' => ' . $display . PHP_EOL;
}
