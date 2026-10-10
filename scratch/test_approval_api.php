<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\AuthController;

echo "--- START TEST ---\n";

$host = User::where('role', 'host')->first();
if (!$host) {
    echo "No host found\n";
    exit(1);
}

echo "Testing with Host ID: {$host->id} ({$host->name}, current status: {$host->host_status})\n";

$controller = new AuthController();

// Test 1: Only host_status: 'approved'
$req1 = Request::create("/api/v1/admin/hosts/{$host->id}/approval", 'PATCH', [], [], [], [
    'CONTENT_TYPE' => 'application/json',
    'HTTP_ACCEPT' => 'application/json'
], json_encode(['host_status' => 'approved']));

$res1 = $controller->updateHostApproval($req1, $host->id);
echo "Test 1 (legacy payload host_status=approved): status code " . $res1->getStatusCode() . "\n";
echo "Response: " . $res1->getContent() . "\n\n";

// Test 2: Only host_status: 'rejected'
$req2 = Request::create("/api/v1/admin/hosts/{$host->id}/approval", 'PATCH', [], [], [], [
    'CONTENT_TYPE' => 'application/json',
    'HTTP_ACCEPT' => 'application/json'
], json_encode(['host_status' => 'rejected', 'rejection_reason' => 'Test rejection remarks']));

$res2 = $controller->updateHostApproval($req2, $host->id);
echo "Test 2 (legacy payload host_status=rejected): status code " . $res2->getStatusCode() . "\n";
echo "Response: " . $res2->getContent() . "\n\n";

// Test 3: New payload action: 'approve'
$req3 = Request::create("/api/v1/admin/hosts/{$host->id}/approval", 'PATCH', [], [], [], [
    'CONTENT_TYPE' => 'application/json',
    'HTTP_ACCEPT' => 'application/json'
], json_encode(['action' => 'approve']));

$res3 = $controller->updateHostApproval($req3, $host->id);
echo "Test 3 (new payload action=approve): status code " . $res3->getStatusCode() . "\n";
echo "Response: " . $res3->getContent() . "\n\n";

echo "--- TEST COMPLETE ---\n";
