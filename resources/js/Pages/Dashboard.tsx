import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Bookmark } from '@/types';
import SEO from '@/Components/SEO';
import axios from 'axios';

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

export default function Dashboard({ auth }: PageProps) {
    const [greeting, setGreeting] = useState('Welcome');
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    useEffect(() => {
        setGreeting(getGreeting());
        
        // Load bookmarks
        if (auth?.user) {
            axios.get('/bookmarks')
                .then(res => setBookmarks(res.data))
                .catch(() => {});
        }
    }, [auth?.user]);

    return (
        <>
            <SEO 
                title="Dashboard"
                description="Manage your Storeflex account. Track orders, view bookmarks, and shop premium products from Dubai delivered to Zimbabwe."
                keywords="dashboard, account, orders, bookmarks, Storeflex Zimbabwe"
            />

            <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
                {/* Sidebar */}
                <aside className="hidden lg:flex w-[260px] flex-col p-4 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                        <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]" title={auth?.user?.email}>
                            {auth?.user?.email}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-xs text-neutral-500 hover:text-[#86efac] dark:text-neutral-400 dark:hover:text-[#86efac] transition-colors"
                        >
                            Log out
                        </Link>
                    </div>
                    
                    {/* Bookmarks */}
                    <div className="flex-1 overflow-y-auto">
                        <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                            Bookmarks
                        </h3>
                        {bookmarks.length > 0 ? (
                            <div className="space-y-2">
                                {bookmarks.map((bookmark) => (
                                    <Link
                                        key={bookmark.id}
                                        href={bookmark.asin ? `/product/${bookmark.asin}` : '#'}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        <img
                                            src={bookmark.img_url}
                                            alt=""
                                            className="w-10 h-10 object-contain rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-tight">
                                                {bookmark.title}
                                            </p>
                                            <p className="text-xs font-medium text-emerald-600 dark:text-[#86efac] mt-0.5">
                                                ${bookmark.price}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-neutral-400 dark:text-neutral-500">
                                <svg className="w-10 h-10 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <p className="text-xs">No bookmarks yet</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white">
                            <img src="/images/logo.png" alt="Storeflex" className="h-8 w-auto" />
                           
                        </Link>

                        <nav className="flex items-center gap-3">
                            <Link
                                href="/profile"
                                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                Profile
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                Log out
                            </Link>
                        </nav>
                    </header>

                    {/* Dashboard Content */}
                    <main className="flex-1 p-4 sm:p-6">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white mb-4 sm:mb-6">
                                {greeting}{auth?.user?.name ? `, ${auth.user.name}` : ''}!
                            </h1>

                            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-3 sm:mb-4">
                                    Quick Actions
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-[#86efac]/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#86efac]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-white">New Search</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Find products on Amazon.ae</p>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-emerald-600 dark:text-[#86efac]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 3h6l1 2h4v16H4V5h4l1-2z" />
                                                <path d="M8 10h8" />
                                                <path d="M8 14h8" />
                                                <path d="M8 18h5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-white">Order History</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Review past orders</p>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#a855f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-white">Profile Settings</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your account</p>
                                        </div>
                                    </Link>
                                </div>
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
