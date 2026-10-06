# Product Requirements Document (PRD): Tafiya Accommodation Marketplace

## 1. Executive Summary & Product Architecture

**Tafiya** is a localized digital accommodation marketplace engineered for Northern Nigeria, connecting travelers (corporate travelers, development/NGO personnel, tourists, students, and families) with vetted lodging providers (hotels, guest houses, lodges, and serviced apartments).

The platform operates as a modern web application designed API-first using **PHP 8.3+ with Laravel 11.x/12.x** and **MySQL 8.0+**, enabling complete feature parity when native **Flutter** iOS/Android client apps consume the `/api/v1/*` endpoints at a later phase. Online payment processing is powered by **Paystack** (Cards, USSD, Apple Pay) and **Monnify** (Dynamic Virtual Bank Accounts, Direct Bank Transfers) within an escrow settlement lifecycle.

---

## 2. Core Personas & System Permissions

```
                +---------------------------------------+
                |        Tafiya RBAC Hierarchy          |
                +---------------------------------------+
                                    |
     +------------------+-----------+-----------+-------------------+
     |                  |                       |                   |
     v                  v                       v                   v
[ Guest / Traveler ] [ Host / Property Mgr ] [ Field Agent ]   [ Super Admin ]
- Public Search      - Inventory & Rates     - GPS Validation   - Doc Verification
- Direct Booking     - Check-in Validation   - Visual Audits    - Escrow Releases
- Verified Reviews   - Payout Withdrawals    - Tier 2 Clearance - Platform Fees

```

* **Guest / Traveler:** Discovers stays, filters by verified status, books rooms, selects checkout rails, views trip vouchers, and submits post-checkout reviews.


* **Host / Property Manager:** Configures hotel profiles, room tiers, nightly rates, blackout calendars, processes arrival check-ins, and tracks earnings.


* **Field Verification Agent:** Performs physical inspections, logs verified GPS coordinates, uploads site photos, and validates property operation.


* **Super Admin:** Approves Tier 1/2 verification submissions, configures platform commission rates, monitors dispute queues, and executes host payouts.



---

## 3. High-Priority Payment Gateway Architecture (Paystack & Monnify)

To maximize conversion across Northern Nigerian payment preferences, Tafiya implements a multi-rail gateway using the **Strategy Pattern**.

### 3.1 Gateway Responsibilities

* **Paystack:** Card transactions (Mastercard, Visa, Verve), Bank USSD channels, and international travelers paying in foreign currency via card or Apple Pay.
* **Monnify:** Dynamic Reserved Virtual Accounts and direct instant bank transfers, providing reduced checkout drop-off for users preferring direct bank app transfers.

### 3.2 Escrow & Settlement Flow

```
[ Traveler Books Room ]
           │
           ├── Selected Rail: Paystack (Card / USSD)
           └── Selected Rail: Monnify (Dynamic Virtual Account)
           │
[ Payment Webhook Triggered ] ──> Verify Signature ──> Mark Booking: Confirmed
           │
           ▼
[ Escrow Account (Platform Wallet) ]
           │
           │ (Guest completes stay / Check-in + 24 Hours elapsed)
           ▼
[ Commission Engine ]
     ├── 10% - 15% Platform Commission Retained
     └── 85% - 90% Transferred to Host Available Balance
           │
[ Host Payout via Monnify/Paystack Transfers API ] ──> Host Local Bank Account

```

### 3.3 Gateway Integration Interface (Laravel Service Pattern)

```php
namespace App\Services\Payments;

use App\Models\Booking;

interface PaymentGatewayInterface
{
    public function initializePayment(Booking $booking): array;
    public function verifyWebhookSignature(string $payload, string $signature): bool;
    public function handleSuccessfulTransaction(array $payload): bool;
    public function initiateHostPayout(string $recipientCode, int $amountKobo): array;
}

```

* **Paystack Webhook Security:** Webhook requests validate the `X-Paystack-Signature` header via HMAC SHA512 against the platform secret key.
* **Monnify Webhook Security:** Webhook requests validate the `monnify-signature` header computed via HMAC SHA512 using the secret key over the raw JSON payload.
* **Idempotency Guarantee:** Each webhook payload checks for previous processing against the `payment_transactions` table to prevent duplicate transaction recording.

---

