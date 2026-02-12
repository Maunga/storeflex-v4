<?php

use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderHistoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// SEO: XML Sitemap
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/orders', [OrderHistoryController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('orders.index');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::post('/search', [SearchController::class, 'handle'])->name('search');
Route::get('/search', [SearchController::class, 'showSearchResults'])->name('search.results');
Route::get('/product/prefetch', [SearchController::class, 'prefetchProduct'])->name('product.prefetch');
Route::get('/product/{asin}', [SearchController::class, 'showProduct'])->name('product.show');

// Checkout
Route::get('/checkout/{asin}', [CheckoutController::class, 'show'])->name('checkout.show');
Route::post('/checkout/save-profile', [CheckoutController::class, 'saveProfile'])->middleware('auth')->name('checkout.saveProfile');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Bookmarks
    Route::get('/bookmarks', [BookmarkController::class, 'index'])->name('bookmarks.index');
    Route::post('/bookmarks', [BookmarkController::class, 'store'])->name('bookmarks.store');
    Route::delete('/bookmarks', [BookmarkController::class, 'destroy'])->name('bookmarks.destroy');
    Route::post('/bookmarks/check', [BookmarkController::class, 'check'])->name('bookmarks.check');
});

require __DIR__.'/auth.php';
