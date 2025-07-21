<?php
require_once '../includes/db.php';

if (!isset($_GET['session_id'])) {
    header("Location: index.php");
    exit();
}

$sessionId = $_GET['session_id'];

// Fetch session details
$stmt = $pdo->prepare("SELECT s.*, d.name as device_name, TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) as duration FROM sessions s JOIN devices d ON s.device_id = d.id WHERE s.id = ?");
$stmt->execute([$sessionId]);
$session = $stmt->fetch();

if (!$session) {
    header("Location: index.php");
    exit();
}

// Fetch available items
$items = $pdo->query("SELECT * FROM items ORDER BY name")->fetchAll();

// Handle adding items to invoice
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_item'])) {
    $itemId = $_POST['item_id'];
    $quantity = $_POST['quantity'];

    // Create an invoice if it doesn't exist
    $stmt = $pdo->prepare("SELECT id FROM invoices WHERE session_id = ?");
    $stmt->execute([$sessionId]);
    $invoice = $stmt->fetch();

    if (!$invoice) {
        $stmt = $pdo->prepare("INSERT INTO invoices (session_id, total_amount) VALUES (?, ?)");
        $stmt->execute([$sessionId, $session['cost']]);
        $invoiceId = $pdo->lastInsertId();
    } else {
        $invoiceId = $invoice['id'];
    }

    // Add item to invoice
    $stmt = $pdo->prepare("INSERT INTO invoice_items (invoice_id, item_id, quantity) VALUES (?, ?, ?)");
    $stmt->execute([$invoiceId, $itemId, $quantity]);

    // Recalculate total
    $stmt = $pdo->prepare("
        UPDATE invoices i SET total_amount = (
            (SELECT cost FROM sessions WHERE id = ?) +
            (SELECT SUM(it.price * ii.quantity) FROM invoice_items ii JOIN items it ON ii.item_id = it.id WHERE ii.invoice_id = ?)
        ) WHERE i.id = ?
    ");
    $stmt->execute([$sessionId, $invoiceId, $invoiceId]);

    header("Location: invoice.php?session_id=" . $sessionId);
    exit();
}

// Fetch invoice details for display
$stmt = $pdo->prepare("
    SELECT i.total_amount, ii.quantity, it.name, it.price
    FROM invoices i
    LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
    LEFT JOIN items it ON ii.item_id = it.id
    WHERE i.session_id = ?");
$stmt->execute([$sessionId]);
$invoiceDetails = $stmt->fetchAll();
$totalAmount = $session['cost'];
if (!empty($invoiceDetails) && $invoiceDetails[0]['total_amount']) {
    $totalAmount = $invoiceDetails[0]['total_amount'];
}

?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فاکتور</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="container">
    <h1>فاکتور جلسه</h1>
    <h2>دستگاه: <?php echo htmlspecialchars($session['device_name']); ?></h2>
    <p>مدت زمان: <?php echo $session['duration']; ?> دقیقه</p>
    <p>هزینه بازی: <?php echo number_format($session['cost'], 0); ?> تومان</p>

    <hr>

    <h3>افزودن آیتم</h3>
    <form method="POST">
        <select name="item_id" required>
            <?php foreach ($items as $item): ?>
                <option value="<?php echo $item['id']; ?>"><?php echo htmlspecialchars($item['name']) . ' (' . number_format($item['price'], 0) . ' تومان)'; ?></option>
            <?php endforeach; ?>
        </select>
        <input type="number" name="quantity" value="1" min="1" required>
        <button type="submit" name="add_item" class="btn">افزودن</button>
    </form>

    <hr>

    <h3>جزئیات فاکتور</h3>
    <table style="width:100%; text-align: right;">
        <thead>
            <tr>
                <th>نام آیتم</th>
                <th>تعداد</th>
                <th>قیمت واحد</th>
                <th>جمع</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>هزینه بازی</td>
                <td><?php echo $session['duration']; ?> دقیقه</td>
                <td>-</td>
                <td><?php echo number_format($session['cost'], 0); ?></td>
            </tr>
            <?php if (!empty($invoiceDetails) && $invoiceDetails[0]['name']): ?>
                <?php foreach ($invoiceDetails as $item): ?>
                <tr>
                    <td><?php echo htmlspecialchars($item['name']); ?></td>
                    <td><?php echo $item['quantity']; ?></td>
                    <td><?php echo number_format($item['price'], 0); ?></td>
                    <td><?php echo number_format($item['price'] * $item['quantity'], 0); ?></td>
                </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
        <tfoot>
            <tr>
                <th colspan="3">جمع کل</th>
                <th><?php echo number_format($totalAmount, 0); ?> تومان</th>
            </tr>
        </tfoot>
    </table>

    <br>
    <a href="index.php" class="btn">بازگشت به صفحه اصلی</a>

</div>
</body>
</html>
