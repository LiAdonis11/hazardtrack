<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function generateCSV($data, $headers) {
    $csv = implode(',', array_map(function($h) { return '"' . $h . '"'; }, $headers)) . "\n";
    foreach ($data as $row) {
        $csvRow = [];
        foreach ($headers as $header) {
            $key = strtolower(str_replace(' ', '_', $header));
            $value = isset($row[$key]) ? $row[$key] : '';
            $csvRow[] = '"' . str_replace('"', '""', $value) . '"';
        }
        $csv .= implode(',', $csvRow) . "\n";
    }
    return $csv;
}

function generateExcel($data, $headers, $filename) {
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment; filename="' . $filename . '.xls"');
    header('Cache-Control: max-age=0');

    echo '<table>';
    echo '<tr>';
    foreach ($headers as $header) {
        echo '<th>' . htmlspecialchars($header) . '</th>';
    }
    echo '</tr>';

    foreach ($data as $row) {
        echo '<tr>';
        foreach ($headers as $header) {
            $key = strtolower(str_replace(' ', '_', $header));
            $value = isset($row[$key]) ? $row[$key] : '';
            echo '<td>' . htmlspecialchars($value) . '</td>';
        }
        echo '</tr>';
    }
    echo '</table>';
    exit;
}

function generatePDF($data, $headers, $title, $filename) {
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '.pdf"');

    // Simple HTML to PDF (browsers can print to PDF)
    echo '<!DOCTYPE html>
<html>
<head>
    <title>' . htmlspecialchars($title) . '</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>' . htmlspecialchars($title) . '</h1>
    <table>
        <tr>';
    foreach ($headers as $header) {
        echo '<th>' . htmlspecialchars($header) . '</th>';
    }
    echo '</tr>';

    foreach ($data as $row) {
        echo '<tr>';
        foreach ($headers as $header) {
            $key = strtolower(str_replace(' ', '_', $header));
            $value = isset($row[$key]) ? $row[$key] : '';
            echo '<td>' . htmlspecialchars($value) . '</td>';
        }
        echo '</tr>';
    }
    echo '</table>
</body>
</html>';
    exit;
}

