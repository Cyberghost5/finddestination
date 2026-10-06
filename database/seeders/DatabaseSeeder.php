<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Property;
use App\Models\PropertyVerification;
use App\Models\RoomType;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Core Personas (PRD Section 2)
        $admin = User::create([
            'name' => 'Tafiya Admin',
            'email' => 'admin@tafiya.ng',
            'phone' => '+2348000000001',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $agent = User::create([
            'name' => 'Usman Field Agent',
            'email' => 'agent@tafiya.ng',
            'phone' => '+2348000000002',
            'password' => Hash::make('password123'),
            'role' => 'agent',
        ]);

        $host = User::create([
            'name' => 'Alhaji Ibrahim Bello',
            'email' => 'ibrahim@tafiya.ng',
            'phone' => '+2348021112233',
            'password' => Hash::make('password123'),
            'role' => 'host',
        ]);

        $guest = User::create([
            'name' => 'Musa Danjuma',
            'email' => 'musa@example.com',
            'phone' => '+2348039998877',
            'password' => Hash::make('password123'),
            'role' => 'guest',
        ]);

        // 2. Create Sample Properties
        $p1 = Property::create([
            'host_id' => $host->id,
            'name' => 'Yankari Safari & Luxury Suites',
            'slug' => 'yankari-safari-luxury-suites-bauchi',
            'property_type' => 'resort',
            'description' => 'World-class hospitality near Yankari Game Reserve with 24/7 solar power and armed security.',
            'address' => 'Plot 14 Safari Way, Off Expressway',
            'city' => 'Bauchi',
            'state' => 'Bauchi',
            'latitude' => 10.3158,
            'longitude' => 9.8442,
            'contact_phone' => '+2348021112233',
            'verification_status' => 'verified',
            'is_published' => true,
        ]);

        PropertyVerification::create([
            'property_id' => $p1->id,
            'agent_id' => $agent->id,
            'cac_registration_number' => 'RC-9918201',
            'tax_number' => 'TIN-9281014',
            'verified_latitude' => 10.3158,
            'verified_longitude' => 9.8442,
            'field_audit_notes' => 'On-site physical audit passed. 24/7 solar backup and water confirmed.',
            'verification_tier' => 'tier_3_certified',
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);

        RoomType::create([
            'property_id' => $p1->id,
            'name' => 'Executive Royal Suite',
            'base_price_kobo' => 4500000,
            'total_units' => 5,
            'max_occupancy' => 2,
            'bed_type' => 'King Double',
        ]);

        $p2 = Property::create([
            'host_id' => $host->id,
            'name' => 'Barnawa Crest Serviced Apartments',
            'slug' => 'barnawa-crest-serviced-apartments-kaduna',
            'property_type' => 'serviced_apartment',
            'description' => 'Modern executive 2-bedroom serviced apartment in Barnawa GRA, Kaduna.',
            'address' => '22 Commercial Avenue, Barnawa GRA',
            'city' => 'Kaduna',
            'state' => 'Kaduna',
            'latitude' => 10.5105,
            'longitude' => 7.4165,
            'contact_phone' => '+2348021112233',
            'verification_status' => 'location_verified',
            'is_published' => true,
        ]);

        RoomType::create([
            'property_id' => $p2->id,
            'name' => '2-Bedroom Executive Flat',
            'base_price_kobo' => 3800000,
            'total_units' => 3,
            'max_occupancy' => 4,
            'bed_type' => '2 Queen Beds',
        ]);
    }
}
