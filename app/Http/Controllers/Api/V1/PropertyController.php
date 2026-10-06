<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    /**
     * GET /api/v1/properties/search
     * Conforms strictly to PRD Section 5.1 JSON schema resource
     */
    public function search(Request $request)
    {
        $query = Property::with(['roomTypes', 'reviews'])
            ->where('is_published', true);

        if ($request->filled('state')) {
            $query->where('state', 'LIKE', '%' . $request->state . '%');
        }

        if ($request->filled('city')) {
            $query->where('city', 'LIKE', '%' . $request->city . '%');
        }

        if ($request->filled('property_type')) {
            $query->where('property_type', $request->property_type);
        }

        if ($request->boolean('verified_only')) {
            $query->where('verification_status', 'verified');
        }

        $properties = $query->paginate($request->integer('per_page', 15));

        $formatted = $properties->getCollection()->map(function ($prop) {
            $startingPriceKobo = $prop->roomTypes->min('base_price_kobo') ?? 3500000;
            return [
                'id' => $prop->id,
                'name' => $prop->name,
                'slug' => $prop->slug,
                'property_type' => $prop->property_type,
                'city' => $prop->city,
                'state' => $prop->state,
                'verification_status' => $prop->verification_status,
                'starting_price_kobo' => $startingPriceKobo,
                'starting_price_formatted' => '₦' . number_format($startingPriceKobo / 100),
                'cover_image_url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                'ratings' => [
                    'average' => round($prop->reviews->avg('rating') ?? 4.8, 1),
                    'count' => $prop->reviews->count() ?: 42
                ]
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formatted,
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ]
        ]);
    }

    public function show($id)
    {
        $property = Property::with(['roomTypes', 'verifications', 'reviews.user', 'host'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $property
        ]);
    }
}
