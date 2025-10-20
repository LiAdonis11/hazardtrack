<?php
require_once 'api/db.php';

echo "=== Checking Hazard Reports Coordinates ===\n\n";

$result = $conn->query('SELECT id, latitude, longitude, location_address FROM hazard_reports LIMIT 10');
if ($result->num_rows > 0) {
    echo "Reports with coordinates:\n";
    while ($row = $result->fetch_assoc()) {
        echo "- ID: {$row['id']}, Lat: '{$row['latitude']}', Lng: '{$row['longitude']}', Address: '{$row['location_address']}'\n";
    }
} else {
    echo "No reports found\n";
}

echo "\n=== Reports with non-null coordinates ===\n";
$result2 = $conn->query('SELECT COUNT(*) as count FROM hazard_reports WHERE latitude IS NOT NULL AND longitude IS NOT NULL');
$row2 = $result2->fetch_assoc();
echo "Count: {$row2['count']}\n";
?>
