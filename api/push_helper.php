<?php
function send_push_notification($push_token, $title, $body, $data = []) {
    $url = 'https://exp.host/--/api/v2/push/send';
    $message = [
        'to' => $push_token,
        'sound' => 'default',
        'title' => $title,
        'body' => $body,
        'data' => $data,
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Accept-encoding: gzip, deflate',
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    # error_log("Push notification response ($http_code): " . $response);

    return $http_code === 200;
}
?>
