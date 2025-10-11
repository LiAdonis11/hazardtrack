<?php
include 'db.php';
include 'jwt_helper.php';

// Essential CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST/PUT
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

function getAuthorizationHeader(){
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    return $headers;
}

function getBearerTokenFromHeader() {
    $headers = getAuthorizationHeader();
    // HEADER: Get the access token from the header
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

// Get JWT token from request
$token = null;
if (isset($_POST['token']) && !empty($_POST['token'])) {
    $token = $_POST['token'];
} elseif (isset($_GET['token']) && !empty($_GET['token'])) {
    $token = $_GET['token'];
} else {
    $token = getBearerTokenFromHeader();
}

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

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
$report_id = $input['report_id'] ?? $_POST['report_id'] ?? null;
$title = $input['title'] ?? $_POST['title'] ?? null;
$description = $input['description'] ?? $_POST['description'] ?? null;
$location_address = $input['location_address'] ?? $_POST['location_address'] ?? null;
$latitude = $input['latitude'] ?? $_POST['latitude'] ?? null;
$longitude = $input['longitude'] ?? $_POST['longitude'] ?? null;
$admin_notes = $input['admin_notes'] ?? $_POST['admin_notes'] ?? null;

if (!$report_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Report ID is required']);
    exit();
}

// Validate that at least one field is provided for update
$update_fields = [];
if ($title !== null) $update_fields[] = 'title';
if ($description !== null) $update_fields[] = 'description';
if ($location_address !== null) $update_fields[] = 'location_address';
if ($latitude !== null) $update_fields[] = 'latitude';
if ($longitude !== null) $update_fields[] = 'longitude';
if ($admin_notes !== null) $update_fields[] = 'admin_notes';

if (empty($update_fields)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'At least one field must be provided for update']);
    exit();
}

try {
    // Build dynamic update query
    $set_parts = [];
    $bind_values = [];
    $types = '';

    if ($title !== null) {
        $set_parts[] = "title = ?";
        $bind_values[] = $title;
        $types .= 's';
    }
    if ($description !== null) {
        $set_parts[] = "description = ?";
        $bind_values[] = $description;
        $types .= 's';
    }
    if ($location_address !== null) {
        $set_parts[] = "location_address = ?";
        $bind_values[] = $location_address;
        $types .= 's';
    }
    if ($latitude !== null) {
        $set_parts[] = "latitude = ?";
        $bind_values[] = $latitude;
        $types .= 'd';
    }
    if ($longitude !== null) {
        $set_parts[] = "longitude = ?";
        $bind_values[] = $longitude;
        $types .= 'd';
    }
    if ($admin_notes !== null) {
        $set_parts[] = "admin_notes = ?";
        $bind_values[] = $admin_notes;
        $types .= 's';
    }

    $set_parts[] = "updated_at = NOW()";
    $types .= 'i'; // for report_id

    $query = "UPDATE hazard_reports SET " . implode(', ', $set_parts) . " WHERE id = ?";
    $bind_values[] = $report_id;

    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$bind_values);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        // Get updated report data
        $stmt_get = $conn->prepare("SELECT title, description, location_address, latitude, longitude FROM hazard_reports WHERE id = ?");
        $stmt_get->bind_param("i", $report_id);
        $stmt_get->execute();
        $result = $stmt_get->get_result();
        $updated_report = $result->fetch_assoc();
        $stmt_get->close();

        // Send push notification to the user
        include 'push_helper.php';
        $stmt_get_user = $conn->prepare("SELECT u.push_token, hr.title, hr.user_id FROM hazard_reports hr JOIN users u ON hr.user_id = u.id WHERE hr.id = ?");
        $stmt_get_user->bind_param("i", $report_id);
        $stmt_get_user->execute();
        $reporter_user_id = null;
        if ($user_res = $stmt_get_user->get_result()) {
            if ($user_row = $user_res->fetch_assoc()) {
                $reporter_user_id = $user_row['user_id'];
                if (!empty($user_row['push_token'])) {
                    $push_token = $user_row['push_token'];
                    $report_title = $user_row['title'];
                    $notification_title = 'Report Details Updated';
                    $notification_body = "The details of your report '" . $report_title . "' have been updated.";
                    send_push_notification($push_token, $notification_title, $notification_body, ['report_id' => $report_id]);
                }
            }
        }
        $stmt_get_user->close();

        // Insert in-app notification for resident
        if ($reporter_user_id) {
            $notification_messages = [
                'title' => 'Report Details Updated',
                'body' => 'The details of your report have been updated by BFP personnel.'
            ];
            $stmt_notify = $conn->prepare("INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)");
            $stmt_notify->bind_param("iss", $reporter_user_id, $notification_messages['title'], $notification_messages['body']);
            $stmt_notify->execute();
            $stmt_notify->close();
        }

        // Notify all BFP personnel (inspectors and admins) about report details change
        $bfp_notification_title = 'Report Details Updated';
        $bfp_notification_body = "Report #{$report_id} details have been updated by " . ($payload['fullname'] ?? 'Admin');

        $stmt_bfp = $conn->prepare("
            INSERT INTO notifications (user_id, title, body)
            SELECT id, ?, ? FROM users WHERE role IN ('admin', 'inspector') AND id != ?
        ");
        $stmt_bfp->bind_param("ssi", $bfp_notification_title, $bfp_notification_body, $payload['user_id']);
        $stmt_bfp->execute();
        $stmt_bfp->close();



        echo json_encode([
            'status' => 'success',
            'message' => 'Report details updated successfully',
            'data' => [
                'report_id' => $report_id,
                'updated_fields' => $update_fields,
                'updated_report' => $updated_report,
                'updated_by' => $payload['user_id']
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Report not found or no changes made']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to update report details: ' . $e->getMessage()]);
}
?>
