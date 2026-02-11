import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

export default function Dashboard({ auth }: PageProps) {
    const [greeting, setGreeting] = useState('Welcome');

    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    return (
        <>
            <Head title="Dashboard" />

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
                            className="text-xs text-neutral-500 hover:text-[#811753] dark:text-neutral-400 dark:hover:text-pink-400 transition-colors"
                        >
                            Log out
                        </Link>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500 dark:text-neutral-400">
                        <svg className="w-12 h-12 mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <p className="text-[13px] leading-relaxed">
                            Your search history will appear here.
                        </p>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-400 to-yellow-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                            </div>
                            Storeflex
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
                                        <div className="w-10 h-10 rounded-lg bg-[#811753]/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#811753]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
