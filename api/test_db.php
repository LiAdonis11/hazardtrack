<?php
// Test database connection
$servername = "localhost";
$port = 3306;
$username = "root";
$password = "";
$database = "hazardtrack_dbv2";

echo "Testing database connection...\n";
echo "Server: $servername:$port\n";
echo "Database: $database\n";

try {
    $conn = new mysqli($servername, $username, $password, $database, $port);
    
    if ($conn->connect_error) {
        echo "Connection failed: " . $conn->connect_error . "\n";
    } else {
        echo "Connection successful!\n";
        
        // Check if database exists
        $result = $conn->query("SHOW DATABASES LIKE '$database'");
        if ($result->num_rows > 0) {
            echo "Database '$database' exists\n";
            
            // Check if users table exists
            $conn->select_db($database);
            $result = $conn->query("SHOW TABLES LIKE 'users'");
            if ($result->num_rows > 0) {
                echo "Users table exists\n";
                
                // Check if there are any admin users
                $result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
                $row = $result->fetch_assoc();
                echo "Admin users: " . $row['count'] . "\n";
            } else {
                echo "Users table does not exist\n";
            }
        } else {
            echo "Database '$database' does not exist\n";
        }
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>
