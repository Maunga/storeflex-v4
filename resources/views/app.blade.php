<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Storeflex') }}</title>

        <!-- Primary SEO Meta Tags -->
        <meta name="title" content="Storeflex - Premium Dropshipping from Dubai to Zimbabwe">
        <meta name="description" content="Shop premium products from Dubai delivered to Zimbabwe. Storeflex offers fast, reliable dropshipping services with authentic products from Amazon UAE at competitive prices.">
        <meta name="keywords" content="dropshipping Zimbabwe, Dubai to Zimbabwe shipping, Amazon UAE products Zimbabwe, online shopping Zimbabwe, import from Dubai, Storeflex, Zimbabwe online store, UAE products delivery">
        <meta name="robots" content="index, follow">
        <meta name="author" content="Storeflex">
        <meta name="geo.region" content="ZW">
        <meta name="geo.placename" content="Zimbabwe">
        <meta http-equiv="content-language" content="en">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="Storeflex - Premium Dropshipping from Dubai to Zimbabwe">
        <meta property="og:description" content="Shop premium products from Dubai delivered to Zimbabwe. Fast, reliable dropshipping with authentic products from Amazon UAE.">
        <meta property="og:image" content="{{ asset('images/og-image.jpg') }}">
        <meta property="og:site_name" content="Storeflex">
        <meta property="og:locale" content="en_ZW">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="Storeflex - Premium Dropshipping from Dubai to Zimbabwe">
        <meta property="twitter:description" content="Shop premium products from Dubai delivered to Zimbabwe. Fast, reliable dropshipping services.">
        <meta property="twitter:image" content="{{ asset('images/og-image.jpg') }}">

        <!-- Canonical URL -->
        <link rel="canonical" href="{{ url()->current() }}">

        <!-- Favicon & Icons -->
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/apple-touch-icon.png') }}">

        <!-- Structured Data - Organization -->
        <script type="application/ld+json">
        {
            "@@context": "https://schema.org",
            "@@type": "Organization",
            "name": "Storeflex",
            "description": "Premium dropshipping service from Dubai to Zimbabwe",
            "url": "{{ config('app.url') }}",
            "logo": "{{ asset('images/logo.png') }}",
            "contactPoint": {
                "@@type": "ContactPoint",
                "contactType": "customer service",
                "areaServed": "ZW"
            },
            "sameAs": []
        }
        </script>

        <!-- Structured Data - WebSite with SearchAction -->
        <script type="application/ld+json">
        {
            "@@context": "https://schema.org",
            "@@type": "WebSite",
            "name": "Storeflex",
            "url": "{{ config('app.url') }}",
            "description": "Shop premium products from Dubai delivered to Zimbabwe",
            "potentialAction": {
                "@@type": "SearchAction",
                "target": {
                    "@@type": "EntryPoint",
                    "urlTemplate": "{{ config('app.url') }}/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        }
        </script>

        <!-- Structured Data - E-commerce Store -->
        <script type="application/ld+json">
        {
            "@@context": "https://schema.org",
            "@@type": "Store",
            "name": "Storeflex",
            "description": "Premium dropshipping from Dubai to Zimbabwe - Shop authentic products from Amazon UAE",
            "url": "{{ config('app.url') }}",
            "priceRange": "$$",
            "currencyAccepted": "USD",
            "areaServed": {
                "@@type": "Country",
                "name": "Zimbabwe"
            },
            "hasOfferCatalog": {
                "@@type": "OfferCatalog",
                "name": "Products from Dubai",
                "itemListElement": [
                    {
                        "@@type": "Offer",
                        "itemOffered": {
                            "@@type": "Product",
                            "name": "Electronics & Gadgets"
                        }
                    },
                    {
                        "@@type": "Offer",
                        "itemOffered": {
                            "@@type": "Product",
                            "name": "Fashion & Accessories"
                        }
                    },
                    {
                        "@@type": "Offer",
                        "itemOffered": {
                            "@@type": "Product",
                            "name": "Home & Living"
                        }
                    }
                ]
            }
        }
        </script>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
