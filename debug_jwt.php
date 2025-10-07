<?php
require_once 'api/jwt_helper.php';

// Test token from login
$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Njc4ODkwNiwiZXhwIjoxNzU2ODc1MzA2fQ.0cr9DesHekssLmL6cnHVSLYI1hE0Dvjt44pykPl1BcbY';

echo "Testing JWT validation...\n";
echo "Token: " . $token . "\n\n";

// Let's debug the token parts step by step
$tokenParts = explode('.', $token);
echo "Token parts count: " . count($tokenParts) . "\n";

if (count($tokenParts) !== 3) {
    echo "❌ Token doesn't have 3 parts\n";
    exit;
}

echo "Part 0 (Header): " . $tokenParts[0] . "\n";
echo "Part 1 (Payload): " . $tokenParts[1] . "\n";
echo "Part 2 (Signature): " . $tokenParts[2] . "\n\n";

// Test base64UrlDecode function
echo "Testing base64UrlDecode...\n";
$headerDecoded = base64UrlDecode($tokenParts[0]);
$payloadDecoded = base64UrlDecode($tokenParts[1]);

echo "Raw header decoded: '" . $headerDecoded . "'\n";
echo "Raw payload decoded: '" . $payloadDecoded . "'\n\n";

// Test if it's valid JSON
$headerJson = json_decode($headerDecoded, true);
$payloadJson = json_decode($payloadDecoded, true);

echo "Header JSON valid: " . ($headerJson !== null ? "Yes" : "No") . "\n";
echo "Payload JSON valid: " . ($payloadJson !== null ? "Yes" : "No") . "\n\n";

if ($headerJson) {
    echo "Header: " . json_encode($headerJson, JSON_PRETTY_PRINT) . "\n";
}
if ($payloadJson) {
    echo "Payload: " . json_encode($payloadJson, JSON_PRETTY_PRINT) . "\n";
}

// Test signature verification
if ($headerJson && $payloadJson) {
    echo "\nTesting signature verification...\n";
    $expectedSignature = hash_hmac('sha256', $tokenParts[0] . "." . $tokenParts[1], JWT_SECRET, true);
    $expectedSignatureEncoded = base64UrlEncode($expectedSignature);

    echo "Expected signature: " . $expectedSignatureEncoded . "\n";
    echo "Provided signature: " . $tokenParts[2] . "\n";
    echo "Signatures match: " . ($expectedSignatureEncoded === $tokenParts[2] ? "Yes" : "No") . "\n";

    // Test with proper encoding
    $headerEncoded = base64UrlEncode($headerDecoded);
    $payloadEncoded = base64UrlEncode($payloadDecoded);
    $signature2 = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET, true);
    $signature2Encoded = base64UrlEncode($signature2);

    echo "Expected signature (re-encoded): " . $signature2Encoded . "\n";
    echo "Signatures match (re-encoded): " . ($signature2Encoded === $tokenParts[2] ? "Yes" : "No") . "\n";
}

echo "\nRunning full validation...\n";
$userData = validateJWT($token);

if ($userData) {
    echo "✅ Token is valid!\n";
    echo "User Data: " . json_encode($userData, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "❌ Token is invalid or expired\n";
}
?>
