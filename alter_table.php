<?php
include 'api/db.php';
$conn->query('ALTER TABLE status_history MODIFY changed_by INT NULL');
echo 'Altered table';
$conn->close();
?>
