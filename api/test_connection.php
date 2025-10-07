<?php
// Test basic MySQL connection without database
$servername = "localhost";
$port = 3306;
$username = "root";
$password = "";

echo "Testing basic MySQL connection...\n";
echo "Server: $servername:$port\n";

try {
    $conn = new mysqli($servername, $username, $password, '', $port);
    
    if ($conn->connect_error) {
        echo "Connection failed: " . $conn->connect_error . "\n";
    } else {
        echo "Basic connection successful!\n";
        
        // Show available databases
        $result = $conn->query("SHOW DATABASES");
        echo "Available databases:\n";
        while ($row = $result->fetch_assoc()) {
            echo "- " . $row['Database'] . "\n";
        }
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>
