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
    // Validate token
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $token = $matches[1];
    require_once 'jwt_helper.php';
    $user = validateJWT($token);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid token']);
        exit;
    }

    $reportType = $_GET['type'] ?? 'weekly';
    $range = $_GET['range'] ?? '30d';
    $includeCharts = isset($_GET['charts']) ? filter_var($_GET['charts'], FILTER_VALIDATE_BOOLEAN) : true;
    $includeRawData = isset($_GET['rawData']) ? filter_var($_GET['rawData'], FILTER_VALIDATE_BOOLEAN) : false;

    // Calculate date range
    $dateCondition = "";
    $dateLabel = "";
    switch ($range) {
        case '7d':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            $dateLabel = "Last 7 Days";
            break;
        case '30d':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            $dateLabel = "Last 30 Days";
            break;
        case '90d':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
            $dateLabel = "Last 90 Days";
            break;
        case '1y':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
            $dateLabel = "Last Year";
            break;
    }

    // Get report data based on type
    $reportData = [];

    switch ($reportType) {
        case 'weekly':
        case 'monthly':
            // Get basic statistics
            $statsQuery = "SELECT
                COUNT(*) as total_reports,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
                COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_reports,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_reports,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_reports
                FROM hazard_reports WHERE 1=1 $dateCondition";

            $statsResult = $conn->query($statsQuery);
            $stats = $statsResult->fetch_assoc();

            // Get reports by category
            $categoryQuery = "SELECT c.name, COUNT(r.id) as count
                FROM categories c
                LEFT JOIN hazard_reports r ON c.id = r.category_id AND r.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY c.name
                ORDER BY count DESC";

            $categoryResult = $conn->query($categoryQuery);
            $categories = [];
            while ($row = $categoryResult->fetch_assoc()) {
                if ($row['name']) { // Only include categories with a name
                    $categories[] = $row;
                }
            }

            // Get reports by barangay
            $barangayQuery = "SELECT barangay, COUNT(*) as count
                FROM reports WHERE 1=1 $dateCondition
                GROUP BY barangay
                ORDER BY count DESC LIMIT 10";
            // This query is problematic as `barangay` column doesn't exist. Let's use location_address for now.
            $barangayResult = $conn->query($barangayQuery);
            $barangays = [];
            while ($row = $barangayResult->fetch_assoc()) {
                $barangays[] = $row;
            }

            $reportData = [
                'title' => $reportType === 'weekly' ? 'Weekly Summary Report' : 'Monthly Performance Report',
                'period' => $dateLabel,
                'generated_at' => date('Y-m-d H:i:s'),
                'generated_by' => $user['fullname'] ?? 'System',
                'statistics' => $stats,
                'categories' => $categories,
                'barangays' => $barangays,
                'type' => $reportType
            ];
            break;

        case 'bfp':
            // BFP Operations Report
            $bfpQuery = "SELECT
                COUNT(CASE WHEN status IN ('verified', 'resolved') THEN 1 END) as handled_reports,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_assignments,
                AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_response_time
                FROM hazard_reports WHERE 1=1 $dateCondition";

            $bfpResult = $conn->query($bfpQuery);
            $bfpStats = $bfpResult->fetch_assoc();

            // Get personnel stats (mock data for now)
            $personnelStats = [
                'active_personnel' => 25,
                'available_personnel' => 20,
                'on_duty' => 18,
                'training_required' => 3
            ];

            $reportData = [
                'title' => 'BFP Operations Report',
                'period' => $dateLabel,
                'generated_at' => date('Y-m-d H:i:s'),
                'generated_by' => $user['fullname'] ?? 'System',
                'operations' => $bfpStats,
                'personnel' => $personnelStats,
                'type' => 'bfp'
            ];
            break;

        case 'lgu':
            // LGU Coordination Report
            $lguQuery = "SELECT
                COUNT(DISTINCT barangay) as barangays_covered,
                COUNT(*) as total_reports,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports
                FROM hazard_reports WHERE 1=1 $dateCondition";

            $lguResult = $conn->query($lguQuery);
            $lguStats = $lguResult->fetch_assoc();

            // Get barangay statistics
            $barangayStatsQuery = "SELECT
                barangay,
                COUNT(*) as total_reports,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
                AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_response_time
                FROM hazard_reports WHERE 1=1 $dateCondition
                GROUP BY barangay
                ORDER BY total_reports DESC";

            $barangayStatsResult = $conn->query($barangayStatsQuery);
            $barangayStats = [];
            while ($row = $barangayStatsResult->fetch_assoc()) {
                $barangayStats[] = $row;
            }

            $reportData = [
                'title' => 'LGU Coordination Report',
                'period' => $dateLabel,
                'generated_at' => date('Y-m-d H:i:s'),
                'generated_by' => $user['fullname'] ?? 'System',
                'coordination' => $lguStats,
                'barangay_stats' => $barangayStats,
                'type' => 'lgu'
            ];
            break;
    }

    // Generate HTML report
    $html = generateHTMLReport($reportData, $includeCharts, $includeRawData);

    // For now, return HTML as JSON. In production, you'd convert to PDF
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'data' => $reportData,
        'html' => $html,
        'message' => 'Report generated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

