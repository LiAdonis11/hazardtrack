<?php
// Test script for export_reports.php API
require_once 'api/jwt_helper.php';
require_once 'api/db.php';

// Generate a test admin token for testing
$user_id = 1;
$email = 'admin@test.com';
$role = 'admin';

$token = generateJWT($user_id, $email, $role);
echo "Test Token: " . $token . "\n\n";

// Test GET request (preview)
echo "Testing GET request (preview):\n";
echo "curl -H \"Authorization: Bearer $token\" \"http://localhost/hazardTrackV2/api/export_reports.php?limit=5\"\n\n";

// Test POST request (export)
echo "Testing POST request (export):\n";
echo "curl -X POST -H \"Content-Type: application/json\" -H \"Authorization: Bearer $token\" -d '{\"format\":\"csv\",\"filters\":{\"status\":\"all\"}}' \"http://localhost/hazardTrackV2/api/export_reports.php\"\n\n";

echo "You can copy and run these curl commands in your terminal to test the export functionality.\n";
?>
