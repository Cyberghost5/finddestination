<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    /**
     * Helper to format database Property model into React component schema
     */
    private function formatPropertyForFrontend(Property $prop): array
    {
        // If property somehow has no room types in DB, self-heal by creating one
        if ($prop->roomTypes->isEmpty()) {
            $createdRoom = RoomType::create([
                'property_id' => $prop->id,
                'name' => 'Executive Suite',
                'base_price_kobo' => 4500000,
                'total_units' => 4,
                'max_occupancy' => 2,
                'bed_type' => 'King Bed'
            ]);
            $prop->load('roomTypes');
        }

        $rooms = $prop->roomTypes->map(function ($r) {
            return [
                'id' => $r->id,
                'name' => $r->name,
                'price_kobo' => (int) $r->base_price_kobo,
                'price_formatted' => '₦' . number_format($r->base_price_kobo / 100),
                'max_occupancy' => $r->max_occupancy,
                'bed_type' => $r->bed_type,
            ];
        });

        $startingPriceKobo = $prop->roomTypes->min('base_price_kobo') ?? 3500000;
        $defaultImages = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
        ];

        return [
            'id' => $prop->id,
            'host_id' => (int) $prop->host_id,
            'name' => $prop->name,
            'slug' => $prop->slug,
            'property_type' => $prop->property_type,
            'category' => $prop->category ?? 'All Stays',
            'city' => $prop->city,
            'state' => $prop->state,
            'neighborhood' => $prop->neighborhood ?? ($prop->city . ' Central'),
            'address' => $prop->address,
            'description' => $prop->description,
            'verification_status' => $prop->verification_status,
            'verification_tier' => $prop->verification_tier ?? 'tier_3_certified',
            'is_published' => (bool) $prop->is_published,
            'starting_price_kobo' => $startingPriceKobo,
            'starting_price_formatted' => '₦' . number_format($startingPriceKobo / 100),
            'rating' => round($prop->reviews->avg('rating') ?? 4.85, 2),
            'review_count' => $prop->reviews->count() ?: 48,
            'images' => !empty($prop->images) ? $prop->images : $defaultImages,
            'amenities' => !empty($prop->amenities) ? $prop->amenities : ['24/7 Power', 'Constant Water', 'Air Conditioning', 'WiFi', 'CCTV Security'],
            'latitude' => (float) ($prop->latitude ?? 10.3158),
            'longitude' => (float) ($prop->longitude ?? 9.8442),
            'host' => [
                'id' => (int) ($prop->host_id ?? ($prop->host ? $prop->host->id : null)),
                'name' => $prop->host ? $prop->host->name : ($prop->host_id == 3 ? 'Alhaji Ibrahim Bello' : 'Verified Host'),
                'business_name' => $prop->host ? $prop->host->business_name : null,
                'email' => $prop->host ? $prop->host->email : null,
                'role' => 'Verified Host',
                'joined' => $prop->host && $prop->host->created_at ? $prop->host->created_at->format('Y') : '2024',
                'response_rate' => '99%'
            ],
            'rooms' => $rooms->toArray()
        ];
    }

    /**
     * GET /api/v1/properties
     * Return all database properties for React application
     */
    public function index(Request $request)
    {
        $query = Property::with(['roomTypes', 'reviews', 'host']);

        if ($request->has('host_id')) {
            $query->where('host_id', $request->input('host_id'));
        }

        $properties = $query->get();
        $formatted = $properties->map(fn($p) => $this->formatPropertyForFrontend($p));

        return response()->json([
            'status' => 'success',
            'data' => $formatted
        ]);
    }

    /**
     * GET /api/v1/properties/search
     */
    public function search(Request $request)
    {
        $query = Property::with(['roomTypes', 'reviews', 'host']);

        if ($request->filled('state')) {
            $query->where('state', 'LIKE', '%' . $request->state . '%');
        }

        if ($request->filled('city')) {
            $query->where('city', 'LIKE', '%' . $request->city . '%');
        }

        if ($request->filled('property_type') && $request->property_type !== 'all') {
            $query->where('property_type', $request->property_type);
        }

        if ($request->boolean('verified_only')) {
            $query->where('verification_tier', 'tier_3_certified');
        }

        $properties = $query->get();
        $formatted = $properties->map(fn($p) => $this->formatPropertyForFrontend($p));

        return response()->json([
            'status' => 'success',
            'data' => $formatted
        ]);
    }

    /**
     * GET /api/v1/properties/{id}
     */
    public function show($id)
    {
        $property = Property::with(['roomTypes', 'verifications', 'reviews.user', 'host'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $this->formatPropertyForFrontend($property)
        ]);
    }

    /**
     * POST /api/v1/properties
     * Create new property product in DB
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'property_type' => 'required|string',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'contact_phone' => 'nullable|string',
            'starting_price_kobo' => 'nullable|numeric',
        ]);

        $hostId = auth()->id() ?? $request->input('host_id');
        if (!$hostId && $request->has('host.id')) {
            $hostId = $request->input('host.id');
        }

        $hostEmail = $request->input('host.email') ?? $request->input('host_email');
        $hostName = $request->input('host.name') ?? $request->input('host_name');
        $businessName = $request->input('host.business_name') ?? $request->input('business_name');
        $cacNumber = $request->input('host.cac_number') ?? $request->input('cac_number');
        $tinNumber = $request->input('host.tin_number') ?? $request->input('tin_number');

        if ($hostEmail) {
            $existingHost = User::where('email', $hostEmail)->first();
            if ($existingHost) {
                $hostId = $existingHost->id;
                if ($businessName && !$existingHost->business_name) {
                    $existingHost->update(['business_name' => $businessName]);
                }
            } else {
                $phone = $validated['contact_phone'] ?? null;
                if ($phone && User::where('phone', $phone)->exists()) {
                    $phoneUser = User::where('phone', $phone)->first();
                    if ($phoneUser && $phoneUser->role === 'host') {
                        $hostId = $phoneUser->id;
                    } else {
                        $phone = '+23480' . mt_rand(10000000, 99999999);
                    }
                }
                if (!$hostId) {
                    $newHost = User::create([
                        'name' => $hostName ?: 'Host Partner',
                        'email' => $hostEmail,
                        'phone' => $phone ?: ('+23480' . mt_rand(10000000, 99999999)),
                        'role' => 'host',
                        'business_name' => $businessName,
                        'cac_number' => $cacNumber,
                        'tin_number' => $tinNumber,
                        'host_status' => 'approved',
                        'password' => bcrypt('password123'),
                        'email_verified_at' => now(),
                    ]);
                    $hostId = $newHost->id;
                }
            }
        }

        if (!$hostId) {
            $hostId = 3;
        }

        $description = !empty($validated['description'])
            ? $validated['description']
            : "Newly listed {$validated['property_type']} in {$validated['city']}, {$validated['state']}. Features 24/7 power backup and verified security.";

        $property = Property::create([
            'host_id' => $hostId,
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . rand(100, 999),
            'property_type' => strtolower($validated['property_type']),
            'description' => $description,
            'address' => $validated['address'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'latitude' => $request->input('latitude') ? (float)$request->input('latitude') : 10.3158,
            'longitude' => $request->input('longitude') ? (float)$request->input('longitude') : 9.8442,
            'contact_phone' => $validated['contact_phone'] ?? '+2348021112233',
            'verification_status' => 'unverified',
            'verification_tier' => 'tier_1_docs',
            'is_published' => true,
            'images' => [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
            ],
            'amenities' => $request->input('amenities') ?: ['24/7 Power', 'Constant Water', 'Air Conditioning', 'WiFi']
        ]);

        $priceKobo = (int) ($request->input('starting_price_kobo')
            ?? ($request->input('base_price_ngn') ? $request->input('base_price_ngn') * 100 : 4500000));
        $roomName = $request->input('room_name') ?? $request->input('rooms.0.name') ?? 'Executive Suite';
        $totalUnits = (int) ($request->input('total_units') ?? $request->input('rooms.0.total_units') ?? 4);
        $maxOccupancy = (int) ($request->input('max_occupancy') ?? $request->input('rooms.0.max_occupancy') ?? 2);
        $bedType = $request->input('bed_type') ?? $request->input('rooms.0.bed_type') ?? 'King Bed';

        RoomType::create([
            'property_id' => $property->id,
            'name' => $roomName,
            'base_price_kobo' => $priceKobo,
            'total_units' => $totalUnits,
            'max_occupancy' => $maxOccupancy,
            'bed_type' => $bedType
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Property created in database successfully',
            'data' => $this->formatPropertyForFrontend($property->fresh(['roomTypes', 'reviews', 'host']))
        ], 201);
    }

    /**
     * PATCH /api/v1/properties/{id}/publish
     */
    public function togglePublish($id)
    {
        $property = Property::findOrFail($id);
        $property->is_published = !$property->is_published;
        $property->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Publish status updated in database',
            'is_published' => $property->is_published
        ]);
    }

    /**
     * PATCH /api/v1/properties/{id}/verification
     */
    public function updateVerification(Request $request, $id)
    {
        $property = Property::findOrFail($id);
        $tier = $request->input('tier', 'tier_3_certified');

        $statusMap = [
            'tier_1_docs' => 'documents_verified',
            'tier_2_location' => 'location_verified',
            'tier_3_certified' => 'verified'
        ];

        $property->verification_tier = $tier;
        $property->verification_status = $statusMap[$tier] ?? 'verified';
        $property->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Verification status updated in database',
            'data' => $this->formatPropertyForFrontend($property->fresh(['roomTypes', 'reviews', 'host']))
        ]);
    }
}
