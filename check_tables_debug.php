<?php
include 'api/db.php';

try {
    echo "Checking database tables...\n\n";

    // Check if categories table exists
    $result = $conn->query('SHOW TABLES LIKE "categories"');
    if ($result->num_rows == 0) {
        echo "❌ Categories table does not exist\n";
    } else {
        echo "✅ Categories table exists\n";
        // Check if it has data
        $count = $conn->query('SELECT COUNT(*) as count FROM categories')->fetch_assoc()['count'];
        echo "   Categories count: $count\n";
        if ($count > 0) {
            $result = $conn->query('SELECT id, name FROM categories LIMIT 5');
            while ($row = $result->fetch_assoc()) {
                echo "   - {$row['id']}: {$row['name']}\n";
            }
        }
    }

    // Check hazard_reports table
    $result = $conn->query('SHOW TABLES LIKE "hazard_reports"');
    if ($result->num_rows == 0) {
        echo "❌ Hazard_reports table does not exist\n";
    } else {
        echo "✅ Hazard_reports table exists\n";
    }

    // Check report_attachments table
    $result = $conn->query('SHOW TABLES LIKE "report_attachments"');
    if ($result->num_rows == 0) {
        echo "❌ Report_attachments table does not exist\n";
    } else {
        echo "✅ Report_attachments table exists\n";
    }

    // Check uploads directory
    if (is_dir('api/uploads')) {
        echo "✅ Uploads directory exists\n";
    } else {
        echo "❌ Uploads directory does not exist\n";
    }

    echo "\nDatabase check completed.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
