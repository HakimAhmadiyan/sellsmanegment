document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculate-btn');
    const resultDiv = document.getElementById('result');
    const addProductBtn = document.getElementById('add-product-btn');
    const invoiceItemsUl = document.getElementById('invoice-items');
    const totalCostDiv = document.getElementById('total-cost');

    const HOURLY_RATE = 10000; // Tomans per hour
    let totalCost = 0;
    let invoiceItems = [];

    calculateBtn.addEventListener('click', () => {
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;

        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);

            if (start >= end) {
                resultDiv.textContent = 'زمان پایان باید بعد از زمان شروع باشد.';
                resultDiv.style.color = 'red';
                return;
            }

            const durationInMs = end - start;
            const durationInHours = durationInMs / (1000 * 60 * 60);
            const cost = durationInHours * HOURLY_RATE;

            const hours = Math.floor(durationInHours);
            const durationInMinutes = Math.floor((durationInMs / (1000 * 60)) % 60);
            const durationInSeconds = Math.floor((durationInMs / 1000) % 60);

            resultDiv.innerHTML = `
                <p>مدت زمان بازی: ${hours} ساعت و ${durationInMinutes} دقیقه و ${durationInSeconds} ثانیه</p>
                <p>هزینه: ${cost.toLocaleString('fa-IR')} تومان</p>
            `;
            resultDiv.style.color = 'black';

            // Add game cost to invoice
            const gameCostItem = {
                name: `بازی دستگاه ${document.getElementById('device').value}`,
                price: cost
            };
            invoiceItems.push(gameCostItem);
            updateInvoice();
        } else {
            resultDiv.textContent = 'لطفا هر دو زمان شروع و پایان را وارد کنید.';
            resultDiv.style.color = 'red';
        }
    });

    addProductBtn.addEventListener('click', () => {
        const productName = document.getElementById('product-name').value;
        const productPrice = parseFloat(document.getElementById('product-price').value);

        if (productName && !isNaN(productPrice) && productPrice > 0) {
            const product = {
                name: productName,
                price: productPrice
            };
            invoiceItems.push(product);
            updateInvoice();
            // Clear input fields
            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
        } else {
            alert('لطفا نام و قیمت محصول را به درستی وارد کنید.');
        }
    });

    function updateInvoice() {
        invoiceItemsUl.innerHTML = '';
        totalCost = 0;

        invoiceItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name}: ${item.price.toLocaleString('fa-IR')} تومان`;
            invoiceItemsUl.appendChild(li);
            totalCost += item.price;
        });

        totalCostDiv.textContent = `مجموع: ${totalCost.toLocaleString('fa-IR')} تومان`;
    }

    const printInvoiceBtn = document.getElementById('print-invoice-btn');
    printInvoiceBtn.addEventListener('click', () => {
        window.print();
    });

    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportContentDiv = document.getElementById('report-content');

    generateReportBtn.addEventListener('click', () => {
        // For now, the report is based on the current invoice items.
        // In a real application, this would involve fetching data from a database.
        const reportStartDate = document.getElementById('report-start-date').value;
        const reportEndDate = document.getElementById('report-end-date').value;

        if (!reportStartDate || !reportEndDate) {
            reportContentDiv.innerHTML = '<p style="color: red;">لطفا تاریخ شروع و پایان گزارش را انتخاب کنید.</p>';
            return;
        }

        let reportHTML = `<h3>گزارش فروش از ${reportStartDate} تا ${reportEndDate}</h3>`;
        reportHTML += '<ul>';
        let totalSales = 0;

        invoiceItems.forEach(item => {
            reportHTML += `<li>${item.name}: ${item.price.toLocaleString('fa-IR')} تومان</li>`;
            totalSales += item.price;
        });

        reportHTML += '</ul>';
        reportHTML += `<p><strong>مجموع فروش: ${totalSales.toLocaleString('fa-IR')} تومان</strong></p>`;

        reportContentDiv.innerHTML = reportHTML;
    });
});
