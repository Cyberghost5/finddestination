<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * GET /api/v1/settings/payment-gateway
     */
    public function getPaymentGatewaySetting()
    {
        $activeGateway = Setting::getByKey('active_payment_gateway', env('ACTIVE_PAYMENT_GATEWAY', 'paystack'));
        $paystackPublicKey = Setting::getByKey('paystack_public_key', env('PAYSTACK_PUBLIC_KEY', 'pk_test_tafiya_paystack_public_key_2026'));
        $monnifyApiKey = Setting::getByKey('monnify_api_key', env('MONNIFY_API_KEY', 'MK_TEST_TAFIYA_MONNIFY_API_KEY'));
        $monnifyContractCode = Setting::getByKey('monnify_contract_code', env('MONNIFY_CONTRACT_CODE', '8920184920'));
        $googleClientId = Setting::getByKey('google_client_id', env('GOOGLE_CLIENT_ID', ''));

        return response()->json([
            'status' => 'success',
            'data' => [
                'active_gateway' => $activeGateway,
                'paystack_public_key' => $paystackPublicKey,
                'monnify_api_key' => $monnifyApiKey,
                'monnify_contract_code' => $monnifyContractCode,
                'google_client_id' => $googleClientId,
            ]
        ]);
    }

    /**
     * POST /api/v1/settings/payment-gateway
     */
    public function updatePaymentGatewaySetting(Request $request)
    {
        $validated = $request->validate([
            'active_gateway' => 'required|in:paystack,monnify',
            'paystack_public_key' => 'nullable|string',
            'monnify_api_key' => 'nullable|string',
            'monnify_contract_code' => 'nullable|string',
            'google_client_id' => 'nullable|string',
        ]);

        Setting::setByKey('active_payment_gateway', $validated['active_gateway']);

        if (array_key_exists('paystack_public_key', $validated) && $validated['paystack_public_key']) {
            Setting::setByKey('paystack_public_key', $validated['paystack_public_key']);
        }

        if (array_key_exists('monnify_api_key', $validated) && $validated['monnify_api_key']) {
            Setting::setByKey('monnify_api_key', $validated['monnify_api_key']);
        }

        if (array_key_exists('monnify_contract_code', $validated) && $validated['monnify_contract_code']) {
            Setting::setByKey('monnify_contract_code', $validated['monnify_contract_code']);
        }

        if (array_key_exists('google_client_id', $validated) && $validated['google_client_id']) {
            Setting::setByKey('google_client_id', $validated['google_client_id']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully',
            'data' => [
                'active_gateway' => $validated['active_gateway'],
                'paystack_public_key' => Setting::getByKey('paystack_public_key', env('PAYSTACK_PUBLIC_KEY', 'pk_test_tafiya_paystack_public_key_2026')),
                'monnify_api_key' => Setting::getByKey('monnify_api_key', env('MONNIFY_API_KEY', 'MK_TEST_TAFIYA_MONNIFY_API_KEY')),
                'monnify_contract_code' => Setting::getByKey('monnify_contract_code', env('MONNIFY_CONTRACT_CODE', '8920184920')),
                'google_client_id' => Setting::getByKey('google_client_id', env('GOOGLE_CLIENT_ID', '')),
            ]
        ]);
    }
}
