<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    /**
     * Generate XML sitemap for SEO
     */
    public function index(): Response
    {
        // Cache the sitemap for 24 hours
        $sitemap = Cache::remember('sitemap', 60 * 60 * 24, function () {
            return $this->generateSitemap();
        });

        return response($sitemap, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    /**
     * Generate the sitemap XML content
     */
    private function generateSitemap(): string
    {
        $baseUrl = config('app.url');
        $now = now()->toW3cString();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . PHP_EOL;
        $xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . PHP_EOL;

        // Static pages
        $staticPages = [
            ['url' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => '/terms', 'priority' => '0.3', 'changefreq' => 'monthly'],
        ];

        foreach ($staticPages as $page) {
            $xml .= $this->generateUrlEntry(
                $baseUrl . $page['url'],
                $now,
                $page['changefreq'],
                $page['priority']
            );
        }

        // Popular search categories for Zimbabwe market
        $popularSearches = [
            'electronics',
            'mobile phones',
            'laptops',
            'headphones',
            'watches',
            'fashion',
            'beauty products',
            'home appliances',
            'kitchen gadgets',
            'toys',
            'sports equipment',
            'baby products',
            'perfumes dubai',
            'gold jewelry',
            'designer brands',
        ];

        foreach ($popularSearches as $search) {
            $xml .= $this->generateUrlEntry(
                $baseUrl . '/search?q=' . urlencode($search),
                $now,
                'weekly',
                '0.6'
            );
        }

        // Dynamic product pages (if you have a products table)
        // Uncomment and adjust if you store products in database
        /*
        $products = Product::select(['asin', 'updated_at'])
            ->orderBy('updated_at', 'desc')
            ->limit(1000)
            ->get();

        foreach ($products as $product) {
            $xml .= $this->generateUrlEntry(
                $baseUrl . '/product/' . $product->asin,
                $product->updated_at->toW3cString(),
                'weekly',
                '0.8'
            );
        }
        */

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Generate a single URL entry for the sitemap
     */
    private function generateUrlEntry(
        string $url,
        string $lastmod,
        string $changefreq,
        string $priority
    ): string {
        return <<<XML
    <url>
        <loc>{$url}</loc>
        <lastmod>{$lastmod}</lastmod>
        <changefreq>{$changefreq}</changefreq>
        <priority>{$priority}</priority>
    </url>

XML;
    }
}
