import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, router, usePage, useRemember } from '@inertiajs/react';
import { PageProps, Bookmark } from '@/types';
import Toast from '@/Components/Toast';
import SidebarBookmarks, { BookmarksDrawer } from '@/Components/SidebarBookmarks';
import SEO from '@/Components/SEO';
import axios from 'axios';

interface MarketingStatement {
    text: string;
}

const marketingStatements: MarketingStatement[] = [
    { text: 'Amazon.ae' },
    { text: 'any product name' },
    { text: 'a direct link' },
];

interface WelcomeProps extends PageProps {
    canLogin: boolean;
    canRegister: boolean;
}

export default function Welcome({ auth, canLogin, canRegister }: WelcomeProps) {
    const [query, setQuery] = useRemember('', 'search-query');
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = usePage<WelcomeProps>().props;
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('error');
    const shownToastRef = useRef<string | null>(null);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
    
    // Typing animation state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Show flash toast messages (only once per unique toast)
    useEffect(() => {
        if (toast && toast.message && toast.message !== shownToastRef.current) {
            shownToastRef.current = toast.message;
            setToastType(toast.type ?? 'error');
            setToastMessage(toast.message);
        }
    }, [toast]);

    useEffect(() => {
        if (auth?.user) {
            axios.get('/bookmarks')
                .then((res) => setBookmarks(res.data))
                .catch(() => {});
        }
    }, [auth?.user]);
    
    useEffect(() => {
        const currentStatement = marketingStatements[currentIndex].text;
        const typingSpeed = isDeleting ? 50 : 100;
        const pauseTime = 2000;
        
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < currentStatement.length) {
                    setDisplayText(currentStatement.slice(0, displayText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(displayText.slice(0, -1));
                } else {
                    setIsDeleting(false);
                    setCurrentIndex((prev) => (prev + 1) % marketingStatements.length);
                }
            }
        }, typingSpeed);
        
        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, currentIndex]);

    const handleTextareaInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const setQuickAction = (value: string) => {
        setQuery(value);
        textareaRef.current?.focus();
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        setLoading(true);

        // Amazon URLs need the POST scrape flow; text queries go to GET /search?q=
        const isAmazonUrl = /^https?:\/\/(www\.)?amazon\.ae\//i.test(trimmed);
        if (isAmazonUrl) {
            router.post('/search', { query: trimmed }, {
                onFinish: () => setLoading(false),
            });
        } else {
            router.get('/search', { q: trimmed }, {
                onFinish: () => setLoading(false),
            });
        }
    };

    return (
        <>
            <SEO 
                title="Shop Premium Products from Dubai | Delivered to Zimbabwe"
                description="Discover amazing products from Amazon UAE delivered straight to Zimbabwe. Fast, reliable dropshipping with authentic products at competitive prices. Shop electronics, fashion, home goods and more."
                keywords="dropshipping Zimbabwe, Dubai to Zimbabwe shipping, Amazon UAE Zimbabwe, online shopping Zimbabwe, import from Dubai, Storeflex, Zimbabwe online store, UAE products delivery, Dubai shopping Zimbabwe"
            />
            <Toast message={toastMessage} type={toastType} onDismiss={() => setToastMessage(null)} />

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-white/60 dark:bg-neutral-950/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 animate-fade-in">
                        <div className="w-10 h-10 border-4 border-neutral-200 border-t-[#86efac] rounded-full animate-spin" />
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Searching...</span>
                    </div>
                </div>
            )}

            <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
                {/* Sidebar - only shown to logged in users */}
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

                {/* Main Content */}
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
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#000000] hover:bg-[#111111] rounded-lg transition-colors"
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

                    {/* Hero Section */}
                    <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
                        <div className="max-w-[720px] w-full animate-fade-in">
                            {/* <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-6 text-[13px] font-medium text-[#eab308] bg-[#eab308]/10 rounded-full animate-fade-in animation-delay-100">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                Powered by DXB Runners
                            </span> */}

                            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-4 text-neutral-900 dark:text-white animate-fade-in animation-delay-100">
                                Find products from<br />
                                <span className="bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-500 bg-clip-text text-transparent inline-block min-w-[200px] sm:min-w-[280px]">
                                    {displayText}
                                    <span className="animate-cursor text-pink-400">|</span>
                                </span>{' '}
                                instantly
                            </h1>

                            <p className="text-[17px] text-neutral-500 dark:text-neutral-400 mb-10 leading-relaxed animate-fade-in animation-delay-200">
                                Paste an Amazon.ae link or search for any product. We'll help you source and supply it through our dropshipping network.
                            </p>

                            <form onSubmit={handleSubmit} className="w-full max-w-[640px] mx-auto animate-fade-in animation-delay-200">
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow focus-within:border-[#86efac] focus-within:ring-[3px] focus-within:ring-[#86efac]/15">
                                    <textarea
                                        ref={textareaRef}
                                        name="query"
                                        value={query}
                                        onChange={handleTextareaInput}
                                        className="w-full min-h-[64px] max-h-[200px] p-5 pr-[60px] text-base leading-relaxed bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 border-none resize-none outline-none"
                                        placeholder="Paste an Amazon.ae link or search for a product..."
                                        rows={1}
                                    />
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-md">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                                </svg>
                                                Paste URL
                                            </span>
                                            <span className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-md">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                </svg>
                                                Search product
                                            </span>
                                        </div>
                                        <button
                                            type="submit"
                                            className="flex items-center justify-center w-10 h-10 bg-[#86efac] hover:bg-[#61113E] text-white rounded-[10px] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            disabled={!query.trim()}
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="flex flex-wrap justify-center gap-2.5 mt-8 animate-fade-in animation-delay-300">
                                <QuickActionButton
                                    onClick={() => setQuickAction('Electronics')}
                                    icon={
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    }
                                    label="Electronics"
                                />
                                <QuickActionButton
                                    onClick={() => setQuickAction('Fashion accessories')}
                                    icon={
                                        <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46A2 2 0 0 0 2 5.38v13.24a2 2 0 0 0 1.62 1.96L8 22a4 4 0 0 0 8 0l4.38-1.42A2 2 0 0 0 22 18.62V5.38a2 2 0 0 0-1.62-1.92z"></path>
                                    }
                                    label="Fashion"
                                />
                                <QuickActionButton
                                    onClick={() => setQuickAction('Home kitchen items')}
                                    icon={
                                        <>
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                        </>
                                    }
                                    label="Home & Kitchen"
                                />
                                <QuickActionButton
                                    onClick={() => setQuickAction('Sports outdoor gear')}
                                    icon={
                                        <>
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                                        </>
                                    }
                                    label="Sports"
                                />
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="px-6 py-4 text-center text-[13px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800">
                        <p>
                            Storeflex by{' '}
                            <a href="https://dxbrunners.com" target="_blank" rel="noopener noreferrer" className="text-[#a855f7] hover:underline">
                                DXB Runners
                            </a>{' '}
                            &middot; Your trusted dropshipping partner for Amazon.ae products
                            &middot;{' '}
                            <Link href="/terms" className="text-[#a855f7] hover:underline">
                                Terms & Conditions
                            </Link>
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}

interface QuickActionButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function QuickActionButton({ onClick, icon, label }: QuickActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-[10px] hover:border-[#86efac] hover:text-[#86efac] transition-colors"
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {icon}
            </svg>
            {label}
        </button>
    );
}
