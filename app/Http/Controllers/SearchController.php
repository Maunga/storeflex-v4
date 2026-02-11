<?php

namespace App\Http\Controllers;

use App\Services\AmazonAeScraperService;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
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
     * GET /product/{asin} — Display a product by its ASIN (shareable, reloadable).
     */
    public function showProduct(string $asin)
    {
        // 1. Try the scraper cache first (fastest)
        $cacheKey = config('app.amazon_ae_cache_prefix') . $asin;
        $cached = Cache::get($cacheKey);

        if ($cached) {
            $itemWeight = $this->amazonAeScraperService->determineWeight($cached);
            $price = $this->amazonAeScraperService->calculatePrice(
                $cached['price_upper'], $cached['price_shipping'], $itemWeight
            );
            $product = array_merge($cached, [
                'dxb_price' => $price,
                'item_weight' => $itemWeight,
                'scraped_url' => config('app.amazon_ae_prefix') . $asin,
            ]);

            return Inertia::render('Product', [
                'product' => $product,
                'identifier' => $asin,
            ]);
        }

        // 2. Try the database (AmazonAeItem)
        $dbResult = $this->amazonAeScraperService->retrieveUploadedProduct($asin);
        if ($dbResult['success'] && !empty($dbResult['data']['item'])) {
            return Inertia::render('Product', [
                'product' => $dbResult['data']['item'],
                'identifier' => $asin,
            ]);
        }

        // 3. Try a fresh scrape
        $url = config('app.amazon_ae_prefix') . $asin;
        $result = $this->amazonAeScraperService->attemptScrape($url);

        if (!empty($result['success']) && !empty($result['data']['item'])) {
            return Inertia::render('Product', [
                'product' => $result['data']['item'],
                'identifier' => $result['data']['identifier'] ?? $asin,
            ]);
        }

        return redirect('/')->with('toast', [
            'type' => 'error',
            'message' => 'Product not found. It may no longer be available.',
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
        ]);
    }

    // ─── Private helpers ───────────────────────────────────────────────

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
            $username = env('OXYLABS_USERNAME');
            $password = env('OXYLABS_PASSWORD');

            Log::info('SearchController: Starting text search', ['query' => $query, 'username' => $username ? 'set' : 'missing']);

            $client = new Client();
            $response = $client->request('POST', 'https://realtime.oxylabs.io/v1/queries', [
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

                $results = [];
                if (!empty($content['paid'])) {
                    $results = array_merge($results, $content['paid']);
                }
                if (!empty($content['organic'])) {
                    $results = array_merge($results, $content['organic']);
                }

                return $results;
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Text search failed: ' . $e->getMessage());
            return null;
        }
    }
}