try {
    $type = $_GET['type'] ?? 'reports';
    $range = $_GET['range'] ?? '30d';
    $format = $_GET['format'] ?? 'excel';
    $status = $_GET['status'] ?? '';
    $hazardType = $_GET['hazardType'] ?? '';
    $barangay = $_GET['barangay'] ?? '';
    $priority = $_GET['priority'] ?? '';

    // Calculate date range
    $dateCondition = "";
    switch ($range) {
        case '7d':
            $dateCondition = "AND hr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            break;
        case '30d':
            $dateCondition = "AND hr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            break;
        case '90d':
            $dateCondition = "AND hr.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
            break;
        case '1y':
            $dateCondition = "AND hr.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
            break;
        case 'all':
            $dateCondition = "";
            break;
    }

    // Build filters
    $filters = [];
    if (!empty($status)) {
        $filters[] = "hr.status = '$status'";
    }
    if (!empty($hazardType)) {
        $filters[] = "hr.category_id = '$hazardType'";
    }
    if (!empty($barangay)) {
        $filters[] = "hr.barangay = '$barangay'";
    }
    if (!empty($priority)) {
        $filters[] = "hr.priority = '$priority'";
    }

    $filterCondition = !empty($filters) ? "AND " . implode(" AND ", $filters) : "";

    switch ($type) {
        case 'reports':
            $query = "SELECT hr.*, u.fullname as user_fullname, c.name as category_name
                     FROM hazard_reports hr
                     LEFT JOIN users u ON hr.user_id = u.id
                     LEFT JOIN categories c ON hr.category_id = c.id
                     WHERE 1=1 $dateCondition $filterCondition
                     ORDER BY hr.created_at DESC";

            $result = $conn->query($query);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            $headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category Name', 'Barangay', 'User Fullname', 'Created At', 'Updated At'];
            $filename = 'hazard_reports_export_' . date('Y-m-d');

            if ($format === 'csv') {
                header('Content-Type: text/csv');
                header('Content-Disposition: attachment; filename="' . $filename . '.csv"');
                echo generateCSV($data, $headers);
                exit;
            } elseif ($format === 'excel') {
                generateExcel($data, $headers, $filename);
            } elseif ($format === 'pdf') {
                generatePDF($data, $headers, 'Hazard Reports Export', $filename);
            }
            break;

        case 'analytics':
            // Get analytics data
            $analyticsData = [
                'totalReports' => 0,
                'resolvedReports' => 0,
                'avgResponseTime' => 0,
                'reportsByBarangay' => [],
                'reportsByHazardType' => []
            ];

            $result = $conn->query("SELECT COUNT(*) as count FROM hazard_reports WHERE 1=1 $dateCondition");
            $analyticsData['totalReports'] = $result->fetch_assoc()['count'];

            $result = $conn->query("SELECT COUNT(*) as count FROM hazard_reports WHERE status = 'resolved' $dateCondition");
            $analyticsData['resolvedReports'] = $result->fetch_assoc()['count'];

            // Get reports by barangay
            $result = $conn->query("SELECT barangay, COUNT(*) as count FROM hazard_reports WHERE 1=1 $dateCondition GROUP BY barangay ORDER BY count DESC");
            while ($row = $result->fetch_assoc()) {
                $analyticsData['reportsByBarangay'][] = $row;
            }

            // Get reports by hazard type
            $result = $conn->query("SELECT category_id, COUNT(*) as count FROM hazard_reports WHERE 1=1 $dateCondition GROUP BY category_id ORDER BY count DESC");
            while ($row = $result->fetch_assoc()) {
                $analyticsData['reportsByHazardType'][] = $row;
            }

            $headers = ['Category', 'Name', 'Count'];
            $filename = 'analytics_export_' . date('Y-m-d');

            if ($format === 'csv') {
                header('Content-Type: text/csv');
                header('Content-Disposition: attachment; filename="' . $filename . '.csv"');
                $csvData = [];
                foreach ($analyticsData['reportsByHazardType'] as $item) {
                    $csvData[] = ['category' => 'Hazard Type', 'name' => $item['category_id'], 'count' => $item['count']];
                }
                foreach ($analyticsData['reportsByBarangay'] as $item) {
                    $csvData[] = ['category' => 'Barangay', 'name' => $item['barangay'], 'count' => $item['count']];
                }
                echo generateCSV($csvData, $headers);
                exit;
            } elseif ($format === 'excel') {
                $excelData = [];
                foreach ($analyticsData['reportsByHazardType'] as $item) {
                    $excelData[] = ['category' => 'Hazard Type', 'name' => $item['category_id'], 'count' => $item['count']];
                }
                foreach ($analyticsData['reportsByBarangay'] as $item) {
                    $excelData[] = ['category' => 'Barangay', 'name' => $item['barangay'], 'count' => $item['count']];
                }
                generateExcel($excelData, $headers, $filename);
            } elseif ($format === 'pdf') {
                $pdfData = [];
                foreach ($analyticsData['reportsByHazardType'] as $item) {
                    $pdfData[] = ['category' => 'Hazard Type', 'name' => $item['category_id'], 'count' => $item['count']];
                }
                foreach ($analyticsData['reportsByBarangay'] as $item) {
                    $pdfData[] = ['category' => 'Barangay', 'name' => $item['barangay'], 'count' => $item['count']];
                }
                generatePDF($pdfData, $headers, 'Analytics Export', $filename);
            }
            break;

        case 'users':
            $userDateCondition = str_replace('hr.', 'u.', $dateCondition);
            $query = "SELECT u.id, u.fullname, u.email, u.role, u.is_active, u.created_at FROM users u WHERE 1=1 $userDateCondition ORDER BY u.created_at DESC";
            $result = $conn->query($query);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            $headers = ['ID', 'Full Name', 'Email', 'Role', 'Active', 'Created At'];
            $filename = 'users_export_' . date('Y-m-d');

            if ($format === 'csv') {
                header('Content-Type: text/csv');
                header('Content-Disposition: attachment; filename="' . $filename . '.csv"');
                echo generateCSV($data, $headers);
                exit;
            } elseif ($format === 'excel') {
                generateExcel($data, $headers, $filename);
            } elseif ($format === 'pdf') {
                generatePDF($data, $headers, 'Users Export', $filename);
            }
            break;

        case 'audit':
            // Get audit logs from status_history table
            $auditDateCondition = str_replace('hr.', 'sh.', $dateCondition);
            $query = "SELECT sh.*, u.fullname as user_name, hr.title as report_title
                     FROM status_history sh
                     LEFT JOIN users u ON sh.changed_by = u.id
                     LEFT JOIN hazard_reports hr ON sh.report_id = hr.id
                     WHERE 1=1 $auditDateCondition
                     ORDER BY sh.created_at DESC";

            $result = $conn->query($query);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            $headers = ['ID', 'Report ID', 'Report Title', 'Old Status', 'New Status', 'Changed By', 'Change Note', 'Created At'];
            $filename = 'status_history_export_' . date('Y-m-d');

            if ($format === 'csv') {
                header('Content-Type: text/csv');
                header('Content-Disposition: attachment; filename="' . $filename . '.csv"');
                echo generateCSV($data, $headers);
                exit;
            } elseif ($format === 'excel') {
                generateExcel($data, $headers, $filename);
            } elseif ($format === 'pdf') {
                generatePDF($data, $headers, 'Status History Export', $filename);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid export type'
            ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
