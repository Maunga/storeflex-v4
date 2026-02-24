import { Link } from '@inertiajs/react';
import { Bookmark, User } from '@/types';

interface SidebarBookmarksProps {
    user: User;
    bookmarks: Bookmark[];
    activeAsin?: string | null;
}

interface BookmarksContentProps extends SidebarBookmarksProps {
    className?: string;
    showClose?: boolean;
    onClose?: () => void;
}

function BookmarksContent({ user, bookmarks, activeAsin = null, className = '', showClose = false, onClose }: BookmarksContentProps) {
    return (
        <div className={`flex h-full flex-col ${className}`}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]" title={user.email}>
                    {user.email}
                </span>
                <div className="flex items-center gap-2">
                    {showClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            aria-label="Close menu"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="text-xs text-neutral-500 hover:text-[#86efac] dark:text-neutral-400 dark:hover:text-[#86efac] transition-colors"
                    >
                        Log out
                    </Link>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                    Bookmarks
                </h3>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mb-3">
                    Bookmarks expire after 7 days
                </p>
                {bookmarks.length > 0 ? (
                    <div className="space-y-2">
                        {bookmarks.map((bookmark) => (
                            <Link
                                key={bookmark.id}
                                href={bookmark.asin ? `/product/${bookmark.asin}` : '#'}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                    activeAsin && bookmark.asin === activeAsin
                                        ? 'bg-[#86efac]/10 border border-[#86efac]/30'
                                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
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
                        <p className="text-[10px] mt-1 opacity-75">Bookmarks expire after 7 days</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SidebarBookmarks({ user, bookmarks, activeAsin = null }: SidebarBookmarksProps) {
    return (
        <aside className="hidden lg:flex w-[260px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
            <BookmarksContent user={user} bookmarks={bookmarks} activeAsin={activeAsin} className="p-4" />
        </aside>
    );
}

interface BookmarksDrawerProps extends SidebarBookmarksProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BookmarksDrawer({ user, bookmarks, activeAsin = null, isOpen, onClose }: BookmarksDrawerProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <button
                type="button"
                className="absolute inset-0 bg-neutral-950/40"
                onClick={onClose}
                aria-label="Close menu"
            />
            <aside className="relative h-full w-[280px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-2xl">
                <BookmarksContent
                    user={user}
                    bookmarks={bookmarks}
                    activeAsin={activeAsin}
                    className="p-4"
                    showClose
                    onClose={onClose}
                />
            </aside>
        </div>
    );
}
