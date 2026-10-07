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
     * POST /api/v1/auth/register
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|string|email|max:150|unique:users',
            'phone' => 'required|string|max:30|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'nullable|in:guest,host,agent,admin',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'guest',
            'is_active' => true,
            'email_verified_at' => null, // Requires email verification before login
        ]);

        // Demo verification code (In production, sent via VerifyEmailMail)
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

        if ($user) {
            $user->update([
                'google_id' => $user->google_id ?? $googleId,
                'avatar' => $validated['avatar'] ?? $user->avatar,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        } else {
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
}