## 4. MySQL 8 Database Architecture (Production DDL)

```sql
-- 1. USERS & ROLES
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) UNIQUE NOT NULL,
    `phone` VARCHAR(30) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('guest', 'host', 'agent', 'admin') DEFAULT 'guest',
    `is_active` BOOLEAN DEFAULT TRUE,
    `email_verified_at` TIMESTAMP NULL,
    `phone_verified_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    INDEX `idx_users_role` (`role`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PROPERTIES
CREATE TABLE `properties` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `host_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) UNIQUE NOT NULL,
    `property_type` ENUM('hotel', 'guest_house', 'lodge', 'serviced_apartment', 'boutique', 'resort') NOT NULL,
    `description` TEXT NOT NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `contact_phone` VARCHAR(30) NOT NULL,
    `check_in_time` TIME DEFAULT '14:00:00',
    `check_out_time` TIME DEFAULT '12:00:00',
    `verification_status` ENUM('unverified', 'documents_verified', 'location_verified', 'verified') DEFAULT 'unverified',
    `is_published` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`host_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_property_search` (`state`, `city`, `verification_status`, `is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PROPERTY VERIFICATION LOGS
CREATE TABLE `property_verifications` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `property_id` BIGINT UNSIGNED NOT NULL,
    `agent_id` BIGINT UNSIGNED NULL,
    `cac_registration_number` VARCHAR(100) NULL,
    `cac_document_url` VARCHAR(255) NULL,
    `tax_number` VARCHAR(100) NULL,
    `verified_latitude` DECIMAL(10, 8) NULL,
    `verified_longitude` DECIMAL(11, 8) NULL,
    `field_audit_notes` TEXT NULL,
    `verification_tier` ENUM('tier_1_docs', 'tier_2_location', 'tier_3_certified') NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    `reviewed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ROOM TYPES & PRICING
CREATE TABLE `room_types` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `property_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `base_price_kobo` BIGINT UNSIGNED NOT NULL, -- Currency in Kobo (NGN * 100)
    `total_units` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `max_occupancy` SMALLINT UNSIGNED DEFAULT 2,
    `bed_type` VARCHAR(100) DEFAULT 'Standard Double',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    INDEX `idx_room_pricing` (`property_id`, `base_price_kobo`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ROOM BLACKOUTS / INVENTORY OVERRIDES
CREATE TABLE `room_blackouts` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `room_type_id` BIGINT UNSIGNED NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `reason` VARCHAR(255) DEFAULT 'Maintenance/Walk-in',
    `created_at` TIMESTAMP NULL,
    FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE CASCADE,
    INDEX `idx_blackout_dates` (`room_type_id`, `start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BOOKINGS & ESCROW
CREATE TABLE `bookings` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_reference` VARCHAR(32) UNIQUE NOT NULL, -- e.g. TAF-KD-2026-9218
    `user_id` BIGINT UNSIGNED NOT NULL,
    `property_id` BIGINT UNSIGNED NOT NULL,
    `room_type_id` BIGINT UNSIGNED NOT NULL,
    `rooms_count` SMALLINT UNSIGNED DEFAULT 1,
    `check_in_date` DATE NOT NULL,
    `check_out_date` DATE NOT NULL,
    `total_nights` SMALLINT UNSIGNED NOT NULL,
    `total_amount_kobo` BIGINT UNSIGNED NOT NULL,
    `commission_rate` DECIMAL(5,2) DEFAULT 10.00,
    `platform_commission_kobo` BIGINT UNSIGNED NOT NULL,
    `host_payout_kobo` BIGINT UNSIGNED NOT NULL,
    `booking_status` ENUM('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    `hold_expires_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE CASCADE,
    INDEX `idx_booking_availability` (`room_type_id`, `check_in_date`, `check_out_date`, `booking_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PAYMENT TRANSACTIONS (PAYSTACK & MONNIFY)
CREATE TABLE `payment_transactions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT UNSIGNED NOT NULL,
    `gateway` ENUM('paystack', 'monnify') NOT NULL,
    `transaction_reference` VARCHAR(150) UNIQUE NOT NULL,
    `gateway_reference` VARCHAR(150) NULL,
    `amount_paid_kobo` BIGINT UNSIGNED NOT NULL,
    `payment_channel` VARCHAR(50) NULL, -- 'card', 'bank_transfer', 'ussd'
    `virtual_account_number` VARCHAR(30) NULL,
    `virtual_bank_name` VARCHAR(100) NULL,
    `status` ENUM('initiated', 'successful', 'failed', 'refunded') DEFAULT 'initiated',
    `raw_webhook_payload` JSON NULL,
    `paid_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. REVIEWS & RATINGS
CREATE TABLE `reviews` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT UNSIGNED UNIQUE NOT NULL,
    `property_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL, -- 1 to 5
    `cleanliness_rating` TINYINT UNSIGNED NOT NULL,
    `security_rating` TINYINT UNSIGNED NOT NULL,
    `power_water_rating` TINYINT UNSIGNED NOT NULL,
    `comment` TEXT NOT NULL,
    `host_reply` TEXT NULL,
    `is_published` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

```

---

## 5. REST API Contract & Specification (`/api/v1`)

The backend must serve structured JSON responses conforming to the Laravel API Resource standard. All authenticated requests use Bearer Tokens generated via Laravel Sanctum.

### 5.1 Public Stays & Search Engine

#### `GET /api/v1/properties/search`

* **Query Parameters:**
* `state`: String (e.g., `Bauchi`, `Kaduna`, `Kano`)


* `city`: String


* `check_in`: Date (`YYYY-MM-DD`)


* `check_out`: Date (`YYYY-MM-DD`)


* `property_type`: String (`hotel`, `guest_house`, `lodge`, `serviced_apartment`)


* `verified_only`: Boolean (`true` or `false`)


* `min_price`: Unsigned Integer (Kobo)
* `max_price`: Unsigned Integer (Kobo)
* `page`: Integer


* **Standard Response Body (`200 OK`):**

```json
{
  "status": "success",
  "data": [
    {
      "id": 102,
      "name": "Yankari Luxury Suites",
      "slug": "yankari-luxury-suites-bauchi",
      "property_type": "hotel",
      "city": "Bauchi",
      "state": "Bauchi",
      "verification_status": "verified",
      "starting_price_kobo": 3500000,
      "starting_price_formatted": "₦35,000",
      "cover_image_url": "https://media.tafiya.ng/properties/102/cover.webp",
      "ratings": {
        "average": 4.7,
        "count": 42
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 4,
    "per_page": 15,
    "total": 52
  }
}

```

---

### 5.2 Booking Initiation & Concurrency

#### `POST /api/v1/bookings`

* **Headers:** `Authorization: Bearer <sanctum_token>`, `Idempotency-Key: <unique_uuid>`
* **Request Payload:**

```json
{
  "room_type_id": 14,
  "rooms_count": 1,
  "check_in_date": "2026-11-01",
  "check_out_date": "2026-11-04",
  "guest_name": "Musa Danjuma",
  "guest_phone": "+2348021112233",
  "guest_email": "musa@example.com",
  "payment_gateway": "monnify" 
}

```

* **Core Concurrency Logic (Pessimistic Row Lock):**

```php
public function createBooking(array $validated): Booking
{
    return DB::transaction(function () use ($validated) {
        $roomType = RoomType::where('id', $validated['room_type_id'])
            ->lockForUpdate()
            ->firstOrFail();

        // Count overlapping confirmed or active hold reservations
        $activeBookings = Booking::where('room_type_id', $roomType->id)
            ->whereIn('booking_status', ['confirmed', 'checked_in'])
            ->orWhere(function ($query) use ($roomType) {
                $query->where('room_type_id', $roomType->id)
                      ->where('booking_status', 'pending')
                      ->where('hold_expires_at', '>', now());
            })
            ->where(function ($query) use ($validated) {
                $query->where('check_in_date', '<', $validated['check_out_date'])
                      ->where('check_out_date', '>', $validated['check_in_date']);
            })
            ->sum('rooms_count');

        if (($roomType->total_units - $activeBookings) < $validated['rooms_count']) {
            abort(422, 'The requested room tier has sold out for the selected dates.');
        }

        $nights = Carbon::parse($validated['check_in_date'])->diffInDays(Carbon::parse($validated['check_out_date']));
        $totalKobo = $roomType->base_price_kobo * $nights * $validated['rooms_count'];
        $commissionRate = 12.50; // 12.5% platform fee
        $commissionKobo = ($totalKobo * $commissionRate) / 100;
        $hostPayoutKobo = $totalKobo - $commissionKobo;

        return Booking::create([
            'booking_reference' => 'TAF-' . strtoupper(Str::random(8)),
            'user_id' => auth()->id(),
            'property_id' => $roomType->property_id,
            'room_type_id' => $roomType->id,
            'rooms_count' => $validated['rooms_count'],
            'check_in_date' => $validated['check_in_date'],
            'check_out_date' => $validated['check_out_date'],
            'total_nights' => $nights,
            'total_amount_kobo' => $totalKobo,
            'commission_rate' => $commissionRate,
            'platform_commission_kobo' => $commissionKobo,
            'host_payout_kobo' => $hostPayoutKobo,
            'booking_status' => 'pending',
            'hold_expires_at' => now()->addMinutes(15),
        ]);
    });
}

```

* **Response Payload (`201 Created` - Monnify Rail Example):**

```json
{
  "status": "success",
  "data": {
    "booking_reference": "TAF-89X2LK0A",
    "total_amount_formatted": "₦105,000.00",
    "hold_expires_at": "2026-10-25T14:45:00Z",
    "payment_details": {
      "gateway": "monnify",
      "payment_mode": "bank_transfer",
      "account_number": "8930219401",
      "bank_name": "Wema Bank / Moniepoint",
      "account_name": "Tafiya Escrow / Musa Danjuma",
      "instructions": "Transfer exact amount to the virtual account before expiration."
    }
  }
}

```

---

### 5.3 Webhook Ingestion Engine

#### `POST /api/v1/payments/webhooks/paystack`

* Validates `X-Paystack-Signature` against `env('PAYSTACK_SECRET_KEY')`.
* On event `charge.success`: Locates booking by reference, updates status to `confirmed`, clears `hold_expires_at`, and dispatches SMS/Email notifications to both Host and Guest.

#### `POST /api/v1/payments/webhooks/monnify`

* Validates `monnify-signature` against calculated SHA512 hash using `env('MONNIFY_SECRET_KEY')`.
* On event `SUCCESSFUL_TRANSACTION`: Confirms reservation, marks payment transaction as `successful`, logs virtual account details, and dispatches booking vouchers.

---

## 6. Property Verification Protocol (Anti-Fraud Engine)

To resolve the trust deficit in regional accommodations, listings progress through strict verification gates:

| Stage | Requirements | Authorizing Role | Platform Badge |
| --- | --- | --- | --- |
| **Tier 0: Unverified**<br> | Initial self-registration, phone number verification, and profile draft.

 | System | None (Hidden from public search)

 |
| **Tier 1: Document Verified**<br> | CAC Business Registration document uploaded, Tax Identification (TIN) provided, Owner/GM National ID (NIN) verified.

 | Super Admin

 | `Docs Verified` (Gray Tag) |
| **Tier 2: Location Verified**<br> | Tafiya Field Agent conducts physical on-site audit; logs device GPS coordinates within 50m of property address; verifies 24/7 power backup and water availability.

 | Field Agent / Admin

 | `Location Verified` (Blue Tag)

 |
| **Tier 3: Tafiya Verified**<br> | Passed Tiers 1 & 2, banking settlement details connected, minimum 3 high-resolution verified facade/room photos captured by agent.

 | Super Admin

 | **Verified Property** (Green Badge)

 |

---

## 7. Definition of Done & Handover Acceptance Matrix

The engineering team must confirm the following specifications pass before platform sign-off:

* **Concurrency Stress Testing:** 20 concurrent booking requests targeting 1 remaining room unit must result in exactly 1 confirmed transaction and 19 HTTP 422 "Sold Out" errors without deadlocks.
* **Webhook Reliability:** Server returns an HTTP `200 OK` to Paystack and Monnify within 2.5 seconds, delegating SMS dispatch and voucher generation to background Redis queues.
* **Zero Blade-API Drift:** The Blade web interface uses standard JSON payloads matching the output schemas consumed by future Flutter API integrations.
* **Image Compression Optimization:** Uploaded property imagery automatically downsizes and converts to `.webp` with responsive formats (400px thumbnail, 800px preview, 1600px full view), keeping page payload weights below 1.2MB on 3G connections.