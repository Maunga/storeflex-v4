import { Link } from '@inertiajs/react';
import { useCart, CartItem } from '@/Contexts/CartContext';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-neutral-900 shadow-xl z-50 transform transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            Your Cart ({items.length})
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-2">Your cart is empty</p>
                                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                                    Add items from product pages to get started
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <CartItemCard
                                        key={item.asin}
                                        item={item}
                                        onRemove={() => removeItem(item.asin)}
                                        onUpdateQuantity={(qty) => updateQuantity(item.asin, qty)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-4 space-y-4">
                            {/* Total */}
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
                                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                    ${getTotal().toFixed(2)}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Shipping calculated at checkout
                            </p>

                            {/* Actions */}
                            <div className="space-y-2">
                                <Link
                                    href="/cart"
                                    onClick={onClose}
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:text-neutral-900 dark:hover:bg-emerald-400 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                    Proceed to Checkout
                                </Link>
                                <button
                                    onClick={clearCart}
                                    className="w-full px-4 py-2 text-sm text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

interface CartItemCardProps {
    item: CartItem;
    onRemove: () => void;
    onUpdateQuantity: (quantity: number) => void;
}

function CartItemCard({ item, onRemove, onUpdateQuantity }: CartItemCardProps) {
    return (
        <div className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
            {/* Image */}
            <Link href={`/product/${item.asin}`} className="flex-shrink-0">
                <div className="w-20 h-20 bg-white dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain p-1"
                    />
                </div>
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <Link href={`/product/${item.asin}`}>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-[#86efac] transition-colors">
                        {item.title}
                    </h3>
                </Link>
                {item.brand && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {item.brand}
                    </p>
                )}
                <p className="text-sm font-semibold text-emerald-700 dark:text-[#86efac] mt-1">
                    ${item.dxbPrice.toFixed(2)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => onUpdateQuantity(item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white w-8 text-center">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() => onUpdateQuantity(item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <button
                        onClick={onRemove}
                        className="ml-auto p-1.5 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Remove item"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Cart Icon component for headers
interface CartIconProps {
    onClick: () => void;
    className?: string;
}

export function CartIcon({ onClick, className = '' }: CartIconProps) {
    const { getItemCount } = useCart();
    const count = getItemCount();

    return (
        <button
            onClick={onClick}
            className={`relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors ${className}`}
            aria-label="Open cart"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-emerald-600 dark:bg-[#86efac] dark:text-neutral-900 rounded-full">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
}
