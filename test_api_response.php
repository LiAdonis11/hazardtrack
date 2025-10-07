<?php
// Test script to check what data is returned by get_reports.php
include 'api/db.php';
include 'api/jwt_helper.php';

// Test with a user ID that exists in the database
$user_id = 4; // This should be a valid user ID from your users table

try {
    // Get reports for the user
    $stmt = $conn->prepare("
        SELECT
            hr.id,
            hr.report_number,
            hr.title,
            hr.description,
            hr.location_address,
            hr.latitude,
            hr.longitude,
            hr.severity,
            hr.status,
            hr.created_at,
            ra.file_path as image_path,
            r.photo_path,
            c.name as category_name,
            c.color as category_color
        FROM hazard_reports hr
        LEFT JOIN categories c ON hr.category_id = c.id
        LEFT JOIN report_attachments ra ON hr.id = ra.report_id AND ra.is_primary = 1
        LEFT JOIN reports r ON hr.id = r.id
        WHERE hr.user_id = ?
        ORDER BY hr.created_at DESC
    ");

    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $reports = [];
    while ($row = $result->fetch_assoc()) {
        $reports[] = $row;
    }

    echo "=== API RESPONSE TEST ===\n\n";
    echo "Found " . count($reports) . " reports for user ID $user_id\n\n";

    foreach ($reports as $index => $report) {
        echo "Report #" . ($index + 1) . ":\n";
        echo "- ID: " . $report['id'] . "\n";
        echo "- Title: " . $report['title'] . "\n";
        echo "- image_path: " . ($report['image_path'] ?? 'NULL') . "\n";
        echo "- photo_path: " . ($report['photo_path'] ?? 'NULL') . "\n";
        echo "- Status: " . $report['status'] . "\n";
        echo "\n";
    }

    // Also check the reports table directly
    echo "=== REPORTS TABLE CHECK ===\n\n";
    $stmt2 = $conn->prepare("SELECT id, photo_path FROM reports WHERE user_id = ?");
    $stmt2->bind_param("i", $user_id);
    $stmt2->execute();
    $result2 = $stmt2->get_result();

    echo "Reports table data:\n";
    while ($row = $result2->fetch_assoc()) {
        echo "- ID: " . $row['id'] . ", photo_path: " . ($row['photo_path'] ?? 'NULL') . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$conn->close();
?>
