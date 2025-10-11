<?php
include 'api/db.php';

$sql1 = "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL";
$sql2 = "ALTER TABLE users ADD COLUMN reset_expires DATETIME NULL";

try {
    $conn->query($sql1);
    echo "Added reset_token column.\n";
} catch (Exception $e) {
    echo "Error adding reset_token: " . $e->getMessage() . "\n";
}

try {
    $conn->query($sql2);
    echo "Added reset_expires column.\n";
} catch (Exception $e) {
    echo "Error adding reset_expires: " . $e->getMessage() . "\n";
}

echo "Done.";
?>
