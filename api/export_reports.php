<?php
// List of allowed origins
$allowed_origins = [
    'http://localhost:5173',        // Vite dev server (web admin)
    'http://localhost:5174',        // Vite dev server alternative port
    'http://localhost:8081',        // React Native web/Expo web
    'http://192.168.254.183:8081',  // IP access for web
    'exp://192.168.254.183:8081',   // Expo mobile app
    'http://192.168.254.183',       // Direct IP access
    // Add your production domains here when ready
    'https://yourproductiondomain.com',
];

// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if the origin is in the allowed list
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    // For mobile apps that might not send Origin header, allow but be cautious
    header("Access-Control-Allow-Origin: *");
}

// Essential CORS headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

require_once 'jwt_helper.php';
require_once 'db.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get JWT token from Authorization header or query parameter
$token = getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Authorization token missing']);
    exit();
}

$userData = validateJWT($token);

if (!$userData) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
    exit();
}

// Check if user has admin/BFP privileges
if (!in_array($userData['role'], ['admin', 'bfp_personnel'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied. Admin or BFP personnel required.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get export data with filters
    handleGetExportData();
} elseif ($method === 'POST') {
    // Generate and download export file
    handleGenerateExport();
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}

function handleGetExportData() {
    global $conn;

    try {
        // Get filter parameters
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        $category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
        $date_from = isset($_GET['date_from']) ? $_GET['date_from'] : null;
        $date_to = isset($_GET['date_to']) ? $_GET['date_to'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 1000;

        // Build query
        $query = "
            SELECT
                r.id,
                r.title,
                r.description,
                r.location_address,
                r.latitude,
                r.longitude,
                r.status,
                r.created_at,
                r.updated_at,
                r.image_path,
                c.name as category_name,
                u.fullname as reported_by,
                u.phone as reporter_phone,
                u.email as reporter_email
            FROM hazard_reports r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE 1=1
        ";

        $params = [];
        $types = "";

        if ($status && $status !== 'all') {
            $query .= " AND r.status = ?";
            $params[] = $status;
            $types .= "s";
        }

        if ($category_id) {
            $query .= " AND r.category_id = ?";
            $params[] = $category_id;
            $types .= "i";
        }

        if ($date_from) {
            $query .= " AND DATE(r.created_at) >= ?";
            $params[] = $date_from;
            $types .= "s";
        }

        if ($date_to) {
            $query .= " AND DATE(r.created_at) <= ?";
            $params[] = $date_to;
            $types .= "s";
        }

        $query .= " ORDER BY r.created_at DESC LIMIT ?";
        $params[] = $limit;
        $types .= "i";

        $stmt = $conn->prepare($query);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $reports = [];
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }

        // Get summary statistics
        $statsQuery = "
            SELECT
                COUNT(*) as total_reports,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM hazard_reports r
            WHERE 1=1
        ";

        $statsParams = [];
        $statsTypes = "";

        if ($status && $status !== 'all') {
            $statsQuery .= " AND r.status = ?";
            $statsParams[] = $status;
            $statsTypes .= "s";
        }

        if ($category_id) {
            $statsQuery .= " AND r.category_id = ?";
            $statsParams[] = $category_id;
            $statsTypes .= "i";
        }

        if ($date_from) {
            $statsQuery .= " AND DATE(r.created_at) >= ?";
            $statsParams[] = $date_from;
            $statsTypes .= "s";
        }

        if ($date_to) {
            $statsQuery .= " AND DATE(r.created_at) <= ?";
            $statsParams[] = $date_to;
            $statsTypes .= "s";
        }

        $statsStmt = $conn->prepare($statsQuery);
        if (!empty($statsParams)) {
            $statsStmt->bind_param($statsTypes, ...$statsParams);
        }
        $statsStmt->execute();
        $statsResult = $statsStmt->get_result();
        $stats = $statsResult->fetch_assoc();

        echo json_encode([
            'status' => 'success',
            'data' => [
                'reports' => $reports,
                'summary' => $stats,
                'filters' => [
                    'status' => $status,
                    'category_id' => $category_id,
                    'date_from' => $date_from,
                    'date_to' => $date_to,
                    'limit' => $limit
                ]
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleGenerateExport() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
            return;
        }

        $format = isset($input['format']) ? $input['format'] : 'csv';
        $filters = isset($input['filters']) ? $input['filters'] : [];

        // Get export data
        $exportData = getExportData($filters);

        if ($format === 'csv') {
            generateCSV($exportData);
        } elseif ($format === 'pdf') {
            generatePDF($exportData);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Unsupported format. Use csv or pdf']);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Export error: ' . $e->getMessage()]);
    }
}

function getExportData($filters = []) {
    global $conn;

    $status = isset($filters['status']) ? $filters['status'] : null;
    $category_id = isset($filters['category_id']) ? (int)$filters['category_id'] : null;
    $date_from = isset($filters['date_from']) ? $filters['date_from'] : null;
    $date_to = isset($filters['date_to']) ? $filters['date_to'] : null;

    $query = "
        SELECT
            r.id,
            r.title,
            r.description,
            r.location_address,
            r.latitude,
            r.longitude,
            r.status,
            r.created_at,
            r.updated_at,
            r.image_path,
            c.name as category_name,
            u.fullname as reported_by,
            u.phone as reporter_phone,
            u.email as reporter_email
        FROM hazard_reports r
        LEFT JOIN categories c ON r.category_id = c.id
        LEFT JOIN users u ON r.user_id = u.id
        WHERE 1=1
    ";

    $params = [];
    $types = "";

    if ($status && $status !== 'all') {
        $query .= " AND r.status = ?";
        $params[] = $status;
        $types .= "s";
    }

    if ($category_id) {
        $query .= " AND r.category_id = ?";
        $params[] = $category_id;
        $types .= "i";
    }

    if ($date_from) {
        $query .= " AND DATE(r.created_at) >= ?";
        $params[] = $date_from;
        $types .= "s";
    }

    if ($date_to) {
        $query .= " AND DATE(r.created_at) <= ?";
        $params[] = $date_to;
        $types .= "s";
    }

    $query .= " ORDER BY r.created_at DESC";

    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $reports = [];
    while ($row = $result->fetch_assoc()) {
        $reports[] = $row;
    }

    return $reports;
}

function generateCSV($data) {
    // Clear any previous output
    if (ob_get_level()) {
        ob_clean();
    }

    if (empty($data)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'No data to export']);
        return;
    }

    // Set headers for CSV download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="hazard_reports_' . date('Y-m-d_H-i-s') . '.csv"');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('Content-Transfer-Encoding: binary');

    // Prevent any additional output
    ob_start();

    $output = fopen('php://output', 'w');

    // Add BOM for UTF-8 compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    // Write CSV headers
    fputcsv($output, [
        'Report ID',
        'Title',
        'Description',
        'Category',
        'Location',
        'Latitude',
        'Longitude',
        'Status',
        'Reported By',
        'Reporter Phone',
        'Reporter Email',
        'Created At',
        'Updated At',
        'Image Path'
    ]);

    // Write data rows
    foreach ($data as $row) {
        fputcsv($output, [
            $row['id'],
            $row['title'],
            $row['description'],
            $row['category_name'],
            $row['location_address'],
            $row['latitude'],
            $row['longitude'],
            $row['status'],
            $row['reported_by'],
            $row['reporter_phone'],
            $row['reporter_email'],
            $row['created_at'],
            $row['updated_at'],
            $row['image_path']
        ]);
    }

    fclose($output);
    ob_end_flush();
    exit();
}

function generatePDF($data) {
    require_once '../vendor/tecnickcom/tcpdf/tcpdf.php';

    // Clear any previous output
    if (ob_get_level()) {
        ob_clean();
    }

    if (empty($data)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'No data to export']);
        return;
    }

    // Create new PDF document
    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

    // Set document information
    $pdf->SetCreator('HazardTrack System');
    $pdf->SetAuthor('HazardTrack Admin');
    $pdf->SetTitle('Hazard Reports Export');
    $pdf->SetSubject('Hazard Reports Data Export');

    // Remove default header/footer
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);

    // Set default monospaced font
    $pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

    // Set margins
    $pdf->SetMargins(15, 15, 15);

    // Set auto page breaks
    $pdf->SetAutoPageBreak(TRUE, 15);

    // Set image scale factor
    $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

    // Add a page
    $pdf->AddPage();

    // Set font
    $pdf->SetFont('helvetica', 'B', 16);

    // Title
    $pdf->Cell(0, 10, 'Hazard Reports Export', 0, 1, 'C');
    $pdf->Ln(5);

    // Export information
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(0, 6, 'Generated on: ' . date('Y-m-d H:i:s'), 0, 1, 'L');
    $pdf->Cell(0, 6, 'Total Records: ' . count($data), 0, 1, 'L');
    $pdf->Ln(5);

    // Create table header
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->SetFillColor(240, 240, 240);

    $header = array('ID', 'Title', 'Category', 'Location', 'Status', 'Reported By', 'Created Date');

    // Calculate column widths
    $w = array(15, 40, 25, 35, 20, 30, 25);

    // Header
    for($i = 0; $i < count($header); $i++) {
        $pdf->Cell($w[$i], 7, $header[$i], 1, 0, 'C', true);
    }
    $pdf->Ln();

    // Data rows
    $pdf->SetFont('helvetica', '', 7);
    $pdf->SetFillColor(255, 255, 255);

    $fill = false;
    foreach($data as $row) {
        // Format the data
        $reportId = $row['id'];
        $title = substr($row['title'], 0, 35); // Truncate long titles
        $category = substr($row['category_name'], 0, 20);
        $location = substr($row['location_address'], 0, 30);
        $status = ucfirst($row['status']);
        $reportedBy = substr($row['reported_by'], 0, 25);
        $createdDate = date('Y-m-d', strtotime($row['created_at']));

        $pdf->Cell($w[0], 6, $reportId, 'LR', 0, 'C', $fill);
        $pdf->Cell($w[1], 6, $title, 'LR', 0, 'L', $fill);
        $pdf->Cell($w[2], 6, $category, 'LR', 0, 'L', $fill);
        $pdf->Cell($w[3], 6, $location, 'LR', 0, 'L', $fill);
        $pdf->Cell($w[4], 6, $status, 'LR', 0, 'C', $fill);
        $pdf->Cell($w[5], 6, $reportedBy, 'LR', 0, 'L', $fill);
        $pdf->Cell($w[6], 6, $createdDate, 'LR', 0, 'C', $fill);
        $pdf->Ln();

        $fill = !$fill;
    }

    // Closing line
    $pdf->Cell(array_sum($w), 0, '', 'T');

    // Set headers for PDF download
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="hazard_reports_' . date('Y-m-d_H-i-s') . '.pdf"');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Output PDF
    $pdf->Output('hazard_reports_' . date('Y-m-d_H-i-s') . '.pdf', 'D');
    exit();
}
?>
