<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentInspection;
use App\Models\AgentWallet;
use App\Models\Property;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminInspectionController extends Controller
{
    /**
     * Resolve admin user from token, header, or local fallback
     */
    private function resolveAdmin(Request $request): ?User
    {
        $user = $request->user('sanctum');

        if (!$user && $request->header('X-User-Id')) {
            $user = User::find($request->header('X-User-Id'));
        }

        if (!$user && app()->environment('local')) {
            $user = User::where('role', 'admin')->first() ?: User::first();
        }

        return $user;
    }

    /**
     * GET /api/v1/admin/inspections/properties
     * List all properties with inspection metadata and active agent status
     */
    public function getInspectionProperties(Request $request)
    {
        $query = Property::with(['host', 'inspections.agent'])
            ->orderBy('created_at', 'desc');

        if ($request->has('is_open') && $request->is_open !== '') {
            $query->where('is_open_for_inspection', filter_var($request->is_open, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('inspection_status') && $request->inspection_status !== 'all') {
            $query->where('inspection_status', $request->inspection_status);
        }

        $properties = $query->get()->map(function ($prop) {
            $activeAssignment = $prop->inspections
                ->whereIn('status', ['approved', 'submitted', 'verified'])
                ->first();

            $pendingApplicationsCount = $prop->inspections
                ->where('status', 'pending')
                ->count();

            return [
                'id' => $prop->id,
                'name' => $prop->name,
                'slug' => $prop->slug,
                'property_type' => $prop->property_type,
                'city' => $prop->city,
                'state' => $prop->state,
                'address' => $prop->address,
                'is_open_for_inspection' => (bool)$prop->is_open_for_inspection,
                'inspection_fee' => (float)$prop->inspection_fee,
                'inspection_fee_formatted' => '₦' . number_format((float)$prop->inspection_fee),
                'inspection_status' => $prop->inspection_status,
                'verification_tier' => $prop->verification_tier,
                'is_verified' => (bool)$prop->is_verified,
                'cover_image' => is_array($prop->images) && count($prop->images) > 0 ? $prop->images[0] : '/logo.jpeg',
                'host' => $prop->host ? [
                    'id' => $prop->host->id,
                    'name' => $prop->host->name,
                    'business_name' => $prop->host->business_name,
                    'phone' => $prop->contact_phone ?: $prop->host->phone,
                    'email' => $prop->host->email,
                ] : null,
                'pending_applications_count' => $pendingApplicationsCount,
                'assigned_agent' => $activeAssignment && $activeAssignment->agent ? [
                    'id' => $activeAssignment->agent->id,
                    'name' => $activeAssignment->agent->name,
                    'phone' => $activeAssignment->agent->phone,
                    'email' => $activeAssignment->agent->email,
                    'assignment_status' => $activeAssignment->status,
                ] : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $properties,
        ]);
    }

    /**
     * POST /api/v1/admin/inspections/properties/{id}/open
     * Open or close a property for field inspection bounty and set fee
     */
    public function openInspection(Request $request, $id)
    {
        $property = Property::findOrFail($id);

        $validated = $request->validate([
            'is_open_for_inspection' => 'required|boolean',
            'inspection_fee' => 'nullable|numeric|min:0',
        ]);

        $isOpen = (bool)$validated['is_open_for_inspection'];
        $fee = isset($validated['inspection_fee']) ? (float)$validated['inspection_fee'] : (float)$property->inspection_fee;

        $updateData = [
            'is_open_for_inspection' => $isOpen,
            'inspection_fee' => $fee,
        ];

        if ($isOpen && (empty($property->inspection_status) || $property->inspection_status === 'unassigned')) {
            $updateData['inspection_status'] = 'unassigned';
        }

        $property->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => $isOpen 
                ? 'Property opened for field inspection bounty with ₦' . number_format($fee) . ' fee.'
                : 'Property inspection bounty closed.',
            'data' => [
                'property_id' => $property->id,
                'is_open_for_inspection' => (bool)$property->is_open_for_inspection,
                'inspection_fee' => (float)$property->inspection_fee,
                'inspection_status' => $property->inspection_status,
            ]
        ]);
    }

    /**
     * GET /api/v1/admin/inspections/applications
     * List all inspection applications from agents
     */
    public function getApplications(Request $request)
    {
        $query = AgentInspection::with(['agent', 'property.host'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $applications = $query->get()->map(function ($app) {
            return [
                'id' => $app->id,
                'property_id' => $app->property_id,
                'property_name' => $app->property ? $app->property->name : 'Unknown Property',
                'property_city' => $app->property ? $app->property->city : '',
                'property_state' => $app->property ? $app->property->state : '',
                'property_address' => $app->property ? $app->property->address : '',
                'cover_image' => $app->property && is_array($app->property->images) && count($app->property->images) > 0 
                    ? $app->property->images[0] 
                    : '/logo.jpeg',
                'agent_id' => $app->agent_id,
                'agent_name' => $app->agent ? $app->agent->name : 'Unknown Agent',
                'agent_email' => $app->agent ? $app->agent->email : '',
                'agent_phone' => $app->agent ? $app->agent->phone : '',
                'host_name' => $app->property && $app->property->host ? $app->property->host->name : 'Unknown Host',
                'host_phone' => $app->property && $app->property->host ? ($app->property->contact_phone ?: $app->property->host->phone) : '',
                'status' => $app->status,
                'inspection_fee' => (float)$app->inspection_fee,
                'inspection_fee_formatted' => '₦' . number_format((float)$app->inspection_fee),
                'applied_at' => $app->applied_at ? $app->applied_at->format('M d, Y g:i A') : $app->created_at->format('M d, Y g:i A'),
                'approved_at' => $app->approved_at ? $app->approved_at->format('M d, Y g:i A') : null,
                'admin_review_notes' => $app->admin_review_notes,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $applications,
        ]);
    }

    /**
     * POST /api/v1/admin/inspections/applications/{id}/respond
     * Authorize or decline an agent's inspection application
     */
    public function respondToApplication(Request $request, $id)
    {
        $inspection = AgentInspection::with(['agent', 'property'])->findOrFail($id);

        $validated = $request->validate([
            'action' => 'required|in:approved,declined',
            'admin_review_notes' => 'nullable|string|max:1000',
        ]);

        $action = $validated['action'];
        $notes = $validated['admin_review_notes'] ?? null;

        if ($action === 'approved') {
            $inspection->update([
                'status' => 'approved',
                'approved_at' => now(),
                'admin_review_notes' => $notes ?: 'Application approved by Super Admin. Property & host contact details unlocked.',
            ]);

            if ($inspection->property) {
                $inspection->property->update([
                    'inspection_status' => 'assigned',
                ]);

                // Decline any competing pending applications for this property
                AgentInspection::where('property_id', $inspection->property_id)
                    ->where('id', '!=', $inspection->id)
                    ->where('status', 'pending')
                    ->update([
                        'status' => 'declined',
                        'admin_review_notes' => 'Another regional field inspector was authorized for this assignment.',
                    ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Agent application approved! Host contact and exact address have been released to the agent.',
                'data' => [
                    'inspection_id' => $inspection->id,
                    'status' => 'approved',
                    'agent_name' => $inspection->agent ? $inspection->agent->name : '',
                ]
            ]);
        } else {
            $inspection->update([
                'status' => 'declined',
                'admin_review_notes' => $notes ?: 'Application declined by Super Admin.',
            ]);

            // If no other assigned inspector, reset property status to unassigned
            $hasOtherAssigned = AgentInspection::where('property_id', $inspection->property_id)
                ->whereIn('status', ['approved', 'submitted', 'verified'])
                ->exists();

            if (!$hasOtherAssigned && $inspection->property) {
                $inspection->property->update([
                    'inspection_status' => 'unassigned',
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Agent application declined.',
                'data' => [
                    'inspection_id' => $inspection->id,
                    'status' => 'declined',
                ]
            ]);
        }
    }

    /**
     * GET /api/v1/admin/inspections/reports
     * List all submitted field audit reports awaiting admin verification
     */
    public function getReports(Request $request)
    {
        $query = AgentInspection::with(['agent', 'property.host'])
            ->whereIn('status', ['submitted', 'verified'])
            ->orderBy('submitted_at', 'desc');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $reports = $query->get()->map(function ($rep) {
            $prop = $rep->property;
            return [
                'id' => $rep->id,
                'property_id' => $prop ? $prop->id : null,
                'property_name' => $prop ? $prop->name : 'Unknown Property',
                'property_type' => $prop ? $prop->property_type : 'stay',
                'address' => $prop ? $prop->address : '',
                'city' => $prop ? $prop->city : '',
                'state' => $prop ? $prop->state : '',
                'verification_tier' => $prop ? $prop->verification_tier : 'tier_1_basic',
                'inspection_fee' => (float)$rep->inspection_fee,
                'inspection_fee_formatted' => '₦' . number_format((float)$rep->inspection_fee),
                'status' => $rep->status,
                'agent' => $rep->agent ? [
                    'id' => $rep->agent->id,
                    'name' => $rep->agent->name,
                    'email' => $rep->agent->email,
                    'phone' => $rep->agent->phone,
                ] : null,
                'host' => $prop && $prop->host ? [
                    'id' => $prop->host->id,
                    'name' => $prop->host->name,
                    'phone' => $prop->contact_phone ?: $prop->host->phone,
                ] : null,
                'gps_latitude' => $rep->gps_latitude,
                'gps_longitude' => $rep->gps_longitude,
                'photos' => $rep->photos ?: [],
                'video_url' => $rep->video_url,
                'amenities_check' => $rep->amenities_check ?: [],
                'report_notes' => $rep->report_notes,
                'admin_review_notes' => $rep->admin_review_notes,
                'applied_at' => $rep->applied_at ? $rep->applied_at->format('M d, Y g:i A') : null,
                'submitted_at' => $rep->submitted_at ? $rep->submitted_at->format('M d, Y g:i A') : null,
                'verified_at' => $rep->verified_at ? $rep->verified_at->format('M d, Y g:i A') : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $reports,
        ]);
    }

    /**
     * POST /api/v1/admin/inspections/{id}/verify
     * Super Admin approves field audit report, awards Tier 3 badge to property,
     * and credits inspection bounty to the agent's wallet
     */
    public function verifyReport(Request $request, $id)
    {
        $inspection = AgentInspection::with(['agent', 'property'])->findOrFail($id);

        if ($inspection->status !== 'submitted') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only submitted reports can be reviewed and verified.'
            ], 422);
        }

        $validated = $request->validate([
            'action' => 'required|in:approved,revision_requested',
            'admin_review_notes' => 'nullable|string|max:2000',
        ]);

        $action = $validated['action'];
        $notes = $validated['admin_review_notes'] ?? null;

        if ($action === 'approved') {
            // 1. Mark inspection as verified
            $inspection->update([
                'status' => 'verified',
                'verified_at' => now(),
                'admin_review_notes' => $notes ?: 'Field inspection verified and approved by Super Admin.',
            ]);

            // 2. Upgrade property to Tier 3 Certified Physical Inspection
            if ($inspection->property) {
                $inspection->property->update([
                    'is_verified' => true,
                    'verification_tier' => 'tier_3_certified',
                    'inspection_status' => 'verified',
                ]);
            }

            // 3. Atomically deposit bounty into Agent's Wallet
            $agentWallet = AgentWallet::firstOrCreate(
                ['agent_id' => $inspection->agent_id],
                [
                    'balance' => 0.00,
                    'total_earned' => 0.00,
                    'account_name' => $inspection->agent ? $inspection->agent->name : 'Agent',
                ]
            );

            $bountyAmount = (float)$inspection->inspection_fee;
            $ref = 'BNT-' . strtoupper(Str::random(10));
            $propName = $inspection->property ? $inspection->property->name : 'Property #' . $inspection->property_id;

            $tx = $agentWallet->creditBounty(
                $bountyAmount,
                $ref,
                "Field Inspection Bounty Reward for {$propName}"
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Audit verified successfully! Property awarded Tier 3 Certified badge, and ₦' . number_format($bountyAmount, 2) . ' credited to Agent ' . ($inspection->agent ? $inspection->agent->name : '') . ' wallet.',
                'data' => [
                    'inspection_id' => $inspection->id,
                    'status' => 'verified',
                    'bounty_credited' => $bountyAmount,
                    'bounty_credited_formatted' => '₦' . number_format($bountyAmount, 2),
                    'reference' => $ref,
                    'agent_new_balance' => (float)$agentWallet->fresh()->balance,
                    'agent_new_balance_formatted' => '₦' . number_format((float)$agentWallet->fresh()->balance, 2),
                ]
            ]);
        } else {
            // Revision requested - re-open for agent to submit additional details
            $inspection->update([
                'status' => 'approved',
                'admin_review_notes' => $notes ?: 'Revision requested: Please provide clearer photographs or updated GPS reading.',
            ]);

            if ($inspection->property) {
                $inspection->property->update([
                    'inspection_status' => 'assigned',
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Report returned to agent for revision.',
                'data' => [
                    'inspection_id' => $inspection->id,
                    'status' => 'approved',
                ]
            ]);
        }
    }

    /**
     * GET /api/v1/admin/withdrawals
     * List agent withdrawal payout requests
     */
    public function getWithdrawals(Request $request)
    {
        $query = WithdrawalRequest::with(['agent', 'wallet', 'processor'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->get()->map(function ($w) {
            return [
                'id' => $w->id,
                'agent_id' => $w->agent_id,
                'agent_name' => $w->agent ? $w->agent->name : 'Unknown Agent',
                'agent_email' => $w->agent ? $w->agent->email : '',
                'agent_phone' => $w->agent ? $w->agent->phone : '',
                'amount' => (float)$w->amount,
                'amount_formatted' => '₦' . number_format((float)$w->amount, 2),
                'bank_name' => $w->bank_name,
                'account_number' => $w->account_number,
                'account_name' => $w->account_name,
                'status' => $w->status,
                'transaction_reference' => $w->transaction_reference,
                'admin_note' => $w->admin_note,
                'processed_by_name' => $w->processor ? $w->processor->name : null,
                'created_at' => $w->created_at->format('M d, Y g:i A'),
                'processed_at' => $w->processed_at ? $w->processed_at->format('M d, Y g:i A') : null,
                'current_wallet_balance' => $w->wallet ? (float)$w->wallet->balance : 0.00,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $withdrawals,
        ]);
    }

    /**
     * POST /api/v1/admin/withdrawals/{id}/process
     * Admin approves (marks paid) or rejects (refunds balance) withdrawal payout
     */
    public function processWithdrawal(Request $request, $id)
    {
        $withdrawal = WithdrawalRequest::with('wallet')->findOrFail($id);

        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'This withdrawal request has already been processed.'
            ], 422);
        }

        $validated = $request->validate([
            'action' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string|max:1000',
        ]);

        $admin = $this->resolveAdmin($request);
        $action = $validated['action'];
        $note = $validated['admin_note'] ?? null;

        if ($action === 'approved') {
            $withdrawal->update([
                'status' => 'approved',
                'processed_by' => $admin ? $admin->id : null,
                'processed_at' => now(),
                'admin_note' => $note ?: 'Disbursement processed and bank transfer completed.',
            ]);

            // Update associated wallet transaction to completed
            WalletTransaction::where('agent_wallet_id', $withdrawal->agent_wallet_id)
                ->where('reference', $withdrawal->transaction_reference)
                ->update(['status' => 'completed']);

            return response()->json([
                'status' => 'success',
                'message' => 'Withdrawal request marked as disbursed/paid successfully.',
                'data' => [
                    'withdrawal_id' => $withdrawal->id,
                    'status' => 'approved',
                    'processed_at' => $withdrawal->processed_at->toIso8601String(),
                ]
            ]);
        } else {
            // Rejected - refund amount back to agent's wallet
            $wallet = $withdrawal->wallet;
            $refundRef = 'RFD-' . strtoupper(Str::random(10));

            $wallet->refundWithdrawal(
                (float)$withdrawal->amount,
                $refundRef,
                "Withdrawal payout declined by Admin: " . ($note ?: 'Account details mismatch or review rejection')
            );

            $withdrawal->update([
                'status' => 'rejected',
                'processed_by' => $admin ? $admin->id : null,
                'processed_at' => now(),
                'admin_note' => $note ?: 'Withdrawal request rejected and amount refunded back to agent wallet.',
            ]);

            // Update original debit transaction to failed
            WalletTransaction::where('agent_wallet_id', $withdrawal->agent_wallet_id)
                ->where('reference', $withdrawal->transaction_reference)
                ->update(['status' => 'failed']);

            return response()->json([
                'status' => 'success',
                'message' => 'Withdrawal rejected and ₦' . number_format($withdrawal->amount, 2) . ' refunded back to agent wallet balance.',
                'data' => [
                    'withdrawal_id' => $withdrawal->id,
                    'status' => 'rejected',
                    'refund_reference' => $refundRef,
                    'agent_restored_balance' => (float)$wallet->fresh()->balance,
                ]
            ]);
        }
    }
}
