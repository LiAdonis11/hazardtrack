    <?php
include 'jwt_helper.php';
include 'db.php';

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
    header("Access-Control-Allow-Origin: *");
}

// Essential CORS headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get JWT token from request
$token = getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
    exit();
}

// Validate JWT token
$payload = validateJWT($token);
if (!$payload) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
    exit();
}

// Check if user has admin or bfp_personnel role
if ($payload['role'] !== 'admin' && $payload['role'] !== 'bfp_personnel') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Admin or BFP personnel access required']);
    exit();
}

// Get type parameter
$type = isset($_GET['type']) ? $_GET['type'] : 'all';

try {
    $hotspots = [];

    // Build query to get hotspots grouped by location_address (barangay)
    $query = "SELECT
        location_address as barangay,
        COUNT(*) as count,
        MAX(created_at) as last_incident,
        AVG(latitude) as avg_lat,
        AVG(longitude) as avg_lng
        FROM hazard_reports
        WHERE location_address IS NOT NULL AND location_address != ''
        AND latitude IS NOT NULL AND longitude IS NOT NULL";

    if ($type !== 'all') {
        // Join with categories to filter by type
        $query = "SELECT
            hr.location_address as barangay,
            COUNT(*) as count,
            MAX(hr.created_at) as last_incident,
            AVG(hr.latitude) as avg_lat,
            AVG(hr.longitude) as avg_lng
            FROM hazard_reports hr
            LEFT JOIN categories c ON hr.category_id = c.id
            WHERE hr.location_address IS NOT NULL AND hr.location_address != ''
            AND hr.latitude IS NOT NULL AND hr.longitude IS NOT NULL";
        $query .= " AND LOWER(c.name) = LOWER('$type')";
    }

    $query .= " GROUP BY location_address ORDER BY count DESC";

    $result = $conn->query($query);

    if (!$result) {
        throw new Exception('Query failed: ' . $conn->error);
    }

    while ($row = $result->fetch_assoc()) {
        $count = (int)$row['count'];
        // Calculate intensity based on count (simple scaling)
        $intensity = min(15, max(1, $count)); // Scale from 1 to 15

        // For primary hazard, we'll set to the type or 'Unknown'
        $primaryHazard = $type !== 'all' ? ucfirst($type) : 'Mixed';

        // Use actual average coordinates from reports
        $lat = (float)$row['avg_lat'];
        $lng = (float)$row['avg_lng'];

        $hotspots[] = [
            'barangay' => $row['barangay'],
            'count' => $count,
            'intensity' => $intensity,
            'primaryHazard' => $primaryHazard,
            'lastIncident' => $row['last_incident'],
            'lat' => $lat,
            'lng' => $lng
        ];
    }

    echo json_encode(['status' => 'success', 'data' => ['hotspots' => $hotspots]]);
} catch (Exception $e) {
    error_log('Hotspot data error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch hotspot data: ' . $e->getMessage()]);
}
?>
