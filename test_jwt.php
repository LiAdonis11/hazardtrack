<?php
include 'api/jwt_helper.php';

// Test JWT generation and validation
echo "Testing JWT generation and validation...\n";

// Generate a test token
$test_user_id = 7;
$test_email = "test1@gmail.com";
$test_role = "resident";

$token = generateJWT($test_user_id, $test_email, $test_role);
echo "Generated token: $token\n\n";

// Validate the token
$payload = validateJWT($token);
if ($payload) {
    echo "Token validation successful!\n";
    echo "Payload: " . json_encode($payload, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Token validation failed!\n";
}

// Test with the actual token from the app
$actual_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo3LCJlbWFpbCI6InRlc3QxQGdtYWlsLmNvbSIsInJvbGUiOiJyZXNpZGVudCIsImlhdCI6MTc1NjQ0NTUyMSwiZXhwIjoxNzU2NTMxOTIxfQ.7AtXE1jROgSnCpkoxSgOg9IvlV_cbysB_RWTvUkHELE";
echo "\nTesting with actual token from app...\n";
echo "Token: $actual_token\n";

$actual_payload = validateJWT($actual_token);
if ($actual_payload) {
    echo "Actual token validation successful!\n";
    echo "Payload: " . json_encode($actual_payload, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Actual token validation failed!\n";
}

// Test with invalid token
echo "\nTesting with invalid token...\n";
$invalid_token = "invalid.token.here";
$invalid_payload = validateJWT($invalid_token);
if ($invalid_payload) {
    echo "Invalid token validation unexpectedly succeeded!\n";
} else {
    echo "Invalid token correctly rejected.\n";
}
?>
