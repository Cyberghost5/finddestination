<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentWallet;
use App\Models\User;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AgentWalletController extends Controller
{
    /**
     * Resolve authenticated agent from Sanctum token or headers
     */
    private function resolveAgent(Request $request): ?User
    {
        $user = $request->user('sanctum');

        if (!$user && $request->header('X-User-Id')) {
            $user = User::find($request->header('X-User-Id'));
        }

        if (!$user && app()->environment('local')) {
            $user = User::where('role', 'agent')->first() ?: User::first();
        }

        return $user;
    }

    /**
     * Get or initialize agent wallet
     */
    private function getOrCreateWallet(User $agent): AgentWallet
    {
        return AgentWallet::firstOrCreate(
            ['agent_id' => $agent->id],
            [
                'balance' => 0.00,
                'total_earned' => 0.00,
                'account_name' => $agent->name,
            ]
        );
    }

    /**
     * GET /api/v1/agent/wallet
     * Retrieve wallet balance, bank details, transaction ledger, and payout history
     */
    public function getWallet(Request $request)
    {
        $agent = $this->resolveAgent($request);

        if (!$agent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated. Please log in as an agent.'
            ], 401);
        }

        $wallet = $this->getOrCreateWallet($agent);

        $transactions = $wallet->transactions()
            ->latest()
            ->take(30)
            ->get()
            ->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'type' => $tx->type,
                    'category' => $tx->category,
                    'amount' => (float)$tx->amount,
                    'amount_formatted' => ($tx->type === 'credit' ? '+' : '-') . '₦' . number_format((float)$tx->amount, 2),
                    'balance_after' => (float)$tx->balance_after,
                    'balance_after_formatted' => '₦' . number_format((float)$tx->balance_after, 2),
                    'reference' => $tx->reference,
                    'description' => $tx->description,
                    'status' => $tx->status,
                    'date' => $tx->created_at->format('M d, Y g:i A'),
                    'created_at' => $tx->created_at->toIso8601String(),
                ];
            });

        $withdrawals = $wallet->withdrawals()
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($w) {
                return [
                    'id' => $w->id,
                    'amount' => (float)$w->amount,
                    'amount_formatted' => '₦' . number_format((float)$w->amount, 2),
                    'bank_name' => $w->bank_name,
                    'account_number' => $w->account_number,
                    'account_name' => $w->account_name,
                    'status' => $w->status,
                    'admin_note' => $w->admin_note,
                    'transaction_reference' => $w->transaction_reference,
                    'requested_at' => $w->created_at->format('M d, Y g:i A'),
                    'processed_at' => $w->processed_at ? $w->processed_at->format('M d, Y g:i A') : null,
                ];
            });

        $pendingWithdrawalAmount = (float)$wallet->withdrawals()->where('status', 'pending')->sum('amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'wallet_id' => $wallet->id,
                'balance' => (float)$wallet->balance,
                'balance_formatted' => '₦' . number_format((float)$wallet->balance, 2),
                'total_earned' => (float)$wallet->total_earned,
                'total_earned_formatted' => '₦' . number_format((float)$wallet->total_earned, 2),
                'pending_withdrawal_amount' => $pendingWithdrawalAmount,
                'pending_withdrawal_formatted' => '₦' . number_format($pendingWithdrawalAmount, 2),
                'bank_details' => [
                    'bank_name' => $wallet->bank_name,
                    'account_number' => $wallet->account_number,
                    'account_name' => $wallet->account_name,
                    'bank_code' => $wallet->bank_code,
                    'is_configured' => !empty($wallet->bank_name) && !empty($wallet->account_number),
                ],
                'transactions' => $transactions,
                'withdrawals' => $withdrawals,
            ],
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'email' => $agent->email,
                'phone' => $agent->phone,
            ]
        ]);
    }

    /**
     * POST /api/v1/agent/wallet/bank-details
     * Configure or update bank payout details
     */
    public function updateBankDetails(Request $request)
    {
        $agent = $this->resolveAgent($request);

        if (!$agent) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'bank_name' => 'required|string|max:150',
            'account_number' => 'required|string|min:10|max:20',
            'account_name' => 'required|string|max:150',
            'bank_code' => 'nullable|string|max:50',
        ]);

        $wallet = $this->getOrCreateWallet($agent);

        $wallet->update([
            'bank_name' => trim($validated['bank_name']),
            'account_number' => trim($validated['account_number']),
            'account_name' => trim($validated['account_name']),
            'bank_code' => isset($validated['bank_code']) ? trim($validated['bank_code']) : null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Payout bank account details updated successfully!',
            'data' => [
                'bank_name' => $wallet->bank_name,
                'account_number' => $wallet->account_number,
                'account_name' => $wallet->account_name,
                'bank_code' => $wallet->bank_code,
                'is_configured' => true,
            ]
        ]);
    }

    /**
     * POST /api/v1/agent/wallet/withdraw
     * Request withdrawal from available wallet balance
     */
    public function withdraw(Request $request)
    {
        $agent = $this->resolveAgent($request);

        if (!$agent) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }

        $wallet = $this->getOrCreateWallet($agent);

        if (empty($wallet->bank_name) || empty($wallet->account_number) || empty($wallet->account_name)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please configure your bank payout account details before requesting a withdrawal.'
            ], 422);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
        ], [
            'amount.min' => 'Minimum withdrawal amount is ₦1,000.',
        ]);

        $amount = (float)$validated['amount'];

        if ((float)$wallet->balance < $amount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient wallet balance. You have ₦' . number_format((float)$wallet->balance, 2) . ' available for payout.'
            ], 422);
        }

        $ref = 'WTH-' . strtoupper(Str::random(10));

        try {
            $wallet->debitForWithdrawal(
                $amount,
                $ref,
                "Withdrawal payout request to {$wallet->bank_name} ({$wallet->account_number})"
            );

            $withdrawal = WithdrawalRequest::create([
                'agent_id' => $agent->id,
                'agent_wallet_id' => $wallet->id,
                'amount' => $amount,
                'bank_name' => $wallet->bank_name,
                'account_number' => $wallet->account_number,
                'account_name' => $wallet->account_name,
                'status' => 'pending',
                'transaction_reference' => $ref,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Withdrawal request of ₦' . number_format($amount, 2) . ' submitted successfully. Super Admin will disburse to your bank account.',
                'data' => [
                    'withdrawal_id' => $withdrawal->id,
                    'amount' => $amount,
                    'amount_formatted' => '₦' . number_format($amount, 2),
                    'reference' => $ref,
                    'remaining_balance' => (float)$wallet->fresh()->balance,
                    'remaining_balance_formatted' => '₦' . number_format((float)$wallet->fresh()->balance, 2),
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Could not process withdrawal: ' . $e->getMessage()
            ], 422);
        }
    }
}
