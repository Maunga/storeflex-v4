<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\AmazonAeScraperService;

$service = app(AmazonAeScraperService::class);
$result = $service->attemptScrape('https://www.amazon.ae/dp/B08R794ZMX');

echo "success: " . ($result['success'] ? 'true' : 'false') . "\n";
echo "message: " . ($result['message'] ?? 'none') . "\n";

if (!empty($result['data']['item'])) {
    $item = $result['data']['item'];
    echo "title: " . ($item['title'] ?? 'N/A') . "\n";
    echo "price_upper: " . ($item['price_upper'] ?? 'N/A') . "\n";
    echo "dxb_price: " . ($item['dxb_price'] ?? 'N/A') . "\n";
    echo "asin: " . ($item['asin'] ?? 'N/A') . "\n";
} else {
    echo "No item data returned\n";
    echo "Full result keys: " . implode(', ', array_keys($result)) . "\n";
    if (isset($result['data'])) echo "Data keys: " . (is_array($result['data']) ? implode(', ', array_keys($result['data'])) : gettype($result['data'])) . "\n";
}
