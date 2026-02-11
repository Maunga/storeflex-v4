<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttemptScrapeRequest;
use App\Services\AliExpressScraperService;
use App\Services\AmazonAeScraperService;
use App\Services\NoonScraperService;
use App\Services\SheinScraperService;
use Illuminate\Http\Request;

class ScrapeController extends Controller
{
    public function __construct(
        protected AmazonAeScraperService $amazonAeScraperService,
    ) {
    }

    public function __invoke(AttemptScrapeRequest $request)
    {
       

        // Amazon AE
        if (AmazonAeScraperService::isSiteUrl($request->url)) {
            return $this->amazonAeScraperService->attemptScrape($request->url);
        }

        // Handle the case where the URL does not match the accepted shops.
        return response()->json(['error' => 'Invalid URL provided.'], 400);
    }
}
