<?php
include 'api/db.php';

$result = $conn->query('DESCRIBE hazard_reports');
echo "hazard_reports table structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "  {$row['Field']}: {$row['Type']} {$row['Null']} {$row['Key']} {$row['Default']} {$row['Extra']}\n";
}

// Check for unique constraints
$result = $conn->query("SHOW INDEX FROM hazard_reports WHERE Non_unique = 0");
echo "\nUnique indexes:\n";
while ($row = $result->fetch_assoc()) {
    echo "  {$row['Key_name']}: {$row['Column_name']}\n";
}

// Check recent reports
$result = $conn->query("SELECT report_number FROM hazard_reports ORDER BY id DESC LIMIT 5");
echo "\nRecent report numbers:\n";
while ($row = $result->fetch_assoc()) {
    echo "  {$row['report_number']}\n";
}
?>
