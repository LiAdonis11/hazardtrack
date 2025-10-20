<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
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
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            break;
        case '30d':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            break;
        case '90d':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
            break;
        case '1y':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
            break;
        case 'all':
            $dateCondition = "";
            break;
    }

    // Build filters
    $filters = [];
    if (!empty($status)) {
        $filters[] = "status = '$status'";
    }
    if (!empty($hazardType)) {
        $filters[] = "hazard_type = '$hazardType'";
    }
    if (!empty($barangay)) {
        $filters[] = "barangay = '$barangay'";
    }
    if (!empty($priority)) {
        $filters[] = "priority = '$priority'";
    }

    $filterCondition = !empty($filters) ? "AND " . implode(" AND ", $filters) : "";

    switch ($type) {
        case 'reports':
            $query = "SELECT r.*, u.fullname as user_fullname, c.name as category_name
                     FROM reports r
                     LEFT JOIN users u ON r.user_id = u.id
                     LEFT JOIN hazard_categories c ON r.hazard_type = c.name
                     WHERE 1=1 $dateCondition $filterCondition
                     ORDER BY created_at DESC";

            $result = $conn->query($query);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            // Generate CSV content
            $csvContent = "ID,Title,Description,Status,Priority,Hazard Type,Barangay,Reporter,Created At,Updated At\n";
            foreach ($data as $row) {
                $csvContent .= sprintf(
                    '"%s","%s","%s","%s","%s","%s","%s","%s","%s","%s"' . "\n",
                    $row['id'],
                    $row['title'],
                    $row['description'],
                    $row['status'],
                    $row['priority'],
                    $row['hazard_type'],
                    $row['barangay'],
                    $row['user_fullname'],
                    $row['created_at'],
                    $row['updated_at']
                );
            }

            if ($format === 'csv') {
                header('Content-Type: text/csv');
                header('Content-Disposition: attachment; filename="hazard_reports_export.csv"');
                echo $csvContent;
                exit;
            } else {
                // For Excel format, return JSON for now
                header('Content-Type: application/json');
                echo json_encode([
                    'status' => 'success',
                    'data' => $data,
                    'message' => 'Data prepared for export'
                ]);
            }
            break;

        case 'analytics':
            // Return analytics data
            $analyticsData = [
                'totalReports' => 0,
                'resolvedReports' => 0,
                'avgResponseTime' => 0,
                'reportsByBarangay' => [],
                'reportsByHazardType' => []
            ];

            $result = $conn->query("SELECT COUNT(*) as count FROM reports WHERE 1=1 $dateCondition");
            $analyticsData['totalReports'] = $result->fetch_assoc()['count'];

            $result = $conn->query("SELECT COUNT(*) as count FROM reports WHERE status = 'resolved' $dateCondition");
            $analyticsData['resolvedReports'] = $result->fetch_assoc()['count'];

            echo json_encode([
                'status' => 'success',
                'data' => $analyticsData
            ]);
            break;

        case 'users':
            $query = "SELECT id, fullname, email, role, is_active, created_at FROM users WHERE 1=1 $dateCondition ORDER BY created_at DESC";
            $result = $conn->query($query);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            echo json_encode([
                'status' => 'success',
                'data' => $data
            ]);
            break;

        case 'audit':
            // Return audit log data
            $auditData = [
                'totalLogs' => 0,
                'recentActivity' => []
            ];

            echo json_encode([
                'status' => 'success',
                'data' => $auditData
            ]);
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
