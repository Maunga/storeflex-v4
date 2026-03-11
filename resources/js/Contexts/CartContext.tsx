import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductData } from '@/types';

export interface CartItem {
    asin: string;
    title: string;
    price: number;
    dxbPrice: number;
    image: string;
    quantity: number;
    currency?: string;
    brand?: string;
    stock?: string;
    productData: ProductData; // Full product data for checkout
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: ProductData, identifier: string) => void;
    removeItem: (asin: string) => void;
    updateQuantity: (asin: string, quantity: number) => void;
    clearCart: () => void;
    getItemCount: () => number;
    getTotal: () => number;
    isInCart: (asin: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'storeflex_cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    setItems(parsed);
                }
            }
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
        }
        setIsHydrated(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            } catch (error) {
                console.error('Failed to save cart to localStorage:', error);
            }
        }
    }, [items, isHydrated]);

    const addItem = (product: ProductData, identifier: string) => {
        const dxbPrice = parseFloat(String(product.dxb_price ?? product.price ?? 0)) || 0;
        
        setItems((prevItems) => {
            const existingIndex = prevItems.findIndex((item) => item.asin === identifier);
            
            if (existingIndex >= 0) {
                // Item already in cart - increase quantity
                const updated = [...prevItems];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + 1,
                };
                return updated;
            }
            
            // Add new item
            const newItem: CartItem = {
                asin: identifier,
                title: product.title ?? 'Unknown Product',
                price: product.price ?? 0,
                dxbPrice,
                image: product.images?.[0] ?? '/placeholder.png',
                quantity: 1,
                currency: product.currency,
                brand: product.brand,
                stock: product.stock,
                productData: product,
            };
            
            return [...prevItems, newItem];
        });
    };

    const removeItem = (asin: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.asin !== asin));
    };

    const updateQuantity = (asin: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(asin);
            return;
        }
        
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.asin === asin ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getItemCount = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotal = () => {
        return items.reduce((total, item) => total + item.dxbPrice * item.quantity, 0);
    };

    const isInCart = (asin: string) => {
        return items.some((item) => item.asin === asin);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                getItemCount,
                getTotal,
                isInCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
