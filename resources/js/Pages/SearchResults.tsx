import { useState, useMemo, useEffect, FormEvent, ChangeEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, SearchResultItem, Bookmark } from '@/types';
import axios from 'axios';
import NProgress from 'nprogress';
import SidebarBookmarks, { BookmarksDrawer } from '@/Components/SidebarBookmarks';
import SEO from '@/Components/SEO';

type SortOption = 'relevant' | 'price_low' | 'price_high' | 'rating';

interface SearchResultsPageProps extends PageProps {
    results: SearchResultItem[];
    query: string;
    canLogin: boolean;
    canRegister: boolean;
}

export default function SearchResults({ auth, results, query, canLogin, canRegister }: SearchResultsPageProps) {
    const [searchQuery, setSearchQuery] = useState(query);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Fetching product details...');
    const [sortBy, setSortBy] = useState<SortOption>('relevant');
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

    // Load bookmarks when logged in
    useEffect(() => {
        if (auth?.user) {
            axios.get('/bookmarks')
                .then((res) => setBookmarks(res.data))
                .catch(() => {});
        }
    }, [auth?.user]);

    const sortedResults = useMemo(() => {
        const pricedResults = results.filter((item) => (item.price ?? 0) > 0);

        if (sortBy === 'relevant') return pricedResults;

        return [...pricedResults].sort((a, b) => {
            const priceA = a.price ?? Infinity;
            const priceB = b.price ?? Infinity;
            switch (sortBy) {
                case 'price_low':
                    return priceA - priceB;
                case 'price_high':
                    return priceB - priceA;
                case 'rating':
                    return (b.rating ?? 0) - (a.rating ?? 0);
                default:
                    return 0;
            }
        });
    }, [results, sortBy]);

    const handleNewSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        setLoadingMessage('Searching...');
        router.get('/search', { q: searchQuery.trim() }, {
            onFinish: () => setLoading(false),
        });
    };

    const handleProductClick = async (item: SearchResultItem) => {
        if (item.asin) {
            setLoading(true);
            setLoadingMessage('Fetching product details...');
            NProgress.start();

            try {
                // Prefetch/scrape the product first
                const response = await axios.get('/product/prefetch', { params: { asin: item.asin } });

                if (response.data.success) {
                    // Product is now cached, navigate to it
                    setLoadingMessage('Redirecting...');
                    router.visit(`/product/${item.asin}`, {
                        onFinish: () => {
                            setLoading(false);
                            NProgress.done();
                        },
                    });
                } else {
                    // Handle non-success response
                    setLoading(false);
                    NProgress.done();
                    alert(response.data.message || 'Failed to load product. Please try again.');
                }
            } catch (error: any) {
                setLoading(false);
                NProgress.done();
                const message = error.response?.data?.message || 'Failed to load product. Please try again.';
                alert(message);
            }
            return;
        }

        // Fallback: POST the URL for scraping if no ASIN
        const amazonUrl = item.url?.startsWith('http')
            ? item.url
            : `https://www.amazon.ae${item.url ?? ''}`;
        setLoading(true);
        setLoadingMessage('Scraping product...');
        router.post('/search', { query: amazonUrl }, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <>
            <SEO 
                title={`Search: ${query} - Products from Dubai`}
                description={`Find ${query} products shipped from Dubai to Zimbabwe. Browse ${results.length} results with competitive prices and fast delivery from Amazon UAE.`}
                keywords={`${query}, buy ${query} Zimbabwe, Dubai shipping, Amazon UAE products, online shopping Zimbabwe`}
            />

            <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
                {/* Sidebar */}
                {auth?.user && (
                    <SidebarBookmarks user={auth.user} bookmarks={bookmarks} />
                )}
                {auth?.user && (
                    <BookmarksDrawer
                        user={auth.user}
                        bookmarks={bookmarks}
                        isOpen={isBookmarksOpen}
                        onClose={() => setIsBookmarksOpen(false)}
                    />
                )}

                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="flex flex-wrap items-center gap-3 px-3 sm:px-6 py-3 sm:py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            {auth?.user && (
                                <button
                                    type="button"
                                    onClick={() => setIsBookmarksOpen(true)}
                                    className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
                                    aria-label="Open menu"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </svg>
                                </button>
                            )}
                            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 font-bold text-lg sm:text-xl text-neutral-900 dark:text-white shrink-0">
                            <img src="/images/logo.png" alt="Storeflex" className="h-7 sm:h-8 w-auto" />
                            <span className="hidden xs:inline">Storeflex</span>
                            </Link>
                        </div>

                        <form onSubmit={handleNewSearch} className="flex-1 min-w-0 order-last sm:order-none w-full sm:w-auto sm:max-w-xl">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    placeholder="Search for products..."
                                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                        </form>

                        {canLogin && (
                            <nav className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors font-bold"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href="/register"
                                                className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </nav>
                        )}
                    </header>

                    {/* Loading overlay */}
                    {loading && (
                        <div className="fixed inset-0 bg-white/60 dark:bg-neutral-950/60 z-50 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-neutral-200 border-t-[#86efac] rounded-full animate-spin" />
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{loadingMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    <main className="flex-1 w-full px-2 sm:px-6 py-4 sm:py-6">
                        <div className="w-full max-w-6xl mx-auto animate-page-enter">
                            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{sortedResults.length}</span> results for "<span className="font-medium text-neutral-700 dark:text-neutral-300">{query}</span>"
                                </p>
                                
                                {/* Sort dropdown */}
                                <div className="flex items-center gap-2">
                                    <label htmlFor="sort" className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Sort by:
                                    </label>
                                    <select
                                        id="sort"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="px-3 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#86efac]/50 focus:border-[#86efac] cursor-pointer"
                                    >
                                        <option value="relevant">Most Relevant</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                    </select>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                                {sortedResults.map((item, index) => (
                                    <button
                                        key={item.asin ?? index}
                                        onClick={() => handleProductClick(item)}
                                        className="group w-full min-w-0 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden text-left transition-all hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-600 sm:hover:-translate-y-0.5"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-square bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
                                            {item.url_image ? (
                                                <img
                                                    src={item.url_image}
                                                    alt={item.title}
                                                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-300 dark:text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                            )}
                                            {item.is_prime && (
                                                <span className="absolute top-1 left-1 sm:top-2 sm:left-2 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-400 rounded">
                                                    Prime
                                                </span>
                                            )}
                                            {item.best_seller && (
                                                <span className="absolute top-1 right-1 sm:top-2 sm:right-2 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/40 dark:text-orange-400 rounded">
                                                    Best Seller
                                                </span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="p-2 sm:p-4 space-y-1 sm:space-y-2 overflow-hidden">
                                            <h3 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#86efac] transition-colors break-words">
                                                {item.title}
                                            </h3>

                                            {/* Rating */}
                                            {item.rating != null && (
                                                <div className="flex items-center gap-1 sm:gap-1.5">
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <svg key={s} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${s <= Math.round(item.rating!) ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs text-neutral-400">
                                                        ({item.reviews_count?.toLocaleString() ?? 0})
                                                    </span>
                                                </div>
                                            )}

                                            {/* Price */}
                                            <div className="space-y-0.5 overflow-hidden">
                                                {item.price != null ? (
                                                    <>
                                                        <div className="flex items-baseline gap-1 flex-wrap">
                                                            <span className="text-sm sm:text-lg font-bold text-neutral-900 dark:text-white truncate">
                                                                {item.currency ?? 'AED'} {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                            {item.price_strikethrough != null && item.price_strikethrough > 0 && (
                                                                <span className="text-[10px] sm:text-xs text-neutral-400 line-through">
                                                                    {item.price_strikethrough}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.dxb_price != null && (
                                                            <span className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                                                                est. ~${parseFloat(String(item.dxb_price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                                            </span>
                                                        )}
                                                    </>
                                                ) : null}
                                            </div>

                                            {/* Shipping - hidden on mobile */}
                                            {item.shipping_information && (
                                                <p className="hidden sm:block text-[11px] text-neutral-400 dark:text-neutral-500 leading-snug line-clamp-1">
                                                    {item.shipping_information}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="px-6 py-4 text-center text-[13px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800">
                        <p>
                            Storeflex by{' '}
                            <a href="https://dxbrunners.com" target="_blank" rel="noopener noreferrer" className="text-[#a855f7] hover:underline">DXB Runners</a>
                            {' '}&middot; Your trusted dropshipping partner for Amazon.ae products
                            &middot;{' '}
                            <Link href="/terms" className="text-[#a855f7] hover:underline">Terms & Conditions</Link>
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
