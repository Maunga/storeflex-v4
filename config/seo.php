<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Storeflex SEO Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains SEO-related configuration for the Storeflex
    | dropshipping application. Update these values to match your domain.
    |
    */

    // Site information
    'site_name' => env('APP_NAME', 'Storeflex'),
    'site_tagline' => 'Premium Dropshipping from Dubai to Zimbabwe',
    'site_description' => 'Shop premium products from Dubai delivered to Zimbabwe. Storeflex offers fast, reliable dropshipping services with authentic products from Amazon UAE at competitive prices.',
    
    // Geographic targeting
    'target_country' => 'Zimbabwe',
    'target_country_code' => 'ZW',
    'source_location' => 'Dubai, UAE',
    
    // Default meta tags
    'default_keywords' => [
        'dropshipping Zimbabwe',
        'Dubai to Zimbabwe shipping',
        'Amazon UAE products Zimbabwe',
        'online shopping Zimbabwe',
        'import from Dubai',
        'Storeflex',
        'Zimbabwe online store',
        'UAE products delivery',
        'buy from Dubai',
        'international shipping Zimbabwe',
    ],
    
    // Social media
    'og_image' => '/images/og-image.jpg',
    'twitter_handle' => '@storeflex',
    
    // Contact information for structured data
    'contact' => [
        'email' => env('CONTACT_EMAIL', 'support@storeflex.com'),
        'phone' => env('CONTACT_PHONE', ''),
    ],
    
    // Business hours (for LocalBusiness schema)
    'business_hours' => [
        'monday' => '09:00-18:00',
        'tuesday' => '09:00-18:00',
        'wednesday' => '09:00-18:00',
        'thursday' => '09:00-18:00',
        'friday' => '09:00-18:00',
        'saturday' => '09:00-14:00',
        'sunday' => 'closed',
    ],
    
    // Shipping information
    'shipping' => [
        'handling_days_min' => 1,
        'handling_days_max' => 3,
        'transit_days_min' => 7,
        'transit_days_max' => 14,
        'currency' => 'USD',
    ],
    
    // Product categories for sitemap and SEO
    'popular_categories' => [
        'Electronics & Gadgets',
        'Mobile Phones & Accessories',
        'Laptops & Computers',
        'Fashion & Clothing',
        'Beauty & Personal Care',
        'Home & Kitchen',
        'Sports & Outdoors',
        'Baby Products',
        'Toys & Games',
        'Jewelry & Watches',
        'Perfumes & Fragrances',
        'Health & Wellness',
    ],
    
    // FAQ for structured data (add your actual FAQs)
    'faqs' => [
        [
            'question' => 'How long does shipping from Dubai to Zimbabwe take?',
            'answer' => 'Shipping typically takes 7-14 business days depending on the product and your location in Zimbabwe.',
        ],
        [
            'question' => 'What payment methods do you accept?',
            'answer' => 'We accept various payment methods including mobile money, bank transfers, and major credit cards.',
        ],
        [
            'question' => 'Are the products authentic?',
            'answer' => 'Yes, all products are sourced directly from Amazon UAE and are 100% authentic with manufacturer warranty.',
        ],
        [
            'question' => 'Do you ship to all areas in Zimbabwe?',
            'answer' => 'Yes, we deliver to all major cities and towns across Zimbabwe including Harare, Bulawayo, Mutare, and more.',
        ],
        [
            'question' => 'What is your return policy?',
            'answer' => 'We offer a 14-day return policy for defective items. Please contact our support team for assistance.',
        ],
    ],
];
