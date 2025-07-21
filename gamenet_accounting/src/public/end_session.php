<?php
require_once '../includes/db.php';

if (isset($_GET['device_id'])) {
    $deviceId = $_GET['device_id'];

    // Find the active session for the device
    $stmt = $pdo->prepare("SELECT id FROM sessions WHERE device_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1");
    $stmt->execute([$deviceId]);
    $session = $stmt->fetch();

    if ($session) {
        $sessionId = $session['id'];

        // End the session
        $stmt = $pdo->prepare("UPDATE sessions SET end_time = NOW() WHERE id = ?");
        $stmt->execute([$sessionId]);

        // Calculate the cost (e.g., 20000 per hour)
        $stmt = $pdo->prepare("UPDATE sessions s SET cost = (TIMESTAMPDIFF(SECOND, start_time, end_time) / 3600) * 20000 WHERE id = ?");
        $stmt->execute([$sessionId]);

        // Update device status
        $stmt = $pdo->prepare("UPDATE devices SET status = 'available' WHERE id = ?");
        $stmt->execute([$deviceId]);
    }

    // Redirect to the invoice page
    if ($session) {
        header("Location: invoice.php?session_id=" . $sessionId);
    } else {
        header("Location: index.php");
    }
    exit();
}
?>
?>
