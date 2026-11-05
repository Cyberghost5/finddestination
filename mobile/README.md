# FindDestination Mobile App (Flutter)

A cross-platform mobile client for **FindDestination** — Nigeria's digital verified stays and short-let accommodation marketplace.

Built with Flutter 3.x / Dart 3.x, designed to match 100% of the web platform's capabilities across **Guest**, **Host**, **Field Verification Agent**, and **Super Admin** personas.

---

## 📱 Core Features & Capabilities

### 1. Multi-Role Architecture & Testing Persona Switcher
- Instant persona switching across **Guest**, **Host**, **Field Agent**, and **Super Admin** without logging out.
- Automatic routing to specialized dashboards based on active role.

### 2. Guest Traveler Discovery & Bookings
- **Stays Discovery:** City filters (Bauchi, Abuja, Lagos, Kaduna, Kano, Jos), stay types (Hotels, Serviced Apartments, Lodges), interactive price filter modal.
- **Verification Badges:** Tier 1 Docs Verified, Tier 2 Location Verified, Tier 3 Physical Certified.
- **Listing Details:** Full photo gallery, verified amenities checklist, room tiers, host credentials, and GPS coordinates.
- **Checkout & Dynamic Payments:**
  - DateRangePicker & room count counter with exact price calculations (tax, 12.5% platform escrow commission).
  - Paystack and Monnify checkout with dynamic virtual account generation, countdown timers, and copy-to-clipboard.
- **Order Tracker & Digital Boarding Pass Voucher:**
  - Real-time reservation status tracker via booking reference (e.g., `FD-XXXXXX`).
  - Boarding-pass stay voucher with verification QR code.
  - Native PDF download via `pdf` and `printing`.
  - Native system share sheet (`share_plus`) and email voucher dispatch.

### 3. Host Dashboard & Listing Wizard
- **Escrow Settlement Banner:** Cleared balance overview with one-tap NUBAN bank transfer withdrawal.
- **5-Step Listing Wizard:**
  1. Property Identity & Category
  2. Physical Location & Hardware GPS auto-detect via `Geolocator`
  3. Room Suites & Pricing
  4. Amenities checklist
  5. Trust & CAC verification (RC/BN number, NIN, TIN)
- **Bookings Manager:** Incoming reservations list with guest contact info and check-in dates.

### 4. Field Verification Agent Portal
- **Bounty Marketplace:** Browse properties opened for physical audit with bounty fee pills (e.g. `₦15,000 BOUNTY`) and 1-tap application.
- **On-Site Field Audit Execution:**
  - Hardware GPS satellite lock.
  - 6-Point Physical Standards Checklist (24/7 Power, Treated Water, Armed Security, Cleanliness, Perimeter, Room Count Accuracy).
  - Photographic evidence capture via camera & gallery with `image_picker`.
  - Video tour walkthrough link and inspector field notes.
- **Agent Wallet:** Cleared bounty rewards, settlement bank setup with Nigerian banks, and payout withdrawals.

### 5. Super Admin Governance Center
- **Executive Metrics:** Live Platform GMV, Net 12.5% Commission Revenue, pending approvals count.
- **CAC & Host Approvals:** Live QoreID CAC automated verification check and approve/reject controls.
- **Field Audit Verification:** Review submitted inspector reports with GPS fix, photos gallery, and 1-tap approval (promotes property to **Tier 3 Certified** and atomically credits the inspection bounty to the agent's wallet).
- **Disbursements Queue:** Review agent and host payout requests with destination NUBAN bank details and process disbursements.
- **Platform Financial Ledger:** Audit all booking payments across Paystack & Monnify with commission splits and search filter.

### 6. Real-Time Chat & Support Desk
- In-app threaded messaging between Guests and Hosts with pinned property context banner.
- 24/7 Escrow Care Desk help thread.
- Quick replies carousel, read receipts, and active 4-second auto-polling.

---

## 🛠️ Project Structure

```
mobile/lib/
├── core/
│   ├── constants/
│   │   ├── api_constants.dart      # Smart host URL resolution & endpoint definitions
│   │   └── app_colors.dart         # FindDestination brand design palette
│   ├── network/
│   │   ├── api_client.dart         # Dio HTTP client with bearer tokens & interceptors
│   │   └── api_exceptions.dart     # Graceful error handling
│   └── theme/
│       └── app_theme.dart          # Typography & Material3 theme configuration
├── features/
│   ├── admin/                      # Super Admin Portal, models, provider & modals
│   ├── agent/                      # Field Agent Portal, GPS audit form & wallet
│   ├── auth/                       # Multi-role authentication & session persistence
│   ├── bookings/                   # Checkout, virtual accounts, tracker & PDF vouchers
│   ├── chat/                       # Real-time inbox, conversation & support desk
│   ├── common/                     # Navigation shell, buttons, role badges
│   ├── host/                       # Host Dashboard, listing wizard & escrow payouts
│   ├── onboarding/                 # 4-step animated intro walkthrough
│   └── properties/                 # Stays discovery, search filters & details
└── main.dart                       # App entry point & provider tree
```

---

## 🚀 VPS Build & Release Instructions

When compiling on your VPS (Android & iOS):

### 1. Prerequisites on VPS
- Linux (Ubuntu 22.04+ recommended) or macOS (for iOS).
- Flutter SDK (3.22+): `flutter doctor`
- JDK 17 (for Android): `sudo apt install openjdk-17-jdk`
- Android SDK command-line tools.

### 2. Setup & Dependencies
```bash
cd mobile
flutter clean
flutter pub get
```

### 3. Verification & Tests
Verify that there are zero static analysis issues and all unit/widget tests pass:
```bash
flutter analyze
flutter test
```

### 4. Build Release Artifacts

#### A. Android APK (For direct install / testing)
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

#### B. Android App Bundle (For Google Play Store submission)
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

#### C. iOS IPA (Requires macOS VPS / Mac Mini)
```bash
flutter build ipa --release
```

---

## 🌐 Connecting to Backend API

By default, the app connects to:
- **Android Emulator:** `http://10.0.2.2:8000/api/v1`
- **iOS Simulator / Desktop:** `http://127.0.0.1:8000/api/v1`
- **Web:** `http://localhost:8000/api/v1`

To connect to your live production or staging server:
- Change the URL in chat or open **Account > API Base URL** dialog in the app, or
- Pass it in `lib/core/constants/api_constants.dart`:
```dart
ApiConstants.setCustomBaseUrl('https://api.yourdomain.com/api/v1');
```

---

## 🔒 Permissions Configured
- **Internet:** Network access for API, images, and payments.
- **Location (GPS):** `ACCESS_FINE_LOCATION` & `ACCESS_COARSE_LOCATION` for listing address locking and field audit verification.
- **Camera:** `CAMERA` for property photo audits and inspections.
- **Photo Library:** Storage access to select property and inspection photos.
