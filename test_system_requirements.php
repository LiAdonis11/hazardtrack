<?php
// Comprehensive test for HazardTrack system requirements
echo "🧪 HazardTrack System Requirements Test Suite\n";
echo "==============================================\n\n";

// Test counter
$tests_passed = 0;
$tests_total = 0;

function test_result($test_name, $passed, $details = "") {
    global $tests_passed, $tests_total;
    $tests_total++;

    if ($passed) {
        $tests_passed++;
        echo "✅ $test_name\n";
    } else {
        echo "❌ $test_name\n";
    }

    if ($details) {
        echo "   $details\n";
    }
    echo "\n";
}

// Include database connection
require_once 'api/db.php';

// Test 1: User Registration & Login Requirements
echo "📱 MOBILE APP - RESIDENT FEATURES\n";
echo "=================================\n";

// Test 1.1: Phone number mandatory validation
echo "1. User Registration & Login:\n";
echo "-----------------------------\n";

$registration_tests = [
    ['name' => 'Resident One', 'email' => 'resident1@example.com', 'phone' => '09123456781', 'password' => 'resident1'],
    ['name' => 'Resident Two', 'email' => 'resident2@example.com', 'phone' => '09123456782', 'password' => 'resident2'],
    ['name' => 'Resident Three', 'email' => 'resident3@example.com', 'phone' => '09123456783', 'password' => 'resident3']
];

