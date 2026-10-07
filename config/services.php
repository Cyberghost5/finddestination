<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services & API Keys
    |--------------------------------------------------------------------------
    */

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', 'https://finddestination.com.ng/api/v1/auth/google/callback'),
    ],

    'paystack' => [
        'secret_key' => env('PAYSTACK_SECRET_KEY'),
        'public_key' => env('PAYSTACK_PUBLIC_KEY'),
        'merchant_email' => env('PAYSTACK_MERCHANT_EMAIL'),
    ],

    'monnify' => [
        'api_key' => env('MONNIFY_API_KEY'),
        'secret_key' => env('MONNIFY_SECRET_KEY'),
        'contract_code' => env('MONNIFY_CONTRACT_CODE'),
        'base_url' => env('MONNIFY_BASE_URL', 'https://sandbox.monnify.com'),
    ],

];
