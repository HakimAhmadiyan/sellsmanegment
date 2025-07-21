document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculate-btn');
    const resultDiv = document.getElementById('result');
    const addProductBtn = document.getElementById('add-product-btn');
    const invoiceItemsUl = document.getElementById('invoice-items');
    const totalCostDiv = document.getElementById('total-cost');
    const addDeviceBtn = document.getElementById('add-device-btn');
    const deviceListDiv = document.getElementById('device-list');
    const deviceSelect = document.getElementById('device-select');

    let devices = JSON.parse(localStorage.getItem('devices')) || [
        { name: 'دستگاه 1', rate: 10000 },
        { name: 'دستگاه 2', rate: 10000 },
    ];
    let totalCost = 0;
    let invoiceItems = [];

    function saveDevices() {
        localStorage.setItem('devices', JSON.stringify(devices));
    }

    function renderDevices() {
        deviceListDiv.innerHTML = '';
        deviceSelect.innerHTML = '';

        devices.forEach((device, index) => {
            // Populate device list for settings
            const deviceEl = document.createElement('div');
            deviceEl.className = 'device-item';
            deviceEl.innerHTML = `
                <span>${device.name} - ${device.rate.toLocaleString('fa-IR')} تومان/ساعت</span>
                <div>
                    <button class="edit-device-btn" data-index="${index}">ویرایش</button>
                    <button class="delete-device-btn" data-index="${index}">حذف</button>
                </div>
            `;
            deviceListDiv.appendChild(deviceEl);

            // Populate device dropdown for calculation
            const option = document.createElement('option');
            option.value = index;
            option.textContent = device.name;
            deviceSelect.appendChild(option);
        });
    }

    addDeviceBtn.addEventListener('click', () => {
        const name = document.getElementById('new-device-name').value;
        const rate = parseFloat(document.getElementById('new-device-rate').value);

        if (name && rate > 0) {
            devices.push({ name, rate });
            saveDevices();
            renderDevices();
            document.getElementById('new-device-name').value = '';
            document.getElementById('new-device-rate').value = '';
        } else {
            alert('لطفا نام و هزینه ساعتی دستگاه را به درستی وارد کنید.');
        }
    });

    deviceListDiv.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        if (e.target.classList.contains('delete-device-btn')) {
            devices.splice(index, 1);
            saveDevices();
            renderDevices();
        }
        if (e.target.classList.contains('edit-device-btn')) {
            const device = devices[index];
            const newName = prompt('نام جدید دستگاه را وارد کنید:', device.name);
            const newRate = parseFloat(prompt('هزینه ساعتی جدید را وارد کنید:', device.rate));

            if (newName && newRate > 0) {
                devices[index] = { name: newName, rate: newRate };
                saveDevices();
                renderDevices();
            }
        }
    });

    calculateBtn.addEventListener('click', () => {
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const deviceIndex = deviceSelect.value;

        if (startTime && endTime && deviceIndex !== null) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const device = devices[deviceIndex];

            if (start >= end) {
                resultDiv.textContent = 'زمان پایان باید بعد از زمان شروع باشد.';
                resultDiv.style.color = 'red';
                return;
            }

            const durationInMs = end - start;
            const durationInHours = durationInMs / (1000 * 60 * 60);
            const cost = durationInHours * device.rate;

            const hours = Math.floor(durationInHours);
            const durationInMinutes = Math.floor((durationInMs / (1000 * 60)) % 60);
            const durationInSeconds = Math.floor((durationInMs / 1000) % 60);

            resultDiv.innerHTML = `
                <p>مدت زمان بازی: ${hours} ساعت و ${durationInMinutes} دقیقه و ${durationInSeconds} ثانیه</p>
                <p>هزینه: ${cost.toLocaleString('fa-IR')} تومان</p>
            `;
            resultDiv.style.color = 'black';

            const gameCostItem = {
                name: `بازی ${device.name}`,
                price: cost
            };
            invoiceItems.push(gameCostItem);
            updateInvoice();
        } else {
            resultDiv.textContent = 'لطفا زمان شروع، پایان و دستگاه را انتخاب کنید.';
            resultDiv.style.color = 'red';
        }
    });

    const addNewProductBtn = document.getElementById('add-new-product-btn');
    const productListDiv = document.getElementById('product-list');
    const productSelect = document.getElementById('product-select');
    const addProductToInvoiceBtn = document.getElementById('add-product-to-invoice-btn');

    let products = JSON.parse(localStorage.getItem('products')) || [
        { name: 'نوشابه', price: 5000 },
        { name: 'چیپس', price: 10000 },
    ];

    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function renderProducts() {
        productListDiv.innerHTML = '';
        productSelect.innerHTML = '';

        products.forEach((product, index) => {
            // Populate product list for management
            const productEl = document.createElement('div');
            productEl.className = 'product-item';
            productEl.innerHTML = `
                <span>${product.name} - ${product.price.toLocaleString('fa-IR')} تومان</span>
                <div>
                    <button class="edit-product-btn" data-index="${index}">ویرایش</button>
                    <button class="delete-product-btn" data-index="${index}">حذف</button>
                </div>
            `;
            productListDiv.appendChild(productEl);

            // Populate product dropdown for invoice
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${product.name} - ${product.price.toLocaleString('fa-IR')} تومان`;
            productSelect.appendChild(option);
        });
    }

    addNewProductBtn.addEventListener('click', () => {
        const name = document.getElementById('new-product-name').value;
        const price = parseFloat(document.getElementById('new-product-price').value);

        if (name && price > 0) {
            products.push({ name, price });
            saveProducts();
            renderProducts();
            document.getElementById('new-product-name').value = '';
            document.getElementById('new-product-price').value = '';
        } else {
            alert('لطفا نام و قیمت محصول را به درستی وارد کنید.');
        }
    });

    addProductToInvoiceBtn.addEventListener('click', () => {
        const productIndex = productSelect.value;
        if (productIndex !== null) {
            const product = products[productIndex];
            invoiceItems.push({
                name: product.name,
                price: product.price
            });
            updateInvoice();
        }
    });

    productListDiv.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        if (e.target.classList.contains('delete-product-btn')) {
            products.splice(index, 1);
            saveProducts();
            renderProducts();
        }
        if (e.target.classList.contains('edit-product-btn')) {
            const product = products[index];
            const newName = prompt('نام جدید محصول را وارد کنید:', product.name);
            const newPrice = parseFloat(prompt('قیمت جدید محصول را وارد کنید:', product.price));

            if (newName && newPrice > 0) {
                products[index] = { name: newName, price: newPrice };
                saveProducts();
                renderProducts();
            }
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

    const saveInvoiceBtn = document.getElementById('save-invoice-btn');
    const invoiceListDiv = document.getElementById('invoice-list');
    let allInvoices = JSON.parse(localStorage.getItem('invoices')) || [];

    function saveAllInvoices() {
        localStorage.setItem('invoices', JSON.stringify(allInvoices));
    }

    function renderAllInvoices() {
        invoiceListDiv.innerHTML = '';
        allInvoices.forEach((invoice, index) => {
            const invoiceEl = document.createElement('div');
            invoiceEl.className = 'invoice-item-stored';
            invoiceEl.innerHTML = `
                <span>فاکتور شماره ${invoice.id} - ${new Date(invoice.date).toLocaleString('fa-IR')} - مجموع: ${invoice.total.toLocaleString('fa-IR')} تومان</span>
                <button class="view-invoice-btn" data-index="${index}">مشاهده</button>
            `;
            invoiceListDiv.appendChild(invoiceEl);
        });
    }

    saveInvoiceBtn.addEventListener('click', () => {
        if (invoiceItems.length > 0) {
            const newInvoice = {
                id: allInvoices.length + 1,
                date: new Date(),
                items: invoiceItems,
                total: totalCost
            };
            allInvoices.push(newInvoice);
            saveAllInvoices();
            renderAllInvoices();
            clearCurrentInvoice();
            alert('فاکتور با موفقیت ذخیره شد.');
        } else {
            alert('فاکتور خالی است.');
        }
    });

    function clearCurrentInvoice() {
        invoiceItems = [];
        totalCost = 0;
        updateInvoice();
        resultDiv.innerHTML = '';
    }

    const newInvoiceBtn = document.getElementById('new-invoice-btn');
    newInvoiceBtn.addEventListener('click', () => {
        if (confirm('آیا مطمئن هستید که می‌خواهید فاکتور فعلی را پاک کنید و یک فاکتور جدید شروع کنید؟')) {
            clearCurrentInvoice();
        }
    });

    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportContentDiv = document.getElementById('report-content');

    generateReportBtn.addEventListener('click', () => {
        const reportStartDate = new Date(document.getElementById('report-start-date').value);
        const reportEndDate = new Date(document.getElementById('report-end-date').value);

        if (isNaN(reportStartDate) || isNaN(reportEndDate)) {
            reportContentDiv.innerHTML = '<p style="color: red;">لطفا تاریخ شروع و پایان گزارش را انتخاب کنید.</p>';
            return;
        }

        reportEndDate.setHours(23, 59, 59, 999); // Include the whole end day

        const filteredInvoices = allInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= reportStartDate && invoiceDate <= reportEndDate;
        });

        let reportHTML = `<h3>گزارش فروش از ${reportStartDate.toLocaleDateString('fa-IR')} تا ${reportEndDate.toLocaleDateString('fa-IR')}</h3>`;
        if(filteredInvoices.length === 0) {
            reportHTML += '<p>هیچ فاکتوری در این بازه زمانی یافت نشد.</p>';
            reportContentDiv.innerHTML = reportHTML;
            return;
        }

        reportHTML += '<ul>';
        let totalSales = 0;

        filteredInvoices.forEach(invoice => {
            reportHTML += `<li>فاکتور شماره ${invoice.id}: ${invoice.total.toLocaleString('fa-IR')} تومان</li>`;
            totalSales += invoice.total;
        });

        reportHTML += '</ul>';
        reportHTML += `<p><strong>مجموع فروش: ${totalSales.toLocaleString('fa-IR')} تومان</strong></p>`;

        reportContentDiv.innerHTML = reportHTML;
    });

    renderDevices();

    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        // Save theme preference
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }

    function setCurrentTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('start-time').value = now.toISOString().slice(0,16);
    }

    setCurrentTime();

    // Initialize date/time pickers
    flatpickr("#start-time", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
    });
    flatpickr("#end-time", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
    });
    flatpickr("#report-start-date", {});
    flatpickr("#report-end-date", {});

    // Tab switching
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tab = link.dataset.tab;

            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            tabContents.forEach(c => c.classList.remove('active'));
            document.getElementById(tab).classList.add('active');
        });
    });

    renderAllInvoices();
    renderProducts();

    const modal = document.getElementById('invoice-modal');
    const closeBtn = document.querySelector('.close-btn');
    const modalInvoiceContent = document.getElementById('modal-invoice-content');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    invoiceListDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-invoice-btn')) {
            const index = e.target.dataset.index;
            const invoice = allInvoices[index];
            let modalHTML = `
                <p><strong>شماره فاکتور:</strong> ${invoice.id}</p>
                <p><strong>تاریخ:</strong> ${new Date(invoice.date).toLocaleString('fa-IR')}</p>
                <ul>
            `;
            invoice.items.forEach(item => {
                modalHTML += `<li>${item.name}: ${item.price.toLocaleString('fa-IR')} تومان</li>`;
            });
            modalHTML += `</ul><p><strong>مجموع: ${invoice.total.toLocaleString('fa-IR')} تومان</strong></p>`;
            modalInvoiceContent.innerHTML = modalHTML;
            modal.style.display = 'block';
        }
    });
});
