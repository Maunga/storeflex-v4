<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmazonAeScraperService;
use Illuminate\Http\Request;

class ViewController extends Controller
{
    public function __construct(
        protected AmazonAeScraperService $amazonAeScraperService,
    ) {
    }

    public function __invoke(string $identifier, Request $request)
    {
        // Check if the request data contains a 'source' parameter
        if ($request->has('source')) {
            $source = $request->input('source');

            // Use AmazonAeScraperService for Amazon AE view
            if ($source === 'amazon_ae') {
                return $this->amazonAeScraperService->view($identifier);
            }
        }

        // If 'source' parameter is missing or unrecognized, return appropriate fallback message
        return response()->json(['error' => 'Invalid or missing source parameter'], 400);
    }
}
