<?php
// Test script to debug the API issue
echo "=== API Debug Test ===\n\n";

// Test 1: Check if we can connect to MySQL from PHP
echo "1. Testing MySQL connection from PHP...\n";
try {
    $conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
    if ($conn->connect_error) {
        echo "❌ MySQL connection failed: " . $conn->connect_error . "\n";
    } else {
        echo "✅ MySQL connection successful\n";

        // Test query
        $result = $conn->query("SELECT COUNT(*) as count FROM hazard_reports");
        if ($result) {
            $row = $result->fetch_assoc();
            echo "✅ Query successful. Found " . $row['count'] . " reports\n";
        } else {
            echo "❌ Query failed: " . $conn->error . "\n";
        }

        $conn->close();
    }
} catch (Exception $e) {
    echo "❌ Exception during MySQL connection: " . $e->getMessage() . "\n";
}

// Test 2: Check JWT helper
echo "\n2. Testing JWT helper...\n";
require_once 'api/jwt_helper.php';

$testToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo0LCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2xlIjoicmVzaWRlbnQiLCJpYXQiOjE3NTY4ODYzMTYsImV4cCI6MTc1Njk3MjcxNn0.09aB7RnuQRsk7ONYgs1eCMgyfDl5qqjvO0SG8fiWy3A';
$user = validateJWT($testToken);

if ($user) {
    echo "✅ JWT validation successful\n";
    echo "User ID: " . $user['user_id'] . "\n";
    echo "Email: " . $user['email'] . "\n";
    echo "Role: " . $user['role'] . "\n";
} else {
    echo "❌ JWT validation failed\n";
}

// Test 3: Check if report exists
echo "\n3. Testing report lookup...\n";
if ($user) {
    try {
        $conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
        if (!$conn->connect_error) {
            $stmt = $conn->prepare("SELECT id FROM hazard_reports WHERE id = ? AND user_id = ?");
            $reportId = 95;
            $userId = $user['user_id'];
            $stmt->bind_param("ii", $reportId, $userId);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                echo "✅ Report 95 found for user " . $user['user_id'] . "\n";
            } else {
                echo "❌ Report 95 not found or access denied for user " . $user['user_id'] . "\n";

                // Check if report exists at all
                $stmt2 = $conn->prepare("SELECT id, user_id FROM hazard_reports WHERE id = ?");
                $stmt2->bind_param("i", $reportId);
                $stmt2->execute();
                $result2 = $stmt2->get_result();

                if ($result2->num_rows > 0) {
                    $row = $result2->fetch_assoc();
                    echo "Report exists but belongs to user " . $row['user_id'] . "\n";
                } else {
                    echo "Report does not exist in database\n";
                }
                $stmt2->close();
            }
            $stmt->close();
            $conn->close();
        }
    } catch (Exception $e) {
        echo "❌ Exception during report lookup: " . $e->getMessage() . "\n";
    }
}

echo "\n=== Debug Test Complete ===\n";
?>
