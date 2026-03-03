<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmazonAeScraperService;
use Illuminate\Http\Request;

class ProductRetrievalController extends Controller
{
    public function __construct(
        protected AmazonAeScraperService $amazonAeScraperService,
    ) {
    }

    public function __invoke(Request $request)
    {
        // Check if the request data contains a 'source' parameter
        if ($request->has('source')) {
            $source = $request->input('source');

            // Use AmazonAeScraperService for Amazon AE uploads
            if ($source === 'amazon_ae') {
                return $this->amazonAeScraperService->retrieveUploadedProduct($request->get('identifier'));
            }
        }

        // Return an error response if source is not provided or unrecognized
        return response()->json(['error' => 'Invalid or missing source parameter.'], 400);
    }
}
