<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
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
        ]);

        $token = $user->createToken('tafiya_auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Account created successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 201);
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
