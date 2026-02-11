import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Terms({ auth }: PageProps) {
    return (
        <>
            <Head title="Terms & Conditions" />

            <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
                {/* Sidebar for logged in users */}
                {auth?.user && (
                    <aside className="hidden lg:flex w-[260px] flex-col p-4 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                            <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]" title={auth.user.email}>
                                {auth.user.email}
                            </span>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="text-xs text-neutral-500 hover:text-[#86efac] dark:text-neutral-400 dark:hover:text-pink-400 transition-colors"
                            >
                                Log out
                            </Link>
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white">
                            <img src="/images/logo.png" alt="Storeflex" className="h-8 w-auto" />
                            
                        </Link>

                        <nav className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Terms Content */}
                    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
                        <article className="max-w-3xl mx-auto">
                            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                                Terms & Conditions
                            </h1>
                            <div className="h-1 w-16 bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-500 rounded-full mb-8"></div>

                            {/* Introduction */}
                            <section className="mb-10">
                                <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    Welcome to Storeflex, valued shoppers! 👋 We're here to ensure a smooth and transparent shopping experience. Below is a concise guide to our pricing and delivery policies.
                                </p>
                            </section>

                            {/* Pricing Policy */}
                            <section className="mb-10">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                                    <span>🏷️</span> Pricing Policy Quick Facts
                                </h2>
                                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800">
                                    <div className="p-5">
                                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                                            Check Before Purchasing 💲
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                            Prices on Amazon can change due to various factors. Verify the current price before buying.
                                        </p>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                                            Post-Payment Price Changes 🔄
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                            Be aware that prices may shift even after your payment is complete.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Delivery Insights */}
                            <section className="mb-10">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                                    <span>🚚</span> Delivery Insights
                                </h2>
                                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800">
                                    <div className="p-5">
                                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                                            Allow 3+ Days to Our Warehouse ⏱️
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                            Factor in a minimum of three days for items to reach our warehouse when planning your purchase.
                                        </p>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                                            We Strive for Fast Delivery 📦
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                            We understand timely delivery is crucial and do our best to expedite your order.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Smooth Shopping Tips */}
                            <section className="mb-10">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                                    <span>🛒</span> Smooth Shopping Tips
                                </h2>
                                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                    <div className="p-5">
                                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                                            Prompt Payment for Swift Processing ✔️
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                            Ensure a faster order process by completing your payment promptly.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Support */}
                            <section className="mb-10">
                                <h2 className="flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                                    <span>📞</span> Support is Just a Click Away
                                </h2>
                                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                    <div className="p-5">
                                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                                            Questions? Contact Us! 🤝
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                            Our customer care team is ready to assist 24/7. Reach out anytime!
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Conclusion */}
                            <section className="bg-gradient-to-br from-purple-500/5 via-pink-400/5 to-yellow-500/5 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center">
                                <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                                    Thank you for choosing Storeflex. Happy shopping, and here's to fast arrivals!
                                </p>
                                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                    Warmly, The Storeflex Team 🧡
                                </p>
                            </section>
                        </article>
                    </main>

                    {/* Footer */}
                    <footer className="px-6 py-4 text-center text-[13px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800">
                        <p>
                            Storeflex by{' '}
                            <a href="https://dxbrunners.com" target="_blank" rel="noopener noreferrer" className="text-[#a855f7] hover:underline">
                                DXB Runners
                            </a>
                            {' '}· Your trusted dropshipping partner for Amazon.ae products
                            {' '}·{' '}
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
