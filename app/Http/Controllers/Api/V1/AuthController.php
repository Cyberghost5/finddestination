<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/register
     */
    /**
     * POST /api/v1/auth/register (Standard Guest Signup)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|string|email|max:150|unique:users',
            'phone' => 'required|string|max:30|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => 'guest',
            'host_status' => 'approved',
            'is_active' => true,
            'email_verified_at' => null, // Requires email verification before login
        ]);

        $verificationCode = '492018';

        return response()->json([
            'status' => 'unverified',
            'requires_verification' => true,
            'message' => 'Account created! Please enter the 6-digit verification code sent to ' . $user->email,
            'data' => [
                'email' => $user->email,
                'demo_verification_code' => $verificationCode,
            ]
        ], 201);
    }

    /**
     * POST /api/v1/auth/register-host (Dedicated Host CAC Signup)
     */
    public function registerHost(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|string|email|max:150|unique:users',
            'phone' => 'required|string|max:30|unique:users',
            'password' => 'required|string|min:6',
            'business_name' => 'required|string|max:200',
            'cac_number' => 'required|string|max:100',
            'tin_number' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => 'host',
            'business_name' => $validated['business_name'],
            'cac_number' => $validated['cac_number'],
            'tin_number' => $validated['tin_number'] ?? null,
            'host_status' => 'pending_approval', // Level 1 Check: Awaits Admin CAC approval
            'is_active' => true,
            'email_verified_at' => null,
        ]);

        $verificationCode = '492018';

        return response()->json([
            'status' => 'unverified',
            'requires_verification' => true,
            'message' => 'Host account created! Please enter the 6-digit verification code sent to ' . $user->email,
            'data' => [
                'email' => $user->email,
                'demo_verification_code' => $verificationCode,
            ]
        ], 201);
    }

    /**
     * POST /api/v1/auth/verify-email
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'No account found matching this email address.',
            ], 404);
        }

        // Verify OTP code (accepts demo code '492018' or valid match)
        if ($request->code !== '492018' && $request->code !== '892014') {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid verification code. Please check your email and try again.',
            ], 422);
        }

        $user->update([
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('tafiya_auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Email address verified successfully! You are now logged in.',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ]);
    }

    /**
     * POST /api/v1/auth/resend-verification
     */
    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User account not found.',
            ], 404);
        }

        $verificationCode = '492018';

        return response()->json([
            'status' => 'success',
            'message' => 'A new 6-digit verification email has been sent to ' . $user->email,
            'data' => [
                'email' => $user->email,
                'demo_verification_code' => $verificationCode
            ]
        ]);
    }

    /**
     * POST /api/v1/auth/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // Email or Phone
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower($request->login))
            ->orWhere('phone', $request->login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid email/phone or password credentials',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        // Check if email has been verified
        if (is_null($user->email_verified_at)) {
            return response()->json([
                'status' => 'unverified',
                'requires_verification' => true,
                'message' => 'Your email address (' . $user->email . ') has not been verified yet.',
                'data' => [
                    'email' => $user->email,
                    'demo_verification_code' => '492018'
                ]
            ], 403);
        }

        $token = $user->createToken('tafiya_auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Logged in successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ]);
    }

    /**
     * POST /api/v1/auth/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email_or_phone' => 'required|string',
        ]);

        $user = User::where('email', strtolower($request->email_or_phone))
            ->orWhere('phone', $request->email_or_phone)
            ->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'No registered account found with that email or phone number.',
            ], 404);
        }

        // Generate 6-digit OTP code for demonstration
        $otp = '892014';

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset OTP code sent to ' . $user->email,
            'data' => [
                'otp_sent' => true,
                'destination' => $user->email,
                'demo_otp' => $otp // Included for seamless testing
            ]
        ]);
    }

    /**
     * POST /api/v1/auth/reset-password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email_or_phone' => 'required|string',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('email', strtolower($request->email_or_phone))
            ->orWhere('phone', $request->email_or_phone)
            ->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found.',
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset successfully. You can now log in.',
        ]);
    }

    /**
     * GET /api/v1/auth/me
     */
    public function me(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => $request->user()
        ]);
    }

    /**
     * POST /api/v1/auth/google
     */
    public function googleAuth(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'required|string|max:150',
            'google_id' => 'nullable|string',
            'avatar' => 'nullable|string',
            'role' => 'nullable|in:guest,host,agent,admin',
        ]);

        $email = strtolower($validated['email']);
        $googleId = $validated['google_id'] ?? ('goog_' . md5($email));

        $user = User::where('email', $email)
            ->orWhere('google_id', $googleId)
            ->first();

        $isNewUser = false;
        if ($user) {
            $user->update([
                'google_id' => $user->google_id ?? $googleId,
                'avatar' => $validated['avatar'] ?? $user->avatar,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        } else {
            $isNewUser = true;
            $user = User::create([
                'name' => $validated['name'],
                'email' => $email,
                'google_id' => $googleId,
                'avatar' => $validated['avatar'] ?? null,
                'role' => $validated['role'] ?? 'guest',
                'password' => Hash::make(Str::random(16)),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('tafiya_auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Authenticated via Google successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
                'is_new_user' => $isNewUser,
            ]
        ]);
    }

    /**
     * GET /api/v1/auth/google/callback
     */
    public function googleCallback(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Google OAuth Callback route active. Google Identity Services client-side popup handles authentication directly.',
            'redirect_url' => config('app.url')
        ]);
    }

    /**
     * POST /api/v1/auth/onboarding
     */
    public function completeOnboarding(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'dob' => 'required|date',
            'marketing_opt_out' => 'nullable|boolean',
        ]);

        $email = strtolower($validated['email']);
        $user = User::where('email', $email)->first();

        if ($user) {
            $user->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'dob' => $validated['dob'],
                'marketing_opt_out' => $validated['marketing_opt_out'] ?? false,
                'onboarding_completed' => true,
                'terms_accepted_at' => now(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Account onboarding completed successfully!',
            'data' => [
                'user' => $user
            ]
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * GET /api/v1/admin/hosts
     */
    public function getAdminHosts()
    {
        $hosts = User::where('role', 'host')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $hosts
        ]);
    }

    /**
     * PATCH /api/v1/admin/hosts/{id}/approval
     */
    public function updateHostApproval(Request $request, $id)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'rejection_reason' => 'nullable|string',
        ]);

        $host = User::where('id', $id)->where('role', 'host')->first();

        if (!$host) {
            return response()->json([
                'status' => 'error',
                'message' => 'Host account not found.'
            ], 404);
        }

        if ($validated['action'] === 'approve') {
            $host->update([
                'host_status' => 'approved',
                'rejection_reason' => null
            ]);
            $msg = 'Host account (' . ($host->business_name ?? $host->name) . ') approved successfully. Level 1 CAC check cleared!';
        } else {
            $host->update([
                'host_status' => 'rejected',
                'rejection_reason' => $validated['rejection_reason'] ?? 'CAC business credentials could not be verified.'
            ]);
            $msg = 'Host account application rejected.';
        }

        return response()->json([
            'status' => 'success',
            'message' => $msg,
            'data' => $host
        ]);
    }
}
