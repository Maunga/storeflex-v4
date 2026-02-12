import { Head } from '@inertiajs/react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: 'website' | 'product' | 'article';
    price?: string;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    productData?: {
        name: string;
        description: string;
        image: string;
        price: string;
        currency: string;
        sku?: string;
        brand?: string;
        availability?: string;
    };
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
    productData,
}: SEOProps) {
    const pageTitle = title 
        ? `${title} | Storeflex - Dubai to Zimbabwe Dropshipping`
        : defaultMeta.title;
    const pageDescription = description || defaultMeta.description;
    const pageKeywords = keywords || defaultMeta.keywords;
    const pageImage = image || defaultMeta.image;

    return (
        <Head>
            <title>{pageTitle}</title>
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
            
            {/* Product-specific structured data */}
            {productData && (
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: productData.name,
                        description: productData.description,
                        image: productData.image,
                        sku: productData.sku,
                        brand: {
                            '@type': 'Brand',
                            name: productData.brand || 'Various',
                        },
                        offers: {
                            '@type': 'Offer',
                            price: productData.price,
                            priceCurrency: productData.currency || 'USD',
                            availability: `https://schema.org/${productData.availability || 'InStock'}`,
                            seller: {
                                '@type': 'Organization',
                                name: 'Storeflex',
                            },
                            shippingDetails: {
                                '@type': 'OfferShippingDetails',
                                shippingDestination: {
                                    '@type': 'DefinedRegion',
                                    addressCountry: 'ZW',
                                },
                                deliveryTime: {
                                    '@type': 'ShippingDeliveryTime',
                                    handlingTime: {
                                        '@type': 'QuantitativeValue',
                                        minValue: 1,
                                        maxValue: 3,
                                        unitCode: 'DAY',
                                    },
                                    transitTime: {
                                        '@type': 'QuantitativeValue',
                                        minValue: 7,
                                        maxValue: 14,
                                        unitCode: 'DAY',
                                    },
                                },
                            },
                        },
                    })}
                </script>
            )}
        </Head>
    );
}

// Breadcrumb component for SEO
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
    const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <Head>
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbData)}
            </script>
        </Head>
    );
}

// FAQ Schema for help pages
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
    const faqData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <Head>
            <script type="application/ld+json">
                {JSON.stringify(faqData)}
            </script>
        </Head>
    );
}
