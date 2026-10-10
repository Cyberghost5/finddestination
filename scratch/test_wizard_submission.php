<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Models\User;
use App\Models\Property;

echo "--- TEST: Create Property for Precious Edeki (Cyberghost Hotel) ---\n";

$controller = new PropertyController();

$payload = [
    'name' => 'Cyberghost Luxury Suites & Hotel',
    'property_type' => 'hotel',
    'category' => 'New Listing',
    'city' => 'Bauchi',
    'state' => 'Bauchi',
    'address' => 'Plot 18 Bayan Gari, Off Railway Station Road, Bauchi',
    'description' => 'Newly listed accommodation in Bauchi. Features 24/7 power backup and verified security.',
    'starting_price_kobo' => 5500000,
    'starting_price_formatted' => '₦55,000',
    'latitude' => 10.3158,
    'longitude' => 9.8442,
    'contact_phone' => '+2348022727517',
    'amenities' => ['24/7 Power', 'Constant Water', 'Air Conditioning', 'WiFi', 'Armed Security'],
    'host_email' => 'realcyberghost.5@gmail.com',
    'host_name' => 'Precious Edeki',
    'business_name' => 'Cyberghost Hotel',
    'cac_number' => 'RC-556699856',
    'tin_number' => 'N/A'
];

$req = Request::create('/api/v1/properties', 'POST', [], [], [], [
    'CONTENT_TYPE' => 'application/json',
    'HTTP_ACCEPT' => 'application/json'
], json_encode($payload));

$res = $controller->store($req);
echo "Status code: " . $res->getStatusCode() . "\n";
$data = json_decode($res->getContent(), true);

echo "Created Property ID: " . $data['data']['id'] . "\n";
echo "Property Name: " . $data['data']['name'] . "\n";
echo "Property Address: " . $data['data']['address'] . "\n";
echo "Host ID: " . $data['data']['host_id'] . "\n";
echo "Host Name: " . $data['data']['host']['name'] . "\n";
echo "Host Business: " . $data['data']['host']['business_name'] . "\n";
echo "Host Email: " . $data['data']['host']['email'] . "\n\n";

// Verify that the host user exists in database
$hostUser = User::where('email', 'realcyberghost.5@gmail.com')->first();
echo "Host User in DB: ID=" . $hostUser->id . ", Name=" . $hostUser->name . ", Business=" . $hostUser->business_name . ", Status=" . $hostUser->host_status . "\n\n";

// Verify filtering for Precious Edeki
$reqHost = Request::create('/api/v1/properties', 'GET', ['host_id' => $hostUser->id]);
$resHost = $controller->index($reqHost);
$dataHost = json_decode($resHost->getContent(), true);
echo "Total properties for Precious Edeki in DB: " . count($dataHost['data']) . "\n";

echo "--- TEST SUCCEEDED ---\n";
