<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مدیریت گیم‌نت</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <h1>مدیریت گیم‌نت</h1>
        <a href="reports.php" class="btn" style="margin-bottom: 20px;">مشاهده گزارشات</a>
        <div id="devices-container">
            <?php
            require_once '../includes/db.php';
            $stmt = $pdo->query('SELECT * FROM devices ORDER BY name');
            while ($row = $stmt->fetch()) {
                echo '<div class="device-card ' . htmlspecialchars($row['status']) . '">';
                echo '<h3>' . htmlspecialchars($row['name']) . '</h3>';
                if ($row['status'] == 'available') {
                    echo '<a href="start_session.php?device_id=' . $row['id'] . '" class="btn">شروع جلسه</a>';
                } else {
                    echo '<a href="end_session.php?device_id=' . $row['id'] . '" class="btn btn-danger">پایان جلسه</a>';
                }
                echo '</div>';
            }
            ?>
        </div>
    </div>

    <script src="js/main.js"></script>
</body>
</html>
