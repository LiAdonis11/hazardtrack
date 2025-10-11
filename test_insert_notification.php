<?php
include 'api/db.php';

$user_id = 1; // Replace with the actual user_id from the response
$title = "Test Notification";
$body = "This is a test notification.";

$stmt = $conn->prepare("INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $user_id, $title, $body);

if ($stmt->execute()) {
    echo "Notification inserted successfully.";
} else {
    echo "Failed to insert notification.";
}

$stmt->close();
$conn->close();
?>
