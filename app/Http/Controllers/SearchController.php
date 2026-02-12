<?php

namespace App\Http\Controllers;

use App\Services\AmazonAeScraperService;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function __construct(
        protected AmazonAeScraperService $amazonAeScraperService
    ) {}

    /**
     * POST /search — Handle the search form submission.
     * Scrapes or searches, caches results, then redirects to a shareable GET URL.
     */
    public function handle(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:2000',
        ]);

        $query = trim($request->input('query'));

        if ($this->isAmazonAeUrl($query)) {
            return $this->handleLinkSearch($query);
        }

        return $this->handleTextSearch($query);
    }

    /**
     * GET /product/prefetch — Prefetch a product by ASIN via AJAX before navigation.
     * Returns JSON so frontend can wait for scrape before navigating.
     */
    public function prefetchProduct(Request $request)
    {
        $request->validate([
            'asin' => 'required|string|max:20',
        ]);

        $asin = $request->input('asin');
        Log::info('prefetchProduct: Starting', ['asin' => $asin]);
        $start = microtime(true);
        
        $product = $this->resolveProduct($asin);

        Log::info('prefetchProduct: resolveProduct complete', ['asin' => $asin, 'found' => (bool)$product, 'elapsed_ms' => round((microtime(true) - $start) * 1000)]);

        if (!$product) {
            Log::warning('Prefetch failed: product not found or expired', [
                'asin' => $asin,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'This product link has expired or the product is no longer available on Amazon.ae.',
            ], 404);
        }

        // Preload variations in background after response is sent
        $this->preloadVariationsInBackground($product, $asin);

        return response()->json([
            'success' => true,
            'asin' => $asin,
        ]);
    }

    /**
     * GET /product/{asin} — Display a product by its ASIN (shareable, reloadable).
     */
    public function showProduct(string $asin)
    {
        Log::info('showProduct: Starting', ['asin' => $asin]);
        $start = microtime(true);
        
        $product = $this->resolveProduct($asin);

        Log::info('showProduct: resolveProduct complete', ['asin' => $asin, 'found' => (bool)$product, 'elapsed_ms' => round((microtime(true) - $start) * 1000)]);

        if (!$product) {
            return redirect('/')->with('toast', [
                'type' => 'error',
                'message' => 'This product link has expired or the product is no longer available on Amazon.ae.',
            ]);
        }

        // Preload variation ASINs into cache in the background
        $this->preloadVariations($product, $asin);

        return Inertia::render('Product', [
            'product' => $product,
            'identifier' => $asin,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    /**
     * GET /search?q=... — Display search results (shareable, reloadable).
     * Re-runs the Oxylabs search on every load so links always work.
     */
    public function showSearchResults(Request $request)
    {
        $query = trim($request->input('q', ''));

        if (empty($query)) {
            return redirect('/');
        }

        // If it looks like an Amazon URL, redirect to scrape flow
        if ($this->isAmazonAeUrl($query)) {
            return $this->handleLinkSearch($query);
        }

        // Cache search results for 30 minutes to avoid repeated Oxylabs calls
        $cacheKey = 'search_results_' . md5(strtolower($query));
        $results = Cache::get($cacheKey);

        if ($results === null) {
            $results = $this->performTextSearch($query);

            if ($results === null) {
                return redirect('/')->with('toast', [
                    'type' => 'error',
                    'message' => 'Search failed. Please try again later.',
                ]);
            }

            // Cache even empty results to avoid re-querying
            Cache::put($cacheKey, $results, now()->addMinutes(30));
        }

        if (count($results) === 0) {
            return redirect('/')->with('toast', [
                'type' => 'error',
                'message' => 'No results found for "' . $query . '". Try a different search term.',
            ]);
        }

        return Inertia::render('SearchResults', [
            'results' => $results,
            'query' => $query,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    // ─── Private helpers ───────────────────────────────────────────────

    /**
     * Resolve a product from cache, DB, or fresh scrape.
     */
    private function resolveProduct(string $asin): ?array
    {
        $start = microtime(true);
        Log::info('resolveProduct: Starting', ['asin' => $asin]);
        
        // 1. Try scraper cache (fastest)
        $cacheKey = config('app.amazon_ae_cache_prefix') . $asin;
        $cached = Cache::get($cacheKey);

        if ($cached) {
            Log::info('resolveProduct: Cache HIT', ['asin' => $asin, 'elapsed_ms' => round((microtime(true) - $start) * 1000)]);
            $itemWeight = $this->amazonAeScraperService->determineWeight($cached);
            $price = $this->amazonAeScraperService->calculatePrice(
                $cached['price_upper'], $cached['price_shipping'], $itemWeight
            );
            Log::info('resolveProduct: Computed price/weight', ['asin' => $asin, 'elapsed_ms' => round((microtime(true) - $start) * 1000)]);
            return array_merge($cached, [
                'dxb_price' => $price,
                'item_weight' => $itemWeight,
                'scraped_url' => config('app.amazon_ae_prefix') . $asin,
            ]);
        }

        Log::info('resolveProduct: Cache MISS, checking DB', ['asin' => $asin]);
        
        // 2. Try DB
        $dbResult = $this->amazonAeScraperService->retrieveUploadedProduct($asin);
        if ($dbResult['success'] && !empty($dbResult['data']['item'])) {
            $item = $dbResult['data']['item'];
            Log::info('resolveProduct: DB HIT', ['asin' => $asin, 'elapsed_ms' => round((microtime(true) - $start) * 1000)]);
            return is_array($item) ? $item : $item->toArray();
        }

        Log::info('resolveProduct: DB MISS, doing fresh scrape', ['asin' => $asin]);
        
        // 3. Fresh scrape
        $url = config('app.amazon_ae_prefix') . $asin;
        $result = $this->amazonAeScraperService->attemptScrape($url);
        
        Log::info('resolveProduct: Scrape complete', ['asin' => $asin, 'success' => $result['success'] ?? false, 'elapsed_ms' => round((microtime(true) - $start) * 1000)]);

        if (!empty($result['success']) && !empty($result['data']['item'])) {
            return $result['data']['item'];
        }

        return null;
    }

    /**
     * Extract variation ASINs that need preloading.
     */
    private function getVariationAsinsToPreload(array $product, string $currentAsin): array
    {
        $variations = $product['variation'] ?? [];
        if (empty($variations) || !is_array($variations)) {
            return [];
        }

        $prefix = config('app.amazon_ae_cache_prefix');
        $asinsToPreload = [];

        foreach ($variations as $v) {
            $varAsin = $v['asin'] ?? null;
            if ($varAsin && $varAsin !== $currentAsin && !Cache::has($prefix . $varAsin)) {
                $asinsToPreload[] = $varAsin;
            }
        }

        return $asinsToPreload;
    }

    /**
     * Preload variation ASINs in parallel using Concurrency facade.
     * Runs in background after response is sent.
     */
    private function preloadVariationsInBackground(array $product, string $currentAsin): void
    {
        $asinsToPreload = $this->getVariationAsinsToPreload($product, $currentAsin);
        
        if (empty($asinsToPreload)) {
            return;
        }

        Log::info('SearchController: Queuing parallel preload for variation ASINs', [
            'count' => count($asinsToPreload),
            'asins' => $asinsToPreload
        ]);

        // Run in background after response using defer
        app()->terminating(function () use ($asinsToPreload) {
            $this->preloadAsinsInParallel($asinsToPreload);
        });
    }

    /**
     * Execute parallel scraping of ASINs using Concurrency.
     */
    private function preloadAsinsInParallel(array $asins): void
    {
        $prefix = config('app.amazon_ae_prefix');
        
        // Build closures for concurrent execution
        $tasks = [];
        foreach ($asins as $asin) {
            $tasks[$asin] = fn() => $this->amazonAeScraperService->pullSiteData($prefix . $asin);
        }

        try {
            $start = microtime(true);
            Concurrency::run($tasks);
            $elapsed = round((microtime(true) - $start) * 1000);
            Log::info('SearchController: Parallel preload complete', [
                'count' => count($asins),
                'elapsed_ms' => $elapsed
            ]);
        } catch (\Throwable $e) {
            Log::warning('SearchController: Parallel preload failed', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Preload variation ASINs into the scraper cache so navigation is instant.
     * Uses deferred execution so the response is sent first.
     * @deprecated Use preloadVariationsInBackground instead
     */
    private function preloadVariations(array $product, string $currentAsin): void
    {
        $this->preloadVariationsInBackground($product, $currentAsin);
    }

    private function isAmazonAeUrl(string $query): bool
    {
        return AmazonAeScraperService::isSiteUrl($query);
    }

    /**
     * Scrape an Amazon link, then redirect to GET /product/{asin}.
     */
    private function handleLinkSearch(string $url)
    {
        try {
            Log::info('SearchController: Starting link search', ['url' => $url]);

            $result = $this->amazonAeScraperService->attemptScrape($url);

            Log::info('SearchController: Scrape result', [
                'success' => $result['success'] ?? false,
                'has_data' => !empty($result['data']),
                'message' => $result['message'] ?? 'no message',
            ]);

            if (!empty($result['success']) && !empty($result['data']['identifier'])) {
                return redirect('/product/' . $result['data']['identifier']);
            }

            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => $result['message'] ?? 'Product lookup failed. Please check the URL and try again.',
            ]);
        } catch (\Exception $e) {
            Log::error('Link search failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Product lookup failed. Please try again later.',
            ]);
        }
    }

    /**
     * Search via Oxylabs, then redirect to GET /search?q=...
     */
    private function handleTextSearch(string $query)
    {
        return redirect('/search?q=' . urlencode($query));
    }

    /**
     * Performs the actual Oxylabs text search. Returns array of results or null on failure.
     */
    private function performTextSearch(string $query): ?array
    {
        try {
            $username = config('app.oxylabs_username');
            $password = config('app.oxylabs_password');

            Log::info('SearchController: Starting text search', ['query' => $query, 'username' => $username ? 'set' : 'missing']);

            $client = new Client();
            $response = $client->request('POST', config('app.oxylabs_endpoint'), [
                'auth' => [$username, $password],
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'source' => 'amazon_search',
                    'query' => $query,
                    'domain' => 'ae',
                    'parse' => true,
                ],
                'http_errors' => false,
                'timeout' => 60,
            ]);

            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody()->getContents(), true);

            Log::info('SearchController: Oxylabs response', [
                'status' => $statusCode,
                'has_results' => isset($body['results'][0]['content']['results']),
                'paid_count' => count($body['results'][0]['content']['results']['paid'] ?? []),
                'organic_count' => count($body['results'][0]['content']['results']['organic'] ?? []),
            ]);

            if ($statusCode === 200 && isset($body['results'][0]['content']['results'])) {
                $content = $body['results'][0]['content']['results'];

                $rawResults = [];
                if (!empty($content['paid'])) {
                    $rawResults = array_merge($rawResults, $content['paid']);
                }
                if (!empty($content['organic'])) {
                    $rawResults = array_merge($rawResults, $content['organic']);
                }

                // Log first result to see actual field names
                if (!empty($rawResults)) {
                    Log::info('SearchController: First result fields', ['keys' => array_keys($rawResults[0])]);
                }

                // Map Oxylabs fields to expected frontend format
                $results = array_map(function ($item) {
                    return [
                        'asin' => $item['asin'] ?? null,
                        'title' => $item['title'] ?? '',
                        'price' => $item['price'] ?? null,
                        'price_upper' => $item['price_upper'] ?? null,
                        'price_strikethrough' => $item['price_strikethrough'] ?? null,
                        'currency' => $item['currency'] ?? 'AED',
                        'rating' => $item['rating'] ?? null,
                        'reviews_count' => $item['reviews_count'] ?? null,
                        'url' => $item['url'] ?? null,
                        'url_image' => $item['url_image'] ?? $item['image'] ?? $item['thumbnail'] ?? null,
                        'is_prime' => $item['is_prime'] ?? false,
                        'is_amazons_choice' => $item['is_amazons_choice'] ?? false,
                        'best_seller' => $item['best_seller'] ?? false,
                        'is_sponsored' => $item['is_sponsored'] ?? false,
                        'brand' => $item['brand'] ?? null,
                        'manufacturer' => $item['manufacturer'] ?? null,
                        'shipping_information' => $item['shipping_information'] ?? $item['delivery'] ?? null,
                        'pos' => $item['pos'] ?? null,
                    ];
                }, $rawResults);

                return $results;
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Text search failed: ' . $e->getMessage());
            return null;
        }
    }
}
