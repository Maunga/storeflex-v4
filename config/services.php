<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Providers
    |--------------------------------------------------------------------------
    */

    'paynow' => [
        'integration_id' => env('PAYNOW_INTEGRATION_ID'),
        'integration_key' => env('PAYNOW_INTEGRATION_KEY'),
        'return_url' => env('PAYNOW_RETURN_URL'),
        'result_url' => env('PAYNOW_RESULT_URL'),
    ],

    'paypal' => [
        'client_id' => env('PAYPAL_CLIENT_ID'),
        'client_secret' => env('PAYPAL_CLIENT_SECRET'),
        'sandbox' => env('PAYPAL_MODE', 'sandbox') === 'sandbox',
        'return_url' => env('PAYPAL_RETURN_URL'),
        'cancel_url' => env('PAYPAL_CANCEL_URL'),
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'return_url' => env('STRIPE_RETURN_URL'),
        'cancel_url' => env('STRIPE_CANCEL_URL'),
    ],

    'agentx' => [
        'domain' => env('AGENTX_DOMAIN'),
        'master_key' => env('MASTER_KEY'),
    ],

];
