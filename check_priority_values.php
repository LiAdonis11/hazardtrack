<?php
include 'api/db.php';

$result = $conn->query('SELECT DISTINCT priority FROM hazard_reports WHERE priority IS NOT NULL AND priority != ""');

echo "Distinct priority values in database:\n";
echo "===================================\n";

while ($row = $result->fetch_assoc()) {
    echo "- " . $row['priority'] . "\n";
}

$conn->close();
?>
