import { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { PageProps, ProductData, Bookmark } from '@/types';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Toast from '@/Components/Toast';
import SidebarBookmarks, { BookmarksDrawer } from '@/Components/SidebarBookmarks';
import axios from 'axios';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface ProductPageProps extends PageProps {
    product: ProductData;
    identifier: string | null;
    canLogin: boolean;
    canRegister: boolean;
}

export default function Product({ auth, product, identifier, canLogin, canRegister }: ProductPageProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('info');
    const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

    // Load bookmarks when logged in
    useEffect(() => {
        if (auth?.user) {
            axios.get('/bookmarks')
                .then(res => {
                    setBookmarks(res.data);
                    // Check if current product is bookmarked
                    const found = res.data.some((b: Bookmark) => b.asin === identifier);
                    setIsBookmarked(found);
                })
                .catch(() => {});
        }
    }, [auth?.user, identifier]);

    const handleBookmark = async () => {
        if (!auth?.user) {
            // Show toast and redirect to login if not authenticated
            setToastType('info');
            setToastMessage('Please log in to save bookmarks');
            setTimeout(() => {
                // router.visit('/login');
            }, 1500);
            return;
        }
        
        setBookmarkLoading(true);
        try {
            if (isBookmarked) {
                // Remove bookmark
                await axios.delete('/bookmarks', { data: { asin: identifier } });
                setBookmarks(prev => prev.filter(b => b.asin !== identifier));
                setIsBookmarked(false);
            } else {
                // Add bookmark
                const res = await axios.post('/bookmarks', {
                    img_url: product.images?.[0] ?? '',
                    title: product.title ?? 'Unknown Product',
                    price: product.dxb_price ? parseFloat(product.dxb_price) : (product.price ?? 0),
                    asin: identifier,
                });
                if (res.data.success) {
                    setBookmarks(prev => [res.data.bookmark, ...prev]);
                    setIsBookmarked(true);
                }
            }
        } catch (error: any) {
            if (error.response?.status === 409) {
                setIsBookmarked(true);
            }
        } finally {
            setBookmarkLoading(false);
        }
    };

    const images = product.images ?? [];
    const bulletPoints = product.bullet_points
        ? product.bullet_points.split('\n').filter(Boolean)
        : [];
    const categories =
        product.category?.[0]?.ladder?.map((c) => c.name) ?? [];
    const delivery = product.delivery ?? product.buybox?.[0]?.delivery_details ?? [];
    const seller = product.featured_merchant ?? product.buybox?.[0] ?? null;
    const reviews = product.reviews?.slice(0, 6) ?? [];
    const stars = product.rating_stars_distribution ?? [];

    return (
        <>
            <Head title={product.title ?? 'Product'} />

            <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
                {/* Sidebar */}
                {auth?.user && (
                    <SidebarBookmarks user={auth.user} bookmarks={bookmarks} activeAsin={identifier} />
                )}
                {auth?.user && (
                    <BookmarksDrawer
                        user={auth.user}
                        bookmarks={bookmarks}
                        activeAsin={identifier}
                        isOpen={isBookmarksOpen}
                        onClose={() => setIsBookmarksOpen(false)}
                    />
                )}

                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
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
                            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white">
                            <img src="/images/logo.png" alt="Storeflex" className="h-8 w-auto" />
                       
                            </Link>
                        </div>

                        {canLogin && (
                            <nav className="flex items-center gap-3">
                                <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                    New Search
                                </Link>
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors font-bold"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href="/register"
                                                className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </nav>
                        )}
                    </header>

                    {/* Product Content */}
                    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10">
                        <div className="max-w-6xl mx-auto animate-page-enter">
                            {/* Breadcrumb */}
                            {categories.length > 0 && (
                                <nav className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 mb-6">
                                    {categories.map((cat, i) => (
                                        <span key={i} className="flex items-center gap-1.5">
                                            {i > 0 && <span>/</span>}
                                            <span className="hover:text-neutral-600 dark:hover:text-neutral-300">{cat}</span>
                                        </span>
                                    ))}
                                </nav>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
                                {/* Image Gallery */}
                                <div className="space-y-3 animate-fade-in-up lg:sticky lg:top-24">
                                    {images.length > 0 && (
                                        <>
                                            <div
                                                className="relative aspect-square bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex items-center justify-center p-6 cursor-zoom-in group"
                                                onClick={() => setLightboxOpen(true)}
                                            >
                                                <img
                                                    src={images[selectedImage]}
                                                    alt={product.title}
                                                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                                <span className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 bg-white/90 dark:bg-neutral-800/90 dark:text-neutral-400 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                                                    Click to zoom
                                                </span>
                                                {product.amazon_choice && (
                                                    <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-semibold text-white bg-[#232F3E] rounded-md shadow-sm">
                                                        Amazon's Choice
                                                    </span>
                                                )}
                                                {product.discount_percentage && product.discount_percentage > 0 && (
                                                    <span className="absolute top-4 right-4 px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-md shadow-sm">
                                                        -{product.discount_percentage}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-6 gap-2">
                                                {images.slice(0, 6).map((img, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedImage(i)}
                                                        className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                                                            selectedImage === i
                                                                ? 'border-emerald-500 dark:border-[#86efac] ring-2 ring-[#86efac]/20 shadow-sm'
                                                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
                                                        }`}
                                                    >
                                                        <img src={img} alt="" className="w-full h-full object-contain bg-white dark:bg-neutral-900 p-1.5" />
                                                    </button>
                                                ))}
                                            </div>
                                            {images.length > 6 && (
                                                <button
                                                    onClick={() => setLightboxOpen(true)}
                                                    className="w-full text-center text-xs text-neutral-400 hover:text-emerald-700 dark:hover:text-[#86efac] transition-colors py-1"
                                                >
                                                    +{images.length - 6} more images
                                                </button>
                                            )}
                                            <Lightbox
                                                open={lightboxOpen}
                                                close={() => setLightboxOpen(false)}
                                                index={selectedImage}
                                                slides={images.map((src) => ({ src }))}
                                                plugins={[Zoom, Thumbnails]}
                                                zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true }}
                                                thumbnails={{ width: 80, height: 80, borderRadius: 8 }}
                                                on={{ view: ({ index }) => setSelectedImage(index) }}
                                                styles={{
                                                    container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
                                                }}
                                                carousel={{ finite: images.length <= 1 }}
                                            />
                                        </>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="space-y-6 animate-fade-in-up animate-delay-100">
                                    {/* Brand */}
                                    {product.brand && (
                                        <p className="text-sm font-medium text-emerald-700 dark:text-[#86efac] uppercase tracking-wide">{product.brand}</p>
                                    )}

                                    {/* Title */}
                                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white leading-snug">
                                        {product.title}
                                    </h1>

                                    {/* Rating */}
                                    {product.rating != null && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg key={star} className={`w-5 h-5 ${star <= Math.round(product.rating!) ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                {product.rating}
                                            </span>
                                            {product.reviews_count != null && (
                                                <span className="text-sm text-neutral-400 dark:text-neutral-500">
                                                    ({product.reviews_count.toLocaleString()} reviews)
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Delivery */}
                                    {/* {delivery.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Delivery</h3>
                                            {delivery.map((d, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                    <svg className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                                                    <span><strong className="text-neutral-700 dark:text-neutral-200">{d.type}</strong> — {d.date?.by}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )} */}

                                    {/* Bullet Points */}
                                    {bulletPoints.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">About this item</h3>
                                            <ul className="space-y-2">
                                                {bulletPoints.map((point, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#86efac] flex-shrink-0" />
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>

                                {/* Column 3: Price & Options */}
                                <div className="space-y-6 animate-fade-in-up animate-delay-200 lg:sticky lg:top-24">
                                
                                    {/* Bookmark Button */}
                                    <button
                                        onClick={handleBookmark}
                                        disabled={bookmarkLoading}
                                        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                            isBookmarked
                                                ? 'bg-[#86efac]/20 text-emerald-700 dark:text-[#86efac] border-2 border-[#86efac]'
                                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-2 border-transparent'
                                        } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {bookmarkLoading ? (
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                        )}
                                        {isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
                                    </button>

                                     {/* Amazon Link */}
                                    {(product.url || product.scraped_url) && (
                                        <a
                                            href={product.url?.startsWith('http') ? product.url : `https://www.amazon.ae${product.url ?? ''}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-emerald-700 dark:text-[#86efac] border-2 border-emerald-600 dark:border-[#86efac] hover:bg-emerald-50 dark:hover:bg-[#86efac]/10 rounded-lg transition-colors"
                                        >
                                            View on Amazon.ae
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                        </a>
                                    )}

                                    
                                    {/* Variations */}
                                    {product.variation && product.variation.length > 1 && (
                                        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                                            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Available Options</h3>
                                            <div className="flex flex-col gap-2">
                                                {product.variation.map((v) => {
                                                    const isActive = v.asin === identifier || v.selected;
                                                    const label = Object.values(v.dimensions).join(' / ');
                                                    return isActive ? (
                                                        <span
                                                            key={v.asin}
                                                            className="px-3 py-2 text-sm rounded-lg border border-[#86efac] bg-[#86efac]/10 text-emerald-700 dark:text-[#86efac] font-medium cursor-default"
                                                            title={v.asin}
                                                        >
                                                            {label}
                                                        </span>
                                                    ) : (
                                                        <Link
                                                            key={v.asin}
                                                            href={`/product/${v.asin}`}
                                                            replace
                                                            className="px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-[#86efac] hover:text-emerald-700 dark:hover:text-[#86efac] hover:bg-[#86efac]/5 transition-colors"
                                                            title={v.asin}
                                                        >
                                                            {label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Price Block */}
                                    <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4 shadow-sm">
                                        {product.price != null && product.price > 0 && product.stock !== 'Currently unavailable' ? (
                                        <>
                                            {product.dxb_price && (
                                                <div className="pb-4 border-b border-neutral-100 dark:border-neutral-700">
                                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">Your Price (Delivered to Zimbabwe)</span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl font-extrabold text-emerald-700 dark:text-[#86efac] tracking-tight">
                                                            ${product.dxb_price}
                                                        </span>
                                                        <span className="text-sm text-neutral-400">USD</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-400 mt-1">Includes shipping & handling</p>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs text-neutral-400 block mb-0.5">Amazon.ae Price</span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
                                                            {product.currency ?? 'AED'} {product.price}
                                                        </span>
                                                        {product.price_strikethrough != null && product.price_strikethrough > 0 && (
                                                            <span className="text-sm text-neutral-400 line-through">
                                                                {product.currency ?? 'AED'} {product.price_strikethrough}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {product.discount_percentage && product.discount_percentage > 0 && (
                                                    <span className="px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                                        {product.discount_percentage}% OFF
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-neutral-500 dark:text-neutral-400 font-medium">Price unavailable</p>
                                                <p className="text-xs text-neutral-400 mt-1">Check back later or view on Amazon</p>
                                            </div>
                                        )}

                                        {product.stock && (
                                            <div className={`flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-700 ${product.stock === 'In Stock' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                <span className={`w-2 h-2 rounded-full ${product.stock === 'In Stock' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                <span className="text-sm font-medium">{product.stock}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Buy Button */}
                                    <Link
                                        href={`/checkout/${identifier}`}
                                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:text-neutral-900 dark:hover:bg-emerald-400 rounded-lg transition-colors shadow-sm"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="9" cy="21" r="1" />
                                            <circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                        </svg>
                                        Buy Now
                                    </Link>


                                </div>
                            </div>

                            {/* Technical Details */}
                            {product.technical_details && product.technical_details.length > 0 && (
                                <section className="mt-12">
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Technical Details</h2>
                                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                {product.technical_details.map((td, i) => (
                                                    <tr key={i} className={i % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-800/30' : ''}>
                                                        <td className="px-5 py-3 font-medium text-neutral-700 dark:text-neutral-300 w-1/3">{td.name}</td>
                                                        <td className="px-5 py-3 text-neutral-500 dark:text-neutral-400">{td.value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {/* Rating Distribution */}
                            {stars.length > 0 && (
                                <section className="mt-12">
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Customer Ratings</h2>
                                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-md">
                                        {[...stars].sort((a, b) => b.rating - a.rating).map((s) => (
                                            <div key={s.rating} className="flex items-center gap-3 mb-2">
                                                <span className="text-sm text-neutral-500 dark:text-neutral-400 w-14">{s.rating} star</span>
                                                <div className="flex-1 h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                                        style={{ width: `${s.percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-neutral-400 w-10 text-right">{s.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Reviews */}
                            {reviews.length > 0 && (
                                <section className="mt-12 mb-8">
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Top Reviews</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {reviews.map((r) => (
                                            <div key={r.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <svg key={s} className={`w-4 h-4 ${s <= r.rating ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{r.author}</span>
                                                    {r.is_verified && (
                                                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded">Verified</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-4">
                                                    {r.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
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
            
            {/* Toast Notifications */}
            <Toast 
                message={toastMessage} 
                type={toastType} 
                onDismiss={() => setToastMessage(null)} 
            />
        </>
    );
}
