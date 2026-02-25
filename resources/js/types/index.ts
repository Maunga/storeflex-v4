export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface Auth {
    user: User | null;
}

export interface Toast {
    type: 'error' | 'success' | 'info';
    message: string;
}

export interface PageProps {
    auth: Auth;
    toast?: Toast | null;
    [key: string]: unknown;
}

/* ── Product (from /api/store/search) ── */

export interface ProductDelivery {
    date: { by: string };
    type: string;
}

export interface ProductBuybox {
    delivery_details: ProductDelivery[];
    price: number;
    seller_id: string;
    seller_name: string;
    seller_url: string;
    ships_from_name: string;
    stock: string;
}

export interface ProductReview {
    author: string;
    content: string;
    id: string;
    is_verified: boolean;
    product_attributes?: string;
    rating: number;
    review_from: string;
    timestamp: string;
    title: string;
    helpful_count?: number;
}

export interface ProductVariation {
    asin: string;
    dimensions: Record<string, string>;
    selected: boolean;
}

export interface ProductData {
    asin: string;
    title: string;
    product_name?: string;
    brand?: string;
    manufacturer?: string;
    price?: number;
    price_buybox?: number;
    price_strikethrough?: number;
    price_upper?: number;
    currency?: string;
    discount_percentage?: number;
    rating?: number;
    reviews_count?: number;
    images?: string[];
    bullet_points?: string;
    stock?: string;
    is_prime_eligible?: boolean;
    amazon_choice?: boolean;
    delivery?: ProductDelivery[];
    buybox?: ProductBuybox[];
    reviews?: ProductReview[];
    variation?: ProductVariation[];
    category?: { ladder: { name: string; url: string }[] }[];
    technical_details?: { name: string; value: string }[];
    product_details?: Record<string, string>;
    dxb_price?: string;
    item_weight?: string;
    scraped_url?: string;
    url?: string;
    description?: string[];
    rating_stars_distribution?: { percentage: number; rating: number }[];
    featured_merchant?: {
        name: string;
        seller_id: string;
        is_amazon_fulfilled: boolean;
        shipped_from: string;
    };
    [key: string]: unknown;
}

/* ── Search Result (from /api/store/find) ── */

export interface SearchResultItem {
    asin: string;
    title: string;
    price?: number;
    price_upper?: number;
    price_strikethrough?: number;
    currency?: string;
    dxb_price?: string | number | null;
    rating?: number;
    reviews_count?: number;
    url?: string;
    url_image?: string;
    is_prime?: boolean;
    is_amazons_choice?: boolean;
    best_seller?: boolean;
    is_sponsored?: boolean;
    brand?: string;
    manufacturer?: string;
    shipping_information?: string;
    pos?: number;
    pricing_count?: number;
}

/* ── Bookmark ── */

export interface Bookmark {
    id: number;
    img_url: string;
    title: string;
    price: number;
    asin: string | null;
}
