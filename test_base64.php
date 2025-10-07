<?php
require_once 'api/jwt_helper.php';

// Test base64UrlEncode and base64UrlDecode functions
echo "Testing base64UrlEncode and base64UrlDecode functions...\n\n";

// Test string
$testString = '{"typ":"JWT","alg":"HS256"}';
echo "Original string: " . $testString . "\n";

// Encode
$encoded = base64UrlEncode($testString);
echo "Encoded: " . $encoded . "\n";

// Decode
$decoded = base64UrlDecode($encoded);
echo "Decoded: " . $decoded . "\n";

// Check if round-trip works
$matches = ($testString === $decoded) ? "Yes" : "No";
echo "Round-trip successful: " . $matches . "\n\n";

// Test with the actual header from the token
$actualHeader = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9";
echo "Actual header from token: " . $actualHeader . "\n";
$decodedHeader = base64UrlDecode($actualHeader);
echo "Decoded header: " . $decodedHeader . "\n";

// Test signature calculation
$headerPart = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9";
$payloadPart = "eyJ1c2VyX2lkIjoxMSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Njc4ODkwNiwiZXhwIjoxNzU2ODc1MzA2fQ";
$expectedSignature = "0cr9DesHekssLmL6cnHVSLYI1hE0Dvjt44pykPl1BcbY";

echo "\nTesting signature calculation...\n";
echo "Header part: " . $headerPart . "\n";
echo "Payload part: " . $payloadPart . "\n";
echo "Expected signature: " . $expectedSignature . "\n";

// Calculate signature
$calculatedSignature = hash_hmac('sha256', $headerPart . "." . $payloadPart, JWT_SECRET, true);
$calculatedSignatureEncoded = base64UrlEncode($calculatedSignature);

echo "Calculated signature: " . $calculatedSignatureEncoded . "\n";
echo "Signatures match: " . ($calculatedSignatureEncoded === $expectedSignature ? "Yes" : "No") . "\n";

// Let's also check the raw signature bytes
echo "\nRaw signature bytes (hex): " . bin2hex($calculatedSignature) . "\n";

// Test with different padding
$testSig = "test";
$encodedTest = base64UrlEncode($testSig);
echo "\nTest encoding 'test': " . $encodedTest . "\n";
$decodedTest = base64UrlDecode($encodedTest);
echo "Decoded: " . $decodedTest . "\n";
?>
