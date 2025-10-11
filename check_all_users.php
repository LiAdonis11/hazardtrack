<?php
include 'api/db.php';

$result = $conn->query("SELECT id, fullname, email, role FROM users ORDER BY id DESC LIMIT 20");

if ($result->num_rows > 0) {
    echo "Users:\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: {$row['id']}, Name: {$row['fullname']}, Email: {$row['email']}, Role: {$row['role']}\n";
    }
} else {
    echo "No users found.\n";
}
?>
