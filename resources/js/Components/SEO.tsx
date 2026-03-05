import { Head } from '@inertiajs/react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: 'website' | 'product' | 'article';
}

const defaultMeta = {
    title: 'Storeflex - Premium Dropshipping from Dubai to Zimbabwe',
    description: 'Shop premium products from Dubai delivered to Zimbabwe. Storeflex offers fast, reliable dropshipping services with authentic products from Amazon UAE at competitive prices.',
    keywords: 'dropshipping Zimbabwe, Dubai to Zimbabwe shipping, Amazon UAE products Zimbabwe, online shopping Zimbabwe, import from Dubai, Storeflex, Zimbabwe online store',
    image: '/images/og-image.jpg',
};

export default function SEO({
    title,
    description,
    keywords,
    image,
    type = 'website',
}: SEOProps) {
    const pageTitle = title 
        ? `${title} | Storeflex - Dubai to Zimbabwe Dropshipping`
        : defaultMeta.title;
    const pageDescription = description || defaultMeta.description;
    const pageKeywords = keywords || defaultMeta.keywords;
    const pageImage = image || defaultMeta.image;

    return (
        <Head title={pageTitle}>
            <meta name="description" content={pageDescription} />
            <meta name="keywords" content={pageKeywords} />
            
            {/* Open Graph */}
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:type" content={type} />
            <meta property="og:image" content={pageImage} />
            
            {/* Twitter */}
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={pageImage} />
        </Head>
    );
}
