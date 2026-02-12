<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Storeflex') }} - Premium Dropshipping from Dubai to Zimbabwe</title>

        <!-- Primary SEO Meta Tags -->
        <meta name="title" content="Storeflex - Premium Dropshipping from Dubai to Zimbabwe">
        <meta name="description" content="Shop premium products from Dubai delivered to Zimbabwe. Storeflex offers fast, reliable dropshipping services with authentic products from Amazon UAE at competitive prices.">
        <meta name="keywords" content="dropshipping Zimbabwe, Dubai to Zimbabwe shipping, Amazon UAE products Zimbabwe, online shopping Zimbabwe, import from Dubai, Storeflex">
        <meta name="robots" content="index, follow">
        <meta name="author" content="Storeflex">
        <meta name="geo.region" content="ZW">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="Storeflex - Premium Dropshipping from Dubai to Zimbabwe">
        <meta property="og:description" content="Shop premium products from Dubai delivered to Zimbabwe. Fast, reliable dropshipping with authentic products.">
        <meta property="og:image" content="{{ asset('images/og-image.jpg') }}">
        <meta property="og:site_name" content="Storeflex">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="Storeflex - Premium Dropshipping from Dubai to Zimbabwe">
        <meta property="twitter:description" content="Shop premium products from Dubai delivered to Zimbabwe.">
        <meta property="twitter:image" content="{{ asset('images/og-image.jpg') }}">

        <!-- Canonical URL -->
        <link rel="canonical" href="{{ url()->current() }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Styles / Scripts -->
        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @endif

        <style>
            :root {
                --primary: #FF9900;
                --primary-hover: #E88B00;
                --bg-light: #FAFAFA;
                --bg-dark: #0D0D0D;
                --surface-light: #FFFFFF;
                --surface-dark: #1A1A1A;
                --border-light: #E5E5E5;
                --border-dark: #2D2D2D;
                --text-primary-light: #171717;
                --text-primary-dark: #FAFAFA;
                --text-secondary-light: #737373;
                --text-secondary-dark: #A3A3A3;
            }

            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background-color: var(--bg-light);
                color: var(--text-primary-light);
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }

            @media (prefers-color-scheme: dark) {
                body {
                    background-color: var(--bg-dark);
                    color: var(--text-primary-dark);
                }
            }

            /* Layout */
            .app-container {
                display: flex;
                min-height: 100vh;
                width: 100%;
            }

            /* Sidebar - For future chat history */
            .sidebar {
                width: 260px;
                background-color: var(--surface-light);
                border-right: 1px solid var(--border-light);
                display: none;
                flex-direction: column;
                padding: 16px;
            }

            @media (prefers-color-scheme: dark) {
                .sidebar {
                    background-color: var(--surface-dark);
                    border-right-color: var(--border-dark);
                }
            }

            @media (min-width: 1024px) {
                .sidebar {
                    display: flex;
                }
            }

            .sidebar-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 16px;
                border-bottom: 1px solid var(--border-light);
                margin-bottom: 16px;
            }

            @media (prefers-color-scheme: dark) {
                .sidebar-header {
                    border-bottom-color: var(--border-dark);
                }
            }

            .sidebar-title {
                font-weight: 600;
                font-size: 14px;
                color: var(--text-secondary-light);
            }

            @media (prefers-color-scheme: dark) {
                .sidebar-title {
                    color: var(--text-secondary-dark);
                }
            }

            .sidebar-placeholder {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 24px;
                color: var(--text-secondary-light);
            }

            @media (prefers-color-scheme: dark) {
                .sidebar-placeholder {
                    color: var(--text-secondary-dark);
                }
            }

            .sidebar-placeholder-icon {
                width: 48px;
                height: 48px;
                margin-bottom: 12px;
                opacity: 0.4;
            }

            .sidebar-placeholder-text {
                font-size: 13px;
                line-height: 1.5;
            }

            /* Main Content */
            .main-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 100vh;
            }

            /* Header */
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                border-bottom: 1px solid var(--border-light);
                background-color: var(--surface-light);
            }

            @media (prefers-color-scheme: dark) {
                .header {
                    background-color: var(--surface-dark);
                    border-bottom-color: var(--border-dark);
                }
            }

            .logo {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 700;
                font-size: 20px;
                text-decoration: none;
                color: inherit;
            }

            .logo-icon {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #FF9900, #FF6600);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .logo-icon svg {
                width: 20px;
                height: 20px;
                color: white;
            }

            .header-nav {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .nav-link {
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 500;
                color: var(--text-secondary-light);
                text-decoration: none;
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            @media (prefers-color-scheme: dark) {
                .nav-link {
                    color: var(--text-secondary-dark);
                }
            }

            .nav-link:hover {
                background-color: rgba(0, 0, 0, 0.05);
                color: var(--text-primary-light);
            }

            @media (prefers-color-scheme: dark) {
                .nav-link:hover {
                    background-color: rgba(255, 255, 255, 0.05);
                    color: var(--text-primary-dark);
                }
            }

            .nav-link-primary {
                background-color: var(--primary);
                color: white !important;
            }

            .nav-link-primary:hover {
                background-color: var(--primary-hover);
            }

            /* Hero Section */
            .hero {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 24px;
                text-align: center;
            }

            .hero-content {
                max-width: 720px;
                width: 100%;
            }

            .hero-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background-color: rgba(255, 153, 0, 0.1);
                color: var(--primary);
                font-size: 13px;
                font-weight: 500;
                border-radius: 20px;
                margin-bottom: 24px;
            }

            .hero-title {
                font-size: 40px;
                font-weight: 700;
                line-height: 1.2;
                margin-bottom: 16px;
                letter-spacing: -0.02em;
            }

            @media (min-width: 640px) {
                .hero-title {
                    font-size: 52px;
                }
            }

            .hero-title-gradient {
                background: linear-gradient(135deg, #FF9900, #FF6600);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .hero-subtitle {
                font-size: 17px;
                color: var(--text-secondary-light);
                margin-bottom: 40px;
                line-height: 1.6;
            }

            @media (prefers-color-scheme: dark) {
                .hero-subtitle {
                    color: var(--text-secondary-dark);
                }
            }

            /* Search Box */
            .search-container {
                width: 100%;
                max-width: 640px;
                margin: 0 auto;
            }

            .search-box {
                position: relative;
                background-color: var(--surface-light);
                border: 1px solid var(--border-light);
                border-radius: 16px;
                overflow: hidden;
                transition: all 0.2s ease;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            }

            @media (prefers-color-scheme: dark) {
                .search-box {
                    background-color: var(--surface-dark);
                    border-color: var(--border-dark);
                }
            }

            .search-box:focus-within {
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            }

            .search-textarea {
                width: 100%;
                min-height: 64px;
                max-height: 200px;
                padding: 20px;
                padding-right: 60px;
                font-size: 16px;
                line-height: 1.5;
                border: none;
                background: transparent;
                color: inherit;
                resize: none;
                outline: none;
            }

            .search-textarea::placeholder {
                color: var(--text-secondary-light);
            }

            @media (prefers-color-scheme: dark) {
                .search-textarea::placeholder {
                    color: var(--text-secondary-dark);
                }
            }

            .search-actions {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-top: 1px solid var(--border-light);
            }

            @media (prefers-color-scheme: dark) {
                .search-actions {
                    border-top-color: var(--border-dark);
                }
            }

            .search-hints {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .search-hint {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                font-size: 12px;
                color: var(--text-secondary-light);
                background-color: rgba(0, 0, 0, 0.03);
                border-radius: 6px;
            }

            @media (prefers-color-scheme: dark) {
                .search-hint {
                    color: var(--text-secondary-dark);
                    background-color: rgba(255, 255, 255, 0.05);
                }
            }

            .search-hint svg {
                width: 14px;
                height: 14px;
            }

            .search-submit {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background-color: var(--primary);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .search-submit:hover {
                background-color: var(--primary-hover);
                transform: scale(1.05);
            }

            .search-submit:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }

            .search-submit svg {
                width: 20px;
                height: 20px;
            }

            /* Quick Actions */
            .quick-actions {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
                margin-top: 32px;
            }

            .quick-action {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                font-size: 14px;
                color: var(--text-secondary-light);
                background-color: var(--surface-light);
                border: 1px solid var(--border-light);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            @media (prefers-color-scheme: dark) {
                .quick-action {
                    color: var(--text-secondary-dark);
                    background-color: var(--surface-dark);
                    border-color: var(--border-dark);
                }
            }

            .quick-action:hover {
                border-color: var(--primary);
                color: var(--primary);
            }

            .quick-action svg {
                width: 16px;
                height: 16px;
            }

            /* Footer */
            .footer {
                padding: 16px 24px;
                text-align: center;
                font-size: 13px;
                color: var(--text-secondary-light);
                border-top: 1px solid var(--border-light);
            }

            @media (prefers-color-scheme: dark) {
                .footer {
                    color: var(--text-secondary-dark);
                    border-top-color: var(--border-dark);
                }
            }

            .footer a {
                color: var(--primary);
                text-decoration: none;
            }

            .footer a:hover {
                text-decoration: underline;
            }

            /* Animations */
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .animate-fade-in {
                animation: fadeIn 0.5s ease-out forwards;
            }

            .animate-delay-1 {
                animation-delay: 0.1s;
                opacity: 0;
            }

            .animate-delay-2 {
                animation-delay: 0.2s;
                opacity: 0;
            }

            .animate-delay-3 {
                animation-delay: 0.3s;
                opacity: 0;
            }
        </style>
    </head>
    <body>
        <div class="app-container">
            <!-- Sidebar for future chat history -->
            <aside class="sidebar">
                <div class="sidebar-header">
                    <span class="sidebar-title">History</span>
                    <button style="background: none; border: none; cursor: pointer; opacity: 0.5;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
                <div class="sidebar-placeholder">
                    <svg class="sidebar-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p class="sidebar-placeholder-text">
                        Your search history will appear here after you log in.
                    </p>
                </div>
            </aside>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Header -->
                <header class="header">
                    <a href="/" class="logo">
                        <div class="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                        </div>
                    </a>

                    @if (Route::has('login'))
                        <nav class="header-nav">
                            @auth
                                <a href="{{ url('/dashboard') }}" class="nav-link nav-link-primary">
                                    Dashboard
                                </a>
                            @else
                                <a href="{{ route('login') }}" class="nav-link font-bold">
                                    Log in
                                </a>
                                @if (Route::has('register'))
                                    <a href="{{ route('register') }}" class="nav-link nav-link-primary">
                                        Get Started
                                    </a>
                                @endif
                            @endauth
                        </nav>
                    @endif
                </header>

                <!-- Hero Section -->
                <main class="hero">
                    <div class="hero-content animate-fade-in">
                        {{-- <span class="hero-badge animate-fade-in animate-delay-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                            Powered by DXB Runners
                        </span> --}}

                        <h1 class="hero-title animate-fade-in animate-delay-1">
                            Find products from<br>
                            <span class="hero-title-gradient">Amazon.ae</span> instantly
                        </h1>

                        <p class="hero-subtitle animate-fade-in animate-delay-2">
                            Paste an Amazon.ae link or search for any product. We'll help you source and supply it through our dropshipping network.
                        </p>

                        <form action="#" method="GET" class="search-container animate-fade-in animate-delay-2">
                            <div class="search-box">
                                <textarea 
                                    name="query"
                                    class="search-textarea" 
                                    placeholder="Paste an Amazon.ae link or search for a product..."
                                    rows="1"
                                    oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px';"
                                ></textarea>
                                <div class="search-actions">
                                    <div class="search-hints">
                                        <span class="search-hint">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                            </svg>
                                            Paste URL
                                        </span>
                                        <span class="search-hint">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                            </svg>
                                            Search product
                                        </span>
                                    </div>
                                    <button type="submit" class="search-submit">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div class="quick-actions animate-fade-in animate-delay-3">
                            <button class="quick-action" onclick="document.querySelector('.search-textarea').value='https://www.amazon.ae/dp/'; document.querySelector('.search-textarea').focus();">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                </svg>
                                Electronics
                            </button>
                            <button class="quick-action" onclick="document.querySelector('.search-textarea').value='Fashion accessories'; document.querySelector('.search-textarea').focus();">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46A2 2 0 0 0 2 5.38v13.24a2 2 0 0 0 1.62 1.96L8 22a4 4 0 0 0 8 0l4.38-1.42A2 2 0 0 0 22 18.62V5.38a2 2 0 0 0-1.62-1.92z"></path>
                                </svg>
                                Fashion
                            </button>
                            <button class="quick-action" onclick="document.querySelector('.search-textarea').value='Home kitchen items'; document.querySelector('.search-textarea').focus();">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                Home & Kitchen
                            </button>
                            <button class="quick-action" onclick="document.querySelector('.search-textarea').value='Sports outdoor gear'; document.querySelector('.search-textarea').focus();">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                                </svg>
                                Sports
                            </button>
                        </div>
                    </div>
                </main>

                <!-- Footer -->
                <footer class="footer">
                    <p>
                        Storeflex by <a href="#">DXB Runners</a> &middot; 
                        Your trusted dropshipping partner for Amazon.ae products
                    </p>
                </footer>
            </div>
        </div>
    </body>
</html>
