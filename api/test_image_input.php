<?php
include 'jwt_helper.php';

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input data
$raw_input = file_get_contents('php://input');
error_log("TEST: Raw input: " . $raw_input);

$input_data = json_decode($raw_input, true);
error_log("TEST: Decoded input data: " . json_encode($input_data));

if (isset($input_data['image'])) {
    error_log("TEST: Image field present, length: " . strlen($input_data['image']));
    error_log("TEST: Image starts with: " . substr($input_data['image'], 0, 50));

    // Try to decode
    if (strpos($input_data['image'], 'data:image') === 0) {
        $parts = explode(',', $input_data['image']);
        if (count($parts) === 2) {
            $decoded = base64_decode($parts[1]);
            error_log("TEST: Decoded data URL, length: " . strlen($decoded));
        } else {
            error_log("TEST: Invalid data URL format");
        }
    } else {
        $decoded = base64_decode($input_data['image']);
        error_log("TEST: Decoded raw base64, length: " . strlen($decoded));
    }
} else {
    error_log("TEST: No image field in input data");
}

echo json_encode(['status' => 'success', 'message' => 'Test completed, check error log']);
?>
