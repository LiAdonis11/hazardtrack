<?php
include 'api/db.php';

$result = $conn->query("SELECT id, fullname, email, role, is_active FROM users WHERE role IN ('admin', 'inspector')");

if ($result->num_rows > 0) {
    echo "Admin and Inspector users:\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: {$row['id']}, Name: {$row['fullname']}, Email: {$row['email']}, Role: {$row['role']}, Active: {$row['is_active']}\n";
    }
} else {
    echo "No admin or inspector users found.\n";
}
?>
