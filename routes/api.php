<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Tafiya API v1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Authentication Flow
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/bookings/my-trips', [BookingController::class, 'myTrips']);
    });

    // Public Stays Search & Details
    Route::get('/properties/search', [PropertyController::class, 'search']);
    Route::get('/properties/{id}', [PropertyController::class, 'show']);

    // Booking Initiation, Tracking & Concurrency
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/bookings/track', [BookingController::class, 'track']);
    Route::get('/bookings/my-trips-public', [BookingController::class, 'myTrips']);

    // Webhook Ingestion Engine
    Route::post('/payments/webhooks/paystack', [WebhookController::class, 'handlePaystack']);
    Route::post('/payments/webhooks/monnify', [WebhookController::class, 'handleMonnify']);

});
