<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItemAttempt;
use App\Models\Product;
use App\Services\AmazonAeScraperService;
use App\Utilities\BaseUtil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CheckoutApiController extends Controller
{
    public function __construct(
        protected AmazonAeScraperService $amazonAeScraperService
    ) {}

    /**
     * Process full checkout: upload product to WooCommerce and place order
     */
    public function process(Request $request)
    {
        $isPickup = $request->input('delivery_method') === 'pickup';
        
        $validated = $request->validate([
            'asin' => 'required|string',
            'quantity' => 'integer|min:1',
            'delivery_method' => 'required|in:delivery,pickup',
            'shipping' => 'required|array',
            'shipping.first_name' => 'required|string',
            'shipping.last_name' => 'required|string',
            'shipping.address_1' => $isPickup ? 'nullable|string' : 'required|string',
            'shipping.address_2' => 'nullable|string',
            'shipping.city' => 'required|string', // Required for both: delivery address or pickup location
            'shipping.state' => 'nullable|string',
            'shipping.postcode' => $isPickup ? 'nullable|string' : 'required|string',
            'shipping.country' => $isPickup ? 'nullable|string' : 'required|string',
            'shipping.email' => 'required|email',
            'shipping.phone' => 'required|string',
            'billing' => 'required|array',
            'billing.first_name' => 'required|string',
            'billing.last_name' => 'required|string',
            'billing.address_1' => $isPickup ? 'nullable|string' : 'required|string',
            'billing.address_2' => 'nullable|string',
            'billing.city' => $isPickup ? 'nullable|string' : 'required|string',
            'billing.state' => 'nullable|string',
            'billing.postcode' => $isPickup ? 'nullable|string' : 'required|string',
            'billing.country' => $isPickup ? 'nullable|string' : 'required|string',
            'billing.email' => 'required|email',
            'billing.phone' => 'required|string',
            'extras' => 'required|array',
            'extras.payment_method' => 'required|array',
            'extras.payment_method.id' => 'required|string',
            'extras.payment_method.title' => 'required|string',
            'extras.agent' => 'required|array',
            'extras.agent.ID' => 'required|string',
            'extras.agent.display_name' => 'required|string',
            'extras.shipping_speed' => 'required|array',
            'extras.shipping_speed.id' => 'required|in:regular,express',
            'extras.shipping_speed.title' => 'required|string',
            'extras.shipping_speed.fee' => 'required|numeric|min:0',
        ]);

        $asin = $validated['asin'];
        $quantity = $validated['quantity'] ?? 1;

        // Step 1: Get product from cache
        $product = $this->resolveProduct($asin);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found or expired. Please go back and try again.',
            ], 404);
        }

        // Step 2: Upload product to WooCommerce
        $uuid = Str::uuid()->toString();
        
        $uploadData = [
            'asin' => $asin,
            'url' => config('app.amazon_ae_prefix') . $asin,
            'source' => 'amazon_ae',
            'session' => json_encode($product),
            'payload' => [
                'name' => $product['title'] ?? 'Unknown Product',
                'type' => 'simple',
                'regular_price' => (string) $product['dxb_price'],
                'description' => $product['bullet_points'] ?? '',
                'short_description' => $product['bullet_points'] ?? '',
                'images' => collect($product['images'] ?? [])->map(fn($url) => ['src' => $url])->take(1)->toArray(),
                'categories' => [],
            ],
        ];

        Log::info('Checkout: Uploading product to WooCommerce', ['asin' => $asin, 'uuid' => $uuid]);
        
        $uploadResult = $this->amazonAeScraperService->uploadDataToShop($uploadData, $uuid, $quantity, true);

        if (!($uploadResult['success'] ?? false)) {
            Log::error('Checkout: Failed to upload product to WooCommerce', ['result' => $uploadResult]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to prepare product for checkout. Please try again.',
            ], 500);
        }

        Log::info('Checkout: Product uploaded successfully', ['result' => $uploadResult]);

        // Step 3: Create order on WooCommerce
        $items = OrderItemAttempt::where('uuid', $uuid)->get();

        $line_items = $items->map(function ($item) {
            return [
                'product_id' => $item['woocommerce_product_id'],
                'quantity' => $item['quantity'],
            ];
        });

        // Convert null values to empty strings for WooCommerce API compatibility
        $sanitizeAddress = function ($address) {
            return array_map(fn($value) => $value ?? '', $address);
        };

        // Build shipping lines based on shipping speed selection
        $productName = $product['title'] ?? 'Unknown Product';
        $itemsValue = "{$productName} &times; {$quantity}";
        $shippingSpeed = $validated['extras']['shipping_speed'];
        $isExpress = $shippingSpeed['id'] === 'express';

        $shipping_lines = [
            [
                'method_title' => $isExpress ? 'Express Cargo (48hrs)' : 'Regular Cargo',
                'method_id' => 'flat_rate',
                'instance_id' => '4',
                'total' => $isExpress ? '5.00' : '0.00',
                'total_tax' => '0.00',
                'taxes' => [],
                'meta_data' => [
                    [
                        'key' => 'Items',
                        'value' => $itemsValue,
                        'display_key' => 'Items',
                        'display_value' => $itemsValue,
                    ],
                    [
                        'key' => 'seller_id',
                        'value' => '1',
                        'display_key' => 'seller_id',
                        'display_value' => '1',
                    ],
                ],
            ],
        ];

        $prepared_data = [
            'payment_method' => $validated['extras']['payment_method']['id'],
            'payment_method_title' => $validated['extras']['payment_method']['title'],
            'set_paid' => false,
            'meta_data' => [
                [
                    'key' => 'sales_agent',
                    'value' => $validated['extras']['agent']['ID']
                ],
                [
                    'key' => 'agent_name',
                    'value' => $validated['extras']['agent']['display_name']
                ],
                [
                    'key' => 'delivery_method',
                    'value' => $validated['delivery_method']
                ],
                [
                    'key' => 'pickup_city',
                    'value' => $isPickup ? $validated['shipping']['city'] : ''
                ],
            ],
            'billing' => $sanitizeAddress($validated['billing']),
            'shipping' => $sanitizeAddress($validated['shipping']),
            'line_items' => $line_items->toArray(),
            'shipping_lines' => $shipping_lines,
        ];

        Log::info('Checkout: Creating WooCommerce order', ['data' => $prepared_data]);

        $create_order = BaseUtil::postOrderToWoocommerce($prepared_data);

        if (!isset($create_order['order_id'])) {
            Log::error('Checkout: Failed to create WooCommerce order', ['result' => $create_order]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order. Please try again.',
            ], 500);
        }

        Log::info('Checkout: WooCommerce order created', ['order_id' => $create_order['order_id']]);

        // Step 4: Create local order record
        $attributes = [
            'woocommerce_order_id' => $create_order['order_id'],
            'total' => $create_order['total'],
            'balance' => $create_order['total'],
            'payment_method' => $validated['extras']['payment_method']['title'],
        ];

        if ($request->user()) {
            $attributes['user_id'] = $request->user()->id;
        }

        $new_order = Order::create($attributes);

        if ($new_order) {
            // Create products record
            foreach ($create_order['line_items'] as $lineItem) {
                try {
                    $new_product = Product::create([
                        'name' => $lineItem['name'],
                        'woocommerce_product_id' => $lineItem['product_id'],
                        'variation_id' => $lineItem['variation_id'] ?? null,
                        'price' => $lineItem['price'],
                        'image' => $lineItem['image']['src'] ?? null,
                    ]);
                } catch (\Throwable $th) {
                    // Ignore if product already exists
                } finally {
                    $existing_product = Product::where('slug', Str::slug($lineItem['name']))->first();
                    if ($existing_product) {
                        $new_order->purchased_items()->create([
                            'product_id' => $existing_product->id,
                            'quantity' => $lineItem['quantity'],
                            'total' => $lineItem['total'],
                        ]);
                    }
                }
            }

            // Add billing details
            $new_order->billing_details()->create($validated['billing']);
            // Add shipping details  
            $new_order->shipping_details()->create($validated['shipping']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully',
            'data' => [
                'order' => $new_order,
                'woocommerce_order_id' => $create_order['order_id'],
            ]
        ]);
    }

    /**
     * Resolve a product from cache, DB, or fresh scrape.
     */
    private function resolveProduct(string $asin): ?array
    {
        // 1. Try scraper cache (fastest)
        $cacheKey = config('app.amazon_ae_cache_prefix') . $asin;
        $cached = Cache::get($cacheKey);

        if ($cached) {
            $itemWeight = $this->amazonAeScraperService->determineWeight($cached);
            $price = $this->amazonAeScraperService->calculatePrice(
                $cached['price_upper'] ?? 0, 
                $cached['price_shipping'] ?? 0, 
                $itemWeight
            );
            return array_merge($cached, [
                'dxb_price' => $price,
                'item_weight' => $itemWeight,
                'scraped_url' => config('app.amazon_ae_prefix') . $asin,
            ]);
        }

        // 2. Try DB (previously uploaded products)
        $dbResult = $this->amazonAeScraperService->retrieveUploadedProduct($asin);
        if ($dbResult['success'] && !empty($dbResult['data']['item'])) {
            $item = $dbResult['data']['item'];
            return is_array($item) ? $item : $item->toArray();
        }

        // 3. Fresh scrape
        $url = config('app.amazon_ae_prefix') . $asin;
        $result = $this->amazonAeScraperService->attemptScrape($url);

        if (!empty($result['success']) && !empty($result['data']['item'])) {
            return $result['data']['item'];
        }

        return null;
    }
}
