<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application, which will be used when the
    | framework needs to place the application's name in a notification or
    | other UI elements where an application name needs to be displayed.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services the application utilizes. Set this in your ".env" file.
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | When your application is in debug mode, detailed error messages with
    | stack traces will be shown on every error that occurs within your
    | application. If disabled, a simple generic error page is shown.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | This URL is used by the console to properly generate URLs when using
    | the Artisan command line tool. You should set this to the root of
    | the application so that it's available within Artisan commands.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default timezone for your application, which
    | will be used by the PHP date and date-time functions. The timezone
    | is set to "UTC" by default as it is suitable for most use cases.
    |
    */

    'timezone' => 'UTC',

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by Laravel's translation / localization methods. This option can be
    | set to any locale for which you plan to have translation strings.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This key is utilized by Laravel's encryption services and should be set
    | to a random, 32 character string to ensure that all encrypted values
    | are secure. You should do this prior to deploying the application.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | These configuration options determine the driver used to determine and
    | manage Laravel's "maintenance mode" status. The "cache" driver will
    | allow maintenance mode to be controlled across multiple machines.
    |
    | Supported drivers: "file", "cache"
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Oxylabs Web Scraping
    |--------------------------------------------------------------------------
    */

    'oxylabs_endpoint' => env('OXYLABS_ENDPOINT', 'https://realtime.oxylabs.io/v1/queries'),
    'oxylabs_token' => env('OXYLABS_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | Amazon AE Configuration
    |--------------------------------------------------------------------------
    */

    'amazon_ae_url' => env('AMAZON_AE_URL', 'https://www.amazon.ae/'),
    'amazon_ae_prefix' => env('AMAZON_AE_PREFIX', 'https://www.amazon.ae/dp/'),
    'amazon_ae_cache_prefix' => env('AMAZON_AE_CACHE_PREFIX', 'amazon_ae_'),

    /*
    |--------------------------------------------------------------------------
    | WooCommerce Integration
    |--------------------------------------------------------------------------
    */

    'woocommerce_url' => env('WOOCOMMERCE_URL'),
    'woocommerce_api_token' => env('WOOCOMMERCE_API_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | Pricing & Commissions
    |--------------------------------------------------------------------------
    */

    'cache_time' => (int) env('CACHE_TIME', 10080),
    'shipping_price_aed_per_kg' => (float) env('SHIPPING_PRICE_AED_PER_KG', 40),
    'aed_rate_to_usd' => (float) env('AED_RATE_TO_USD', 3.67),
    'fixed_commission_per_item_aed' => (float) env('FIXED_COMMISSION_PER_ITEM_AED', 15),
    'overall_commission_percentage' => (float) env('OVERALL_COMMISSION_PERCENTAGE', 27.5),

];
