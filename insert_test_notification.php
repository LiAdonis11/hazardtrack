<?php
include 'api/db.php';

$user_id = 66; // Admin user ID
$title = "Test Notification for Admin";
$body = "This is a test notification to check if admin receives notifications.";

$stmt = $conn->prepare("INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $user_id, $title, $body);

if ($stmt->execute()) {
    echo "Test notification inserted for admin user.\n";
} else {
    echo "Failed to insert notification.\n";
}

$stmt->close();
$conn->close();
?>
