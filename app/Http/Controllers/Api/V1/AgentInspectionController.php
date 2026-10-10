<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentInspection;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;

class AgentInspectionController extends Controller
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
     * GET /api/v1/agent/explore-properties
     * Browse properties opened by Admin for field inspection bounty
     */
    public function exploreProperties(Request $request)
    {
        $agent = $this->resolveAgent($request);

        if (!$agent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated. Please log in as an agent.'
            ], 401);
        }

        $query = Property::where('is_open_for_inspection', true)
            ->where('inspection_status', '!=', 'verified');

        if ($request->filled('state') && $request->state !== 'all') {
            $query->where('state', $request->state);
        }

        $properties = $query->orderBy('created_at', 'desc')->get();

        $mapped = $properties->map(function ($property) use ($agent) {
            // Check if current agent has applied
            $myApplication = AgentInspection::where('property_id', $property->id)
                ->where('agent_id', $agent->id)
                ->latest()
                ->first();

            // Check if any other agent was already approved
            $isAssignedToOther = AgentInspection::where('property_id', $property->id)
                ->where('agent_id', '!=', $agent->id)
                ->whereIn('status', ['approved', 'submitted', 'verified'])
                ->exists();

            return [
                'id' => $property->id,
                'name' => $property->name,
                'slug' => $property->slug,
                'property_type' => $property->property_type,
                'description' => $property->description,
                'city' => $property->city,
                'state' => $property->state,
                'neighborhood' => $property->neighborhood,
                // Mask private host contact and exact address until approved
                'address' => $myApplication && in_array($myApplication->status, ['approved', 'submitted', 'verified'])
                    ? $property->address
                    : $property->city . ', ' . $property->state . ' (Exact gate directions unlocked upon assignment)',
                'inspection_fee' => (float)$property->inspection_fee,
                'inspection_fee_formatted' => '₦' . number_format((float)$property->inspection_fee),
                'inspection_status' => $property->inspection_status,
                'cover_image' => is_array($property->images) && count($property->images) > 0 
                    ? $property->images[0] 
                    : '/logo.jpeg',
                'images' => is_array($property->images) ? $property->images : ['/logo.jpeg'],
                'amenities' => is_array($property->amenities) ? $property->amenities : [],
                'my_application' => $myApplication ? [
                    'id' => $myApplication->id,
                    'status' => $myApplication->status,
                    'applied_at' => $myApplication->applied_at ? $myApplication->applied_at->format('M d, Y g:i A') : null,
                    'approved_at' => $myApplication->approved_at ? $myApplication->approved_at->format('M d, Y g:i A') : null,
                ] : null,
                'can_apply' => !$myApplication && !$isAssignedToOther && in_array($property->inspection_status, ['unassigned', 'application_pending']),
                'is_assigned_to_other' => $isAssignedToOther,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $mapped,
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'role' => $agent->role,
            ]
        ]);
    }

    /**
     * POST /api/v1/agent/inspections/apply
     * Agent submits application for a property inspection bounty
     */
    public function apply(Request $request)
    {
        $agent = $this->resolveAgent($request);

        if (!$agent) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
        ]);

        $property = Property::findOrFail($validated['property_id']);

        if (!$property->is_open_for_inspection) {
            return response()->json([
                'status' => 'error',
                'message' => 'This property is not currently open for field inspection.'
            ], 422);
        }

        // Prevent duplicate application
        $existing = AgentInspection::where('property_id', $property->id)
            ->where('agent_id', $agent->id)
            ->whereIn('status', ['pending', 'approved', 'submitted'])
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'You already have an active application for this property.'
            ], 422);
        }

        // Check if assigned to another agent
        $assignedOther = AgentInspection::where('property_id', $property->id)
            ->where('agent_id', '!=', $agent->id)
            ->whereIn('status', ['approved', 'submitted', 'verified'])
            ->exists();

        if ($assignedOther) {
            return response()->json([
                'status' => 'error',
                'message' => 'This property has already been assigned to another regional inspector.'
            ], 422);
        }

        $inspection = AgentInspection::create([
            'property_id' => $property->id,
            'agent_id' => $agent->id,
            'status' => 'pending',
            'inspection_fee' => $property->inspection_fee,
            'applied_at' => now(),
        ]);

        $property->update([
            'inspection_status' => 'application_pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Inspection application submitted! Awaiting Super Admin review and authorization.',
            'data' => [
                'inspection_id' => $inspection->id,
                'property_id' => $property->id,
                'status' => 'pending',
                'inspection_fee' => (float)$inspection->inspection_fee,
            ]
        ], 201);
    }

    /**
     * GET /api/v1/agent/inspections/my-assignments
     * Fetch agent's active and historical inspections with unlocked host details
     */
    public function myAssignments(Request $request)
    {
        $agent = $this->resolveAgent($request);

        if (!$agent) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }

        $inspections = AgentInspection::with(['property.host'])
            ->where('agent_id', $agent->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $mapped = $inspections->map(function ($ins) {
            $prop = $ins->property;
            $isUnlocked = in_array($ins->status, ['approved', 'submitted', 'verified']);

            return [
                'id' => $ins->id,
                'property_id' => $prop ? $prop->id : null,
                'property_name' => $prop ? $prop->name : 'Unknown Property',
                'property_type' => $prop ? $prop->property_type : 'stay',
                'status' => $ins->status, // pending, approved, declined, submitted, verified
                'inspection_fee' => (float)$ins->inspection_fee,
                'inspection_fee_formatted' => '₦' . number_format((float)$ins->inspection_fee),
                'applied_at' => $ins->applied_at ? $ins->applied_at->format('M d, Y g:i A') : null,
                'approved_at' => $ins->approved_at ? $ins->approved_at->format('M d, Y g:i A') : null,
                'submitted_at' => $ins->submitted_at ? $ins->submitted_at->format('M d, Y g:i A') : null,
                'verified_at' => $ins->verified_at ? $ins->verified_at->format('M d, Y g:i A') : null,
                'cover_image' => $prop && is_array($prop->images) && count($prop->images) > 0 ? $prop->images[0] : '/logo.jpeg',
                'city' => $prop ? $prop->city : '',
                'state' => $prop ? $prop->state : '',

                // UNLOCKED DETAILS WHEN APPROVED
                'is_details_unlocked' => $isUnlocked,
                'host_details' => $isUnlocked && $prop && $prop->host ? [
                    'name' => $prop->host->name,
                    'phone' => $prop->contact_phone ?: $prop->host->phone,
                    'email' => $prop->host->email,
                    'business_name' => $prop->host->business_name,
                ] : null,
                'unlocked_address' => $isUnlocked && $prop ? $prop->address : 'Hidden until application approval',

                // Field Audit Evidence (if submitted)
                'report' => [
                    'gps_latitude' => $ins->gps_latitude,
                    'gps_longitude' => $ins->gps_longitude,
                    'photos' => $ins->photos,
                    'video_url' => $ins->video_url,
                    'amenities_check' => $ins->amenities_check,
                    'report_notes' => $ins->report_notes,
                    'admin_review_notes' => $ins->admin_review_notes,
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $mapped,
        ]);
    }

    /**
     * POST /api/v1/agent/inspections/{id}/submit-report
     * Agent uploads on-site verification report (GPS, photos, video, amenities check, notes)
     */
    public function submitReport(Request $request, $id)
    {
        $agent = $this->resolveAgent($request);

        if (!$agent) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }

        $inspection = AgentInspection::with('property')
            ->where('id', $id)
            ->where('agent_id', $agent->id)
            ->firstOrFail();

        if ($inspection->status !== 'approved') {
            return response()->json([
                'status' => 'error',
                'message' => 'Reports can only be uploaded for approved assignments in active site-visit status.'
            ], 422);
        }

        $validated = $request->validate([
            'gps_latitude' => 'required|numeric|between:-90,90',
            'gps_longitude' => 'required|numeric|between:-180,180',
            'photos' => 'nullable|array',
            'video_url' => 'nullable|string|max:500',
            'amenities_check' => 'nullable|array',
            'report_notes' => 'required|string|min:10|max:5000',
        ]);

        $inspection->update([
            'gps_latitude' => $validated['gps_latitude'],
            'gps_longitude' => $validated['gps_longitude'],
            'photos' => $validated['photos'] ?? [],
            'video_url' => $validated['video_url'] ?? null,
            'amenities_check' => $validated['amenities_check'] ?? [],
            'report_notes' => trim($validated['report_notes']),
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        if ($inspection->property) {
            $inspection->property->update([
                'latitude' => $validated['gps_latitude'],
                'longitude' => $validated['gps_longitude'],
                'inspection_status' => 'submitted',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Field verification audit uploaded successfully! Super Admin will review the evidence to approve and release your ₦' . number_format($inspection->inspection_fee) . ' bounty.',
            'data' => [
                'inspection_id' => $inspection->id,
                'status' => 'submitted',
                'submitted_at' => $inspection->submitted_at->toIso8601String(),
            ]
        ]);
    }
}
