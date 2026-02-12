import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Bookmark } from '@/types';
import SidebarBookmarks, { BookmarksDrawer } from '@/Components/SidebarBookmarks';
import axios from 'axios';

interface ProductSummary {
    name?: string;
    image?: string | null;
}

interface PurchasedItem {
    id: number;
    quantity: number;
    total: number;
    product?: ProductSummary | null;
}

interface OrderSummary {
    id: number;
    woocommerce_order_id?: number | string | null;
    total: number;
    payment_method?: string;
    created_at?: string;
    purchased_items?: PurchasedItem[];
}

interface OrdersPageProps extends PageProps {
    orders: {
        data: OrderSummary[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
}

const formatDate = (value?: string) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
};

export default function Orders({ auth, orders }: OrdersPageProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

    useEffect(() => {
        if (auth?.user) {
            axios.get('/bookmarks')
                .then((res) => setBookmarks(res.data))
                .catch(() => {});
        }
    }, [auth?.user]);

    return (
        <>
            <Head title="Order History" />

            <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
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
                        <nav className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                Dashboard
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

                    <main className="flex-1 p-4 sm:p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Order history</h1>
                                <Link
                                    href="/"
                                    className="text-sm font-medium text-emerald-600 dark:text-[#86efac] hover:underline"
                                >
                                    New search
                                </Link>
                            </div>

                            {orders?.data?.length ? (
                                <div className="space-y-4">
                                    {orders.data.map((order) => (
                                        <div key={order.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">Order #{order.id}</p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        {formatDate(order.created_at)}{order.woocommerce_order_id ? ` · WooCommerce ${order.woocommerce_order_id}` : ''}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                    AED {order.total}
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                {(order.purchased_items || []).map((item) => (
                                                    <div key={item.id} className="flex items-center gap-3">
                                                        <img
                                                            src={item.product?.image || '/placeholder.png'}
                                                            alt={item.product?.name || 'Item'}
                                                            className="w-12 h-12 rounded-lg object-contain bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm text-neutral-900 dark:text-white line-clamp-1">
                                                                {item.product?.name || 'Order item'}
                                                            </p>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Qty: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-sm text-neutral-600 dark:text-neutral-300">AED {item.total}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center text-neutral-500 dark:text-neutral-400">
                                    <p className="text-sm">No orders yet.</p>
                                    <Link
                                        href="/"
                                        className="inline-flex mt-3 text-sm font-medium text-emerald-600 dark:text-[#86efac] hover:underline"
                                    >
                                        Start a new search
                                    </Link>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
