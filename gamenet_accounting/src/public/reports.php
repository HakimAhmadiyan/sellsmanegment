<?php
require_once '../includes/db.php';

// Daily report
$stmt_daily = $pdo->prepare("
    SELECT DATE(created_at) as report_date, SUM(total_amount) as daily_total
    FROM invoices
    WHERE DATE(created_at) = CURDATE()
    GROUP BY report_date
");
$stmt_daily->execute();
$daily_report = $stmt_daily->fetch();

// Monthly report
$stmt_monthly = $pdo->prepare("
    SELECT DATE_FORMAT(created_at, '%Y-%m') as report_month, SUM(total_amount) as monthly_total
    FROM invoices
    WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    GROUP BY report_month
");
$stmt_monthly->execute();
$monthly_report = $stmt_monthly->fetch();

// All time report for demonstration
$stmt_all = $pdo->query("
    SELECT i.id, i.total_amount, i.created_at, s.device_id, d.name as device_name
    FROM invoices i
    JOIN sessions s ON i.session_id = s.id
    JOIN devices d ON s.device_id = d.id
    ORDER BY i.created_at DESC
");
$all_invoices = $stmt_all->fetchAll();

?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>گزارشات</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="container">
    <h1>گزارشات درآمد</h1>

    <div class="report-summary">
        <h2>خلاصه</h2>
        <p>درآمد امروز: <?php echo number_format($daily_report['daily_total'] ?? 0, 0); ?> تومان</p>
        <p>درآمد این ماه: <?php echo number_format($monthly_report['monthly_total'] ?? 0, 0); ?> تومان</p>
    </div>

    <hr>

    <h2>تاریخچه تمام فاکتورها</h2>
    <table style="width:100%; text-align: right;">
        <thead>
            <tr>
                <th>شماره فاکتور</th>
                <th>دستگاه</th>
                <th>مبلغ کل</th>
                <th>تاریخ</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($all_invoices as $invoice): ?>
            <tr>
                <td><?php echo $invoice['id']; ?></td>
                <td><?php echo htmlspecialchars($invoice['device_name']); ?></td>
                <td><?php echo number_format($invoice['total_amount'], 0); ?> تومان</td>
                <td><?php echo $invoice['created_at']; ?></td>
            </tr>
            <?php endforeach; ?>
             <?php if (empty($all_invoices)): ?>
                <tr>
                    <td colspan="4" style="text-align:center;">هیچ فاکتوری یافت نشد.</td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>

    <br>
    <a href="index.php" class="btn">بازگشت به صفحه اصلی</a>

</div>
</body>
</html>
