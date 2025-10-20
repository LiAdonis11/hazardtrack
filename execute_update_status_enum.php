<?php
include 'api/db.php';

$sql = "ALTER TABLE hazard_reports MODIFY status ENUM('pending','in_progress','verified','resolved','rejected','closed') DEFAULT 'pending'";

if ($conn->query($sql) === TRUE) {
    echo "Status enum updated successfully";
} else {
    echo "Error updating enum: " . $conn->error;
}

$conn->close();
?>