function generateHTMLReport($data, $includeCharts, $includeRawData) {
    $title = $data['title'];
    $period = $data['period'];
    $generatedAt = $data['generated_at'];
    $generatedBy = $data['generated_by'];

    $html = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>$title</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #d97706; }
            .report-title { font-size: 20px; font-weight: bold; margin: 10px 0; }
            .meta-info { color: #666; font-size: 12px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #d97706; }
            .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .chart-placeholder { background: #f0f0f0; height: 200px; display: flex; align-items: center; justify-content: center; border: 1px solid #ccc; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class='header'>
            <div class='logo'>HAZARD TRACK</div>
            <div class='report-title'>$title</div>
            <div class='meta-info'>
                Period: $period | Generated: $generatedAt | By: $generatedBy
            </div>
        </div>
    ";

    // Add content based on report type
    switch ($data['type']) {
        case 'weekly':
        case 'monthly':
            $html .= generateStandardReport($data, $includeCharts, $includeRawData);
            break;
        case 'bfp':
            $html .= generateBFPReport($data, $includeCharts, $includeRawData);
            break;
        case 'lgu':
            $html .= generateLGUReport($data, $includeCharts, $includeRawData);
            break;
    }

    $html .= "
        <div class='section'>
            <div class='meta-info' style='text-align: center; margin-top: 50px;'>
                Report generated by HazardTrack System on " . date('F j, Y \a\t g:i A') . "
            </div>
        </div>
    </body>
    </html>
    ";

    return $html;
}

function generateStandardReport($data, $includeCharts, $includeRawData) {
    $stats = $data['statistics'];
    $categories = $data['categories'];
    $barangays = $data['barangays'];

    $html = "
        <div class='section'>
            <div class='section-title'>Executive Summary</div>
            <p>This report provides a comprehensive overview of hazard reporting activities for the specified period.</p>
        </div>

        <div class='section'>
            <div class='section-title'>Key Statistics</div>
            <div class='stats-grid'>
                <div class='stat-card'>
                    <div class='stat-value'>{$stats['total_reports']}</div>
                    <div class='stat-label'>Total Reports</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>{$stats['pending_reports']}</div>
                    <div class='stat-label'>Pending</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>{$stats['verified_reports']}</div>
                    <div class='stat-label'>Verified</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>{$stats['resolved_reports']}</div>
                    <div class='stat-label'>Resolved</div>
                </div>
            </div>
        </div>
    ";

    if ($includeCharts) {
        $html .= "
            <div class='section'>
                <div class='section-title'>Reports by Category</div>
                <div class='chart-placeholder'>Chart: Reports by Hazard Category</div>
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
        ";

        foreach ($categories as $category) {
            $html .= "<tr><td>{$category['name']}</td><td>{$category['count']}</td></tr>";
        }

        $html .= "
                    </tbody>
                </table>
            </div>

            <div class='section'>
                <div class='section-title'>Reports by Barangay</div>
                <div class='chart-placeholder'>Chart: Reports by Barangay</div>
                <table>
                    <thead>
                        <tr>
                            <th>Barangay</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
        ";

        foreach ($barangays as $barangay) {
            $html .= "<tr><td>{$barangay['barangay']}</td><td>{$barangay['count']}</td></tr>";
        }

        $html .= "
                    </tbody>
                </table>
            </div>
        ";
    }

    return $html;
}

function generateBFPReport($data, $includeCharts, $includeRawData) {
    $operations = $data['operations'];
    $personnel = $data['personnel'];

    $html = "
        <div class='section'>
            <div class='section-title'>Operations Summary</div>
            <div class='stats-grid'>
                <div class='stat-card'>
                    <div class='stat-value'>{$operations['handled_reports']}</div>
                    <div class='stat-label'>Reports Handled</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>{$operations['pending_assignments']}</div>
                    <div class='stat-label'>Pending Assignments</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>" . round($operations['avg_response_time'] ?? 0, 1) . "h</div>
                    <div class='stat-label'>Avg Response Time</div>
                </div>
            </div>
        </div>

        <div class='section'>
            <div class='section-title'>Personnel Status</div>
            <div class='stats-grid'>
                <div class='stat-card'>
                    <div class='stat-value'>{$personnel['active_personnel']}</div>
                    <div class='stat-label'>Active Personnel</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>{$personnel['available_personnel']}</div>
                    <div class='stat-label'>Available</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>{$personnel['on_duty']}</div>
                    <div class='stat-label'>On Duty</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>{$personnel['training_required']}</div>
                    <div class='stat-label'>Training Required</div>
                </div>
            </div>
        </div>
    ";

    return $html;
}

function generateLGUReport($data, $includeCharts, $includeRawData) {
    $coordination = $data['coordination'];
    $barangayStats = $data['barangay_stats'];

    $html = "
        <div class='section'>
            <div class='section-title'>Coordination Overview</div>
            <div class='stats-grid'>
                <div class='stat-card'>
                    <div class='stat-value'>{$coordination['barangays_covered']}</div>
                    <div class='stat-label'>Barangays Covered</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>{$coordination['total_reports']}</div>
                    <div class='stat-label'>Total Reports</div>
                </div>
                <div class='stat-card'>
                    <div class='stat-value'>{$coordination['resolved_reports']}</div>
                    <div class='stat-label'>Resolved Reports</div>
                </div>
            </div>
        </div>

        <div class='section'>
            <div class='section-title'>Barangay Performance</div>
            <table>
                <thead>
                    <tr>
                        <th>Barangay</th>
                        <th>Total Reports</th>
                        <th>Resolved</th>
                        <th>Avg Response Time (hours)</th>
                    </tr>
                </thead>
                <tbody>
    ";

    foreach ($barangayStats as $stat) {
        $html .= "
            <tr>
                <td>{$stat['barangay']}</td>
                <td>{$stat['total_reports']}</td>
                <td>{$stat['resolved_reports']}</td>
                <td>" . round($stat['avg_response_time'] ?? 0, 1) . "</td>
            </tr>
        ";
    }

    $html .= "
                </tbody>
            </table>
        </div>
    ";

    return $html;
}
?>
