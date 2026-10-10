<?php

use App\Http\Controllers\Api\V1\AdminInspectionController;
use App\Http\Controllers\Api\V1\AgentInspectionController;
use App\Http\Controllers\Api\V1\AgentWalletController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FindDestination API v1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    Route::get('/setup-db', function() {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
        return response()->json([
            'status' => 'success',
            'message' => 'Database migrated and seeded with real property products successfully!'
        ]);
    });

    Route::get('/migrate', function() {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        return response()->json([
            'status' => 'success',
            'message' => 'Database migrations executed successfully!',
            'output' => trim(\Illuminate\Support\Facades\Artisan::output())
        ]);
    });

    // Active Payment Gateway & System Settings
    Route::get('/settings/payment-gateway', [SettingController::class, 'getPaymentGatewaySetting']);
    Route::post('/settings/payment-gateway', [SettingController::class, 'updatePaymentGatewaySetting']);

    // Authentication Flow
    Route::get('/auth/test-email', [AuthController::class, 'testEmail']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/register-host', [AuthController::class, 'registerHost']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/google', [AuthController::class, 'googleAuth']);
    Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);
    Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/auth/onboarding', [AuthController::class, 'completeOnboarding']);

    // Admin Level 1 Host Approval Queue & QoreID CAC Verification
    Route::get('/admin/hosts', [AuthController::class, 'getAdminHosts']);
    Route::patch('/admin/hosts/{id}/approval', [AuthController::class, 'updateHostApproval']);
    Route::post('/admin/hosts/{id}/verify-cac', [AuthController::class, 'verifyHostCac']);
    Route::post('/admin/verify-cac', [AuthController::class, 'verifyCacDirect']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/bookings/my-trips', [BookingController::class, 'myTrips']);
    });

    // Public Stays Search & Details
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::get('/properties/search', [PropertyController::class, 'search']);
    Route::get('/properties/{id}', [PropertyController::class, 'show']);
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::patch('/properties/{id}/publish', [PropertyController::class, 'togglePublish']);
    Route::patch('/properties/{id}/verification', [PropertyController::class, 'updateVerification']);

    // Booking Initiation, Retrieval & Tracking
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/host/bookings', [BookingController::class, 'hostBookings']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/bookings/track', [BookingController::class, 'track']);
    Route::post('/bookings/send-voucher-email', [BookingController::class, 'sendVoucherEmail']);
    Route::get('/bookings/my-trips-public', [BookingController::class, 'myTrips']);

    // Webhook Ingestion Engine
    Route::post('/payments/webhooks/paystack', [WebhookController::class, 'handlePaystack']);
    Route::post('/payments/webhooks/monnify', [WebhookController::class, 'handleMonnify']);

    // Messaging & Real-Time Chat Engine
    Route::get('/chats', [ChatController::class, 'index']);
    Route::get('/chats/{threadId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/chats/{threadId}/messages', [ChatController::class, 'sendMessage']);
    Route::post('/chats/start-booking-chat', [ChatController::class, 'startBookingChat']);
    Route::post('/chats/support', [ChatController::class, 'supportChat']);

    // Field Agent Inspection Workflow & Bounties
    Route::get('/agent/explore-properties', [AgentInspectionController::class, 'exploreProperties']);
    Route::post('/agent/inspections/apply', [AgentInspectionController::class, 'apply']);
    Route::get('/agent/inspections/my-assignments', [AgentInspectionController::class, 'myAssignments']);
    Route::post('/agent/inspections/{id}/submit-report', [AgentInspectionController::class, 'submitReport']);

    // Field Agent Wallet & Payout System
    Route::get('/agent/wallet', [AgentWalletController::class, 'getWallet']);
    Route::post('/agent/wallet/bank-details', [AgentWalletController::class, 'updateBankDetails']);
    Route::post('/agent/wallet/withdraw', [AgentWalletController::class, 'withdraw']);

    // Super Admin Field Inspection Control & Audit Review
    Route::get('/admin/inspections/properties', [AdminInspectionController::class, 'getInspectionProperties']);
    Route::post('/admin/inspections/properties/{id}/open', [AdminInspectionController::class, 'openInspection']);
    Route::get('/admin/inspections/applications', [AdminInspectionController::class, 'getApplications']);
    Route::post('/admin/inspections/applications/{id}/respond', [AdminInspectionController::class, 'respondToApplication']);
    Route::get('/admin/inspections/reports', [AdminInspectionController::class, 'getReports']);
    Route::post('/admin/inspections/{id}/verify', [AdminInspectionController::class, 'verifyReport']);

    // Super Admin Agent Withdrawal Processing
    Route::get('/admin/withdrawals', [AdminInspectionController::class, 'getWithdrawals']);
    Route::post('/admin/withdrawals/{id}/process', [AdminInspectionController::class, 'processWithdrawal']);

});


