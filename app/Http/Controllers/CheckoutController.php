<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\UserCheckoutProfile;
use App\Services\AmazonAeScraperService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected AmazonAeScraperService $amazonAeScraperService
    ) {}

    public function show(Request $request, string $asin): Response|RedirectResponse
    {
        // Get product from cache or fresh scrape (same as Product page)
        $product = $this->resolveProduct($asin);
        
        if (!$product) {
            return redirect('/')->with('toast', [
                'type' => 'error',
                'message' => 'This product link has expired or the product is no longer available on Amazon.ae.',
            ]);
        }

        $checkoutData = [
            'shipping' => null,
            'billing' => null,
        ];

        // If user is logged in, get their saved checkout profile or last order
        if ($request->user()) {
            $profile = $request->user()->checkoutProfile;
            
            if ($profile) {
                // Use saved checkout profile
                $checkoutData = [
                    'shipping' => $profile->shipping_data,
                    'billing' => $profile->billing_data,
                ];
            } else {
                // Try to get data from last order
                $lastOrder = Order::where('user_id', $request->user()->id)
                    ->with(['shipping_details', 'billing_details'])
                    ->latest()
                    ->first();
                
                if ($lastOrder) {
                    if ($lastOrder->shipping_details) {
                        $checkoutData['shipping'] = $lastOrder->shipping_details->only([
                            'first_name', 'last_name', 'address_1', 'address_2',
                            'city', 'state', 'postcode', 'country', 'email', 'phone'
                        ]);
                    }
                    if ($lastOrder->billing_details) {
                        $checkoutData['billing'] = $lastOrder->billing_details->only([
                            'first_name', 'last_name', 'address_1', 'address_2',
                            'city', 'state', 'postcode', 'country', 'email', 'phone'
                        ]);
                    }
                }
            }
        }

        return Inertia::render('Checkout', [
            'product' => $product,
            'identifier' => $asin,
            'savedCheckoutData' => $checkoutData,
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
                $cached['price_upper'], $cached['price_shipping'], $itemWeight
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

    public function saveProfile(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'shipping.first_name' => 'required|string|max:255',
            'shipping.last_name' => 'required|string|max:255',
            'shipping.address_1' => 'nullable|string|max:255',
            'shipping.address_2' => 'nullable|string|max:255',
            'shipping.city' => 'nullable|string|max:255',
            'shipping.state' => 'nullable|string|max:255',
            'shipping.postcode' => 'nullable|string|max:20',
            'shipping.country' => 'nullable|string|max:2',
            'shipping.email' => 'required|email|max:255',
            'shipping.phone' => 'required|string|max:20',
            
            'billing.first_name' => 'required|string|max:255',
            'billing.last_name' => 'required|string|max:255',
            'billing.address_1' => 'nullable|string|max:255',
            'billing.address_2' => 'nullable|string|max:255',
            'billing.city' => 'nullable|string|max:255',
            'billing.state' => 'nullable|string|max:255',
            'billing.postcode' => 'nullable|string|max:20',
            'billing.country' => 'nullable|string|max:2',
            'billing.email' => 'required|email|max:255',
            'billing.phone' => 'required|string|max:20',
        ]);

        $profileData = [
            'user_id' => $request->user()->id,
            'shipping_first_name' => $validated['shipping']['first_name'],
            'shipping_last_name' => $validated['shipping']['last_name'],
            'shipping_address_1' => $validated['shipping']['address_1'] ?? '',
            'shipping_address_2' => $validated['shipping']['address_2'] ?? '',
            'shipping_city' => $validated['shipping']['city'] ?? '',
            'shipping_state' => $validated['shipping']['state'] ?? '',
            'shipping_postcode' => $validated['shipping']['postcode'] ?? '263',
            'shipping_country' => $validated['shipping']['country'] ?? 'ZW',
            'shipping_email' => $validated['shipping']['email'],
            'shipping_phone' => $validated['shipping']['phone'],
            
            'billing_first_name' => $validated['billing']['first_name'],
            'billing_last_name' => $validated['billing']['last_name'],
            'billing_address_1' => $validated['billing']['address_1'] ?? '',
            'billing_address_2' => $validated['billing']['address_2'] ?? '',
            'billing_city' => $validated['billing']['city'] ?? '',
            'billing_state' => $validated['billing']['state'] ?? '',
            'billing_postcode' => $validated['billing']['postcode'] ?? '263',
            'billing_country' => $validated['billing']['country'] ?? 'ZW',
            'billing_email' => $validated['billing']['email'],
            'billing_phone' => $validated['billing']['phone'],
        ];

        UserCheckoutProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $profileData
        );

        return response()->json(['success' => true, 'message' => 'Checkout profile saved']);
    }
}