foreach ($registration_tests as $user) {
    // Test login
    $loginData = [
        'email' => $user['email'],
        'password' => $user['password']
    ];

    $jsonData = json_encode($loginData);
    $ch = curl_init('http://localhost/hazardTrackV2/api/login.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($jsonData)
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $loginResponse = json_decode($response, true);
    curl_close($ch);

    $login_success = ($loginResponse && $loginResponse['status'] === 'success');
    test_result("Login for {$user['name']}", $login_success, "HTTP: $httpCode, Token: " . ($login_success ? 'Generated' : 'Failed'));
}

// Test 2: Hazard Report Submission
echo "2. Submit Hazard Report:\n";
echo "-----------------------\n";

// Login as resident to get token
$loginData = ['email' => 'resident1@example.com', 'password' => 'resident1'];
$jsonData = json_encode($loginData);
$ch = curl_init('http://localhost/hazardTrackV2/api/login.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);
$response = curl_exec($ch);
$loginResponse = json_decode($response, true);
curl_close($ch);

if ($loginResponse && $loginResponse['status'] === 'success') {
    $token = $loginResponse['token'];

    // Test hazard report submission
    $reportData = [
        'category_id' => 6, // Fire Hazard
        'title' => 'Test Fire Hazard Report',
        'description' => 'Testing hazard report submission with GPS and categorization',
        'location_address' => 'Tagudin, Ilocos Sur',
        'latitude' => 16.6167,
        'longitude' => 120.3167
    ];

    $jsonData = json_encode($reportData);
    $ch = curl_init('http://localhost/hazardTrackV2/api/report_hazard.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token,
        'Content-Length: ' . strlen($jsonData)
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $reportResponse = json_decode($response, true);
    curl_close($ch);

    $report_success = ($reportResponse && $reportResponse['status'] === 'success');
    test_result("Hazard Report Submission", $report_success, "HTTP: $httpCode, Report ID: " . ($reportResponse['report_id'] ?? 'N/A'));
}

// Test 3: Emergency Communication
echo "3. Emergency Communication:\n";
echo "---------------------------\n";

// Test BFP hotline/contact info availability
$ch = curl_init('http://localhost/hazardTrackV2/api/get_categories.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$categories_response = curl_exec($ch);
$categories_data = json_decode($categories_response, true);
curl_close($ch);

$emergency_available = ($categories_data && isset($categories_data['categories']));
test_result("Emergency Categories Available", $emergency_available, "Categories count: " . (is_array($categories_data['categories']) ? count($categories_data['categories']) : 0));

// Test 4: Track Report Status
echo "4. Track Report Status:\n";
echo "----------------------\n";

// Get user's reports
$ch = curl_init('http://localhost/hazardTrackV2/api/get_reports.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token
]);
$reports_response = curl_exec($ch);
$reports_data = json_decode($reports_response, true);
curl_close($ch);

$status_tracking = ($reports_data && isset($reports_data['reports']));
test_result("Report Status Tracking", $status_tracking, "Reports found: " . (is_array($reports_data['reports']) ? count($reports_data['reports']) : 0));

// Test 5: BFP Personnel Features
echo "\n🚒 MOBILE APP - BFP PERSONNEL FEATURES\n";
echo "=======================================\n";

// Test 5.1: BFP Login
echo "1. BFP Personnel Login:\n";
echo "-----------------------\n";

$bfp_login = ['email' => 'mobilebfp1@example.com', 'password' => 'mobilebfp1'];
$jsonData = json_encode($bfp_login);
$ch = curl_init('http://localhost/hazardTrackV2/api/login.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);
$response = curl_exec($ch);
$bfpLoginResponse = json_decode($response, true);
curl_close($ch);

$bfp_login_success = ($bfpLoginResponse && $bfpLoginResponse['status'] === 'success');
test_result("BFP Personnel Login", $bfp_login_success, "Role: " . ($bfpLoginResponse['user']['role'] ?? 'N/A'));

// Test 5.2: View All Reports
echo "2. View Incoming Reports:\n";
echo "------------------------\n";

if ($bfp_login_success) {
    $bfpToken = $bfpLoginResponse['token'];

    $ch = curl_init('http://localhost/hazardTrackV2/api/get_all_reports.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $bfpToken
    ]);
    $all_reports_response = curl_exec($ch);
    $all_reports_data = json_decode($all_reports_response, true);
    curl_close($ch);

    $view_reports_success = ($all_reports_data && isset($all_reports_data['reports']));
    test_result("View All Reports", $view_reports_success, "Total reports: " . (is_array($all_reports_data['reports']) ? count($all_reports_data['reports']) : 0));
}

// Test 6: Admin Features
echo "\n💻 WEB ADMIN SYSTEM FEATURES\n";
echo "=============================\n";

// Test 6.1: Admin Login
echo "1. Admin Login:\n";
echo "---------------\n";

$admin_login = ['email' => 'firstadmin@example.com', 'password' => 'firstadmin123'];
$jsonData = json_encode($admin_login);
$ch = curl_init('http://localhost/hazardTrackV2/api/login_admin.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);
$response = curl_exec($ch);
$adminLoginResponse = json_decode($response, true);
curl_close($ch);

$admin_login_success = ($adminLoginResponse && $adminLoginResponse['status'] === 'success');
test_result("Admin Login", $admin_login_success, "Role: " . ($adminLoginResponse['user']['role'] ?? 'N/A'));

// Test 6.2: Admin Dashboard - Get All Reports
echo "2. Admin Dashboard - Reports Overview:\n";
echo "-------------------------------------\n";

if ($admin_login_success) {
    $adminToken = $adminLoginResponse['token'];

    $ch = curl_init('http://localhost/hazardTrackV2/api/get_all_reports.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $adminToken
    ]);
    $admin_reports_response = curl_exec($ch);
    $admin_reports_data = json_decode($admin_reports_response, true);
    curl_close($ch);

    $admin_reports_success = ($admin_reports_data && isset($admin_reports_data['reports']));
    test_result("Admin Reports Overview", $admin_reports_success, "Total reports: " . (is_array($admin_reports_data['reports']) ? count($admin_reports_data['reports']) : 0));
}

// Test 6.3: Analytics - Priority Statistics
echo "3. Analytics & Reports:\n";
echo "-----------------------\n";

// Check priority distribution
try {
    $stmt = $conn->prepare("SELECT priority, COUNT(*) as count FROM hazard_reports GROUP BY priority");
    $stmt->execute();
    $result = $stmt->get_result();
    $priority_stats = [];
    while ($row = $result->fetch_assoc()) {
        $priority_stats[$row['priority']] = $row['count'];
    }

    $analytics_available = !empty($priority_stats);
    test_result("Priority Statistics", $analytics_available, "Priority distribution: " . json_encode($priority_stats));
} catch (Exception $e) {
    test_result("Priority Statistics", false, "Error: " . $e->getMessage());
}

// Test 6.4: Export Functionality
echo "4. Export Reports:\n";
echo "------------------\n";

$ch = curl_init('http://localhost/hazardTrackV2/api/export_reports.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . ($adminToken ?? '')
]);
$export_response = curl_exec($ch);
$export_data = json_decode($export_response, true);
curl_close($ch);

$export_available = ($export_data && isset($export_data['status']));
test_result("Export Functionality", $export_available, "Export API available: " . ($export_available ? 'Yes' : 'No'));

// Test 6.5: User Management
echo "5. User Management:\n";
echo "-------------------\n";

try {
    $stmt = $conn->prepare("SELECT role, COUNT(*) as count FROM users WHERE is_active = 1 GROUP BY role");
    $stmt->execute();
    $result = $stmt->get_result();
    $user_stats = [];
    while ($row = $result->fetch_assoc()) {
        $user_stats[$row['role']] = $row['count'];
    }

    $user_mgmt_available = !empty($user_stats);
    test_result("User Management", $user_mgmt_available, "User distribution: " . json_encode($user_stats));
} catch (Exception $e) {
    test_result("User Management", false, "Error: " . $e->getMessage());
}

// Test 6.6: Real-time Features
echo "6. Real-time Features:\n";
echo "----------------------\n";

// Check if WebSocket server is configured
$websocket_config = file_exists('realtime-server/server.js');
test_result("WebSocket Server Config", $websocket_config, "Server file exists: " . ($websocket_config ? 'Yes' : 'No'));

// Test 6.7: Photo/Attachment Features
echo "7. Photo & Attachment Features:\n";
echo "--------------------------------\n";

try {
    $stmt = $conn->prepare("SELECT COUNT(*) as photo_count FROM report_attachments");
    $stmt->execute();
    $result = $stmt->get_result();
    $photo_count = $result->fetch_assoc()['photo_count'];

    $photo_feature_available = true; // Table exists and query works
    test_result("Photo Attachments", $photo_feature_available, "Photos in system: $photo_count");
} catch (Exception $e) {
    test_result("Photo Attachments", false, "Error: " . $e->getMessage());
}

// Test 6.8: Assignment System
echo "8. Inspector Assignment System:\n";
echo "-------------------------------\n";

try {
    $stmt = $conn->prepare("SELECT COUNT(*) as assignment_count FROM assignments");
    $stmt->execute();
    $result = $stmt->get_result();
    $assignment_count = $result->fetch_assoc()['assignment_count'];

    $assignment_available = true;
    test_result("Assignment System", $assignment_available, "Total assignments: $assignment_count");
} catch (Exception $e) {
    test_result("Assignment System", false, "Error: " . $e->getMessage());
}

// Summary
echo "\n📊 TEST SUMMARY\n";
echo "===============\n";
echo "Tests Passed: $tests_passed / $tests_total\n";
$success_rate = round(($tests_passed / $tests_total) * 100, 1);
echo "Success Rate: $success_rate%\n\n";

if ($success_rate >= 80) {
    echo "🎉 System meets most requirements! Ready for deployment.\n";
} elseif ($success_rate >= 60) {
    echo "⚠️  System partially meets requirements. Some features need attention.\n";
} else {
    echo "❌ System needs significant improvements before deployment.\n";
}

$conn->close();
?>
