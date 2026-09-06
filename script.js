// ===== متغيرات البيانات =====
let products = [];
let customers = [];
let salesInvoices = [];
let purchasesInvoices = [];
let settings = {
    storeName: 'مخزن عين شمس',
    storeAddress: '',
    storePhone: '',
    storeEmail: ''
};

// ===== تحميل البيانات من localStorage =====
function loadData() {
    const savedProducts = localStorage.getItem('products');
    const savedCustomers = localStorage.getItem('customers');
    const savedSalesInvoices = localStorage.getItem('salesInvoices');
    const savedPurchasesInvoices = localStorage.getItem('purchasesInvoices');
    const savedSettings = localStorage.getItem('settings');

    if (savedProducts) products = JSON.parse(savedProducts);
    if (savedCustomers) customers = JSON.parse(savedCustomers);
    if (savedSalesInvoices) salesInvoices = JSON.parse(savedSalesInvoices);
    if (savedPurchasesInvoices) purchasesInvoices = JSON.parse(savedPurchasesInvoices);
    if (savedSettings) settings = JSON.parse(savedSettings);

    updateDashboard();
    refreshTables();
}

// ===== حفظ البيانات في localStorage =====
function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('salesInvoices', JSON.stringify(salesInvoices));
    localStorage.setItem('purchasesInvoices', JSON.stringify(purchasesInvoices));
    localStorage.setItem('settings', JSON.stringify(settings));
}

// ===== تحديث لوحة التحكم =====
function updateDashboard() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalCustomers').textContent = customers.length;
    
    const totalSales = salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalPrice || 0), 0);
    const totalPurchases = purchasesInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalPrice || 0), 0);
    
    document.getElementById('totalSales').textContent = totalSales.toFixed(2) + ' جنيه';
    document.getElementById('totalPurchases').textContent = totalPurchases.toFixed(2) + ' جنيه';
}

// ===== نافذة الأصناف =====
function openProductModal() {
    document.getElementById('productModal').classList.add('show');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('show');
    document.getElementById('productName').value = '';
    document.getElementById('productType').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
}

function saveProduct(event) {
    event.preventDefault();
    
    const product = {
        id: Date.now(),
        code: 'PRD-' + products.length + 1,
        name: document.getElementById('productName').value,
        type: document.getElementById('productType').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        dateAdded: new Date().toLocaleDateString('ar-EG')
    };

    products.push(product);
    saveData();
    updateDashboard();
    refreshProductsTable();
    closeProductModal();
    showNotification('تم إضافة الصنف بنجاح');
}

function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
        products = products.filter(p => p.id !== id);
        saveData();
        updateDashboard();
        refreshProductsTable();
        showNotification('تم حذف الصنف بنجاح');
    }
}

function refreshProductsTable() {
    const table = document.getElementById('productsTable');
    table.innerHTML = '';

    products.forEach(product => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>${product.type}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">حذف</button>
            </td>
        `;
    });
}

// ===== نافذة العملاء =====
function openCustomerModal() {
    document.getElementById('customerModal').classList.add('show');
}

function closeCustomerModal() {
    document.getElementById('customerModal').classList.remove('show');
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerEmail').value = '';
}

function saveCustomer(event) {
    event.preventDefault();
    
    const customer = {
        id: Date.now(),
        code: 'CUST-' + customers.length + 1,
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        email: document.getElementById('customerEmail').value,
        dateAdded: new Date().toLocaleDateString('ar-EG')
    };

    customers.push(customer);
    saveData();
    updateDashboard();
    refreshCustomersTable();
    refreshCustomersSelect();
    closeCustomerModal();
    showNotification('تم إضافة العميل بنجاح');
}

function deleteCustomer(id) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        customers = customers.filter(c => c.id !== id);
        saveData();
        updateDashboard();
        refreshCustomersTable();
        refreshCustomersSelect();
        showNotification('تم حذف العميل بنجاح');
    }
}

function refreshCustomersTable() {
    const table = document.getElementById('customersTable');
    table.innerHTML = '';

    customers.forEach(customer => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${customer.code}</td>
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.address}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteCustomer(${customer.id})">حذف</button>
            </td>
        `;
    });
}

function refreshCustomersSelect() {
    const select = document.getElementById('salesCustomer');
    select.innerHTML = '<option value="">-- اختر عميل --</option>';
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

// ===== فواتير البيع =====
function openSalesInvoiceModal() {
    document.getElementById('salesInvoiceModal').classList.add('show');
    refreshProductsSelect('sales');
    refreshCustomersSelect();
}

function closeSalesInvoiceModal() {
    document.getElementById('salesInvoiceModal').classList.remove('show');
}

function saveSalesInvoice(event) {
    event.preventDefault();

    const customerId = parseInt(document.getElementById('salesCustomer').value);
    const productId = parseInt(document.getElementById('salesProduct').value);
    const customer = customers.find(c => c.id === customerId);
    const product = products.find(p => p.id === productId);

    if (!customer || !product) {
        alert('يرجى اختيار عميل وصنف صحيح');
        return;
    }

    const invoice = {
        id: Date.now(),
        invoiceNumber: 'SALE-' + (salesInvoices.length + 1),
        date: new Date().toLocaleDateString('ar-EG'),
        customerId: customerId,
        customerName: customer.name,
        productId: productId,
        productName: product.name,
        quantity: parseInt(document.getElementById('salesQuantity').value),
        totalPrice: parseFloat(document.getElementById('salesTotalPrice').value),
        notes: document.getElementById('salesNotes').value
    };

    // تحديث كمية المنتج
    product.quantity -= invoice.quantity;
    if (product.quantity < 0) product.quantity = 0;

    salesInvoices.push(invoice);
    saveData();
    updateDashboard();
    refreshSalesTable();
    closeSalesInvoiceModal();
    showNotification('تم إنشاء فاتورة البيع بنجاح');
}

function deleteSalesInvoice(id) {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
        const invoice = salesInvoices.find(i => i.id === id);
        if (invoice) {
            const product = products.find(p => p.id === invoice.productId);
            if (product) {
                product.quantity += invoice.quantity;
            }
        }
        salesInvoices = salesInvoices.filter(i => i.id !== id);
        saveData();
        updateDashboard();
        refreshSalesTable();
        showNotification('تم حذف الفاتورة بنجاح');
    }
}

function refreshSalesTable() {
    const table = document.getElementById('salesTable');
    table.innerHTML = '';

    salesInvoices.forEach(invoice => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${invoice.invoiceNumber}</td>
            <td>${invoice.date}</td>
            <td>${invoice.customerName}</td>
            <td>${invoice.totalPrice.toFixed(2)}</td>
            <td>
                <button class="btn btn-info" onclick="printSalesInvoice(${invoice.id})">طباعة</button>
                <button class="btn btn-danger" onclick="deleteSalesInvoice(${invoice.id})">حذف</button>
            </td>
        `;
    });
}

function printSalesInvoice(id) {
    const invoice = salesInvoices.find(i => i.id === id);
    if (!invoice) return;

    const printContent = generateInvoiceHTML(invoice, 'بيع');
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// ===== فواتير الشراء =====
function openPurchasesInvoiceModal() {
    document.getElementById('purchasesInvoiceModal').classList.add('show');
    refreshProductsSelect('purchases');
}

function closePurchasesInvoiceModal() {
    document.getElementById('purchasesInvoiceModal').classList.remove('show');
}

function savePurchasesInvoice(event) {
    event.preventDefault();

    const productId = parseInt(document.getElementById('purchasesProduct').value);
    const product = products.find(p => p.id === productId);

    if (!product) {
        alert('يرجى اختيار صنف صحيح');
        return;
    }

    const invoice = {
        id: Date.now(),
        invoiceNumber: 'PURCHASE-' + (purchasesInvoices.length + 1),
        date: new Date().toLocaleDateString('ar-EG'),
        supplier: document.getElementById('purchasesSupplier').value,
        productId: productId,
        productName: product.name,
        quantity: parseInt(document.getElementById('purchasesQuantity').value),
        totalPrice: parseFloat(document.getElementById('purchasesTotalPrice').value),
        notes: document.getElementById('purchasesNotes').value
    };

    // تحديث كمية المنتج
    product.quantity += invoice.quantity;

    purchasesInvoices.push(invoice);
    saveData();
    updateDashboard();
    refreshPurchasesTable();
    closePurchasesInvoiceModal();
    showNotification('تم إنشاء فاتورة الشراء بنجاح');
}

function deletePurchasesInvoice(id) {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
        const invoice = purchasesInvoices.find(i => i.id === id);
        if (invoice) {
            const product = products.find(p => p.id === invoice.productId);
            if (product) {
                product.quantity -= invoice.quantity;
            }
        }
        purchasesInvoices = purchasesInvoices.filter(i => i.id !== id);
        saveData();
        updateDashboard();
        refreshPurchasesTable();
        showNotification('تم حذف الفاتورة بنجاح');
    }
}

function refreshPurchasesTable() {
    const table = document.getElementById('purchasesTable');
    table.innerHTML = '';

    purchasesInvoices.forEach(invoice => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${invoice.invoiceNumber}</td>
            <td>${invoice.date}</td>
            <td>${invoice.supplier}</td>
            <td>${invoice.totalPrice.toFixed(2)}</td>
            <td>
                <button class="btn btn-info" onclick="printPurchasesInvoice(${invoice.id})">طباعة</button>
                <button class="btn btn-danger" onclick="deletePurchasesInvoice(${invoice.id})">حذف</button>
            </td>
        `;
    });
}

function printPurchasesInvoice(id) {
    const invoice = purchasesInvoices.find(i => i.id === id);
    if (!invoice) return;

    const printContent = generateInvoiceHTML(invoice, 'شراء');
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// ===== توليد HTML الفاتورة =====
function generateInvoiceHTML(invoice, type) {
    const logo = '🏭';
    const isArabic = type === 'بيع' ? 'فاتورة بيع' : 'فاتورة شراء';
    
    return `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    direction: rtl;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .invoice {
                    background-color: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #667eea;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    margin: 0;
                    color: #667eea;
                    font-size: 28px;
                }
                .header p {
                    margin: 5px 0;
                    color: #666;
                }
                .invoice-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                }
                .info-group {
                    display: flex;
                    justify-content: space-between;
                }
                .info-group label {
                    font-weight: bold;
                    color: #2c3e50;
                }
                .table-section {
                    margin-top: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                thead {
                    background-color: #34495e;
                    color: white;
                }
                th, td {
                    padding: 12px;
                    text-align: right;
                    border-bottom: 1px solid #ddd;
                }
                tbody tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .total-section {
                    text-align: left;
                    margin-top: 30px;
                    padding: 15px;
                    background-color: #ecf0f1;
                    border-radius: 5px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    font-size: 16px;
                }
                .total-row.grand-total {
                    border-top: 2px solid #667eea;
                    padding-top: 10px;
                    font-weight: bold;
                    font-size: 18px;
                    color: #667eea;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #999;
                    font-size: 12px;
                }
                .notes {
                    background-color: #fff3cd;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                @media print {
                    body { background-color: white; }
                    .invoice { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="invoice">
                <div class="header">
                    <h1>${logo} ${isArabic}</h1>
                    <p>${settings.storeName}</p>
                    <p>نظام إدارة المخزن</p>
                </div>

                <div class="invoice-info">
                    <div>
                        <div class="info-group">
                            <label>رقم الفاتورة:</label>
                            <span>${invoice.invoiceNumber}</span>
                        </div>
                        <div class="info-group">
                            <label>التاريخ:</label>
                            <span>${invoice.date}</span>
                        </div>
                    </div>
                    <div>
                        ${type === 'بيع' ? `
                            <div class="info-group">
                                <label>العميل:</label>
                                <span>${invoice.customerName}</span>
                            </div>
                        ` : `
                            <div class="info-group">
                                <label>المورد:</label>
                                <span>${invoice.supplier}</span>
                            </div>
                        `}
                        <div class="info-group">
                            <label>التاريخ والوقت:</label>
                            <span>${new Date().toLocaleString('ar-EG')}</span>
                        </div>
                    </div>
                </div>

                <div class="table-section">
                    <table>
                        <thead>
                            <tr>
                                <th>الصنف</th>
                                <th>الكمية</th>
                                <th>الإجمالي (جنيه)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${invoice.productName}</td>
                                <td>${invoice.quantity}</td>
                                <td>${invoice.totalPrice.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="total-section">
                    <div class="total-row grand-total">
                        <span>الإجمالي:</span>
                        <span>${invoice.totalPrice.toFixed(2)} جنيه</span>
                    </div>
                </div>

                ${invoice.notes ? `
                    <div class="notes">
                        <strong>الملاحظات:</strong>
                        <p>${invoice.notes}</p>
                    </div>
                ` : ''}

                <div class="footer">
                    <p>شكراً لتعاملكم معنا</p>
                    <p>تم الطباعة بواسطة نظام إدارة مخزن عين شمس</p>
                    <p>${new Date().toLocaleDateString('ar-EG')}</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// ===== وظائف إضافية =====
function refreshProductsSelect(type) {
    const select = document.getElementById(type === 'sales' ? 'salesProduct' : 'purchasesProduct');
    select.innerHTML = '<option value="">-- اختر صنف --</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (الكمية: ${product.quantity})`;
        select.appendChild(option);
    });
}

function showPage(pageName) {
    // إخفاء جميع الصفحات
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // عرض الصفحة المحددة
    const selectedPage = document.getElementById(pageName);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    // تحديث الجداول عند عرض الصفحة
    if (pageName === 'products') refreshProductsTable();
    if (pageName === 'customers') refreshCustomersTable();
    if (pageName === 'sales') refreshSalesTable();
    if (pageName === 'purchases') refreshPurchasesTable();
}

function generateSalesReport() {
    let report = 'تقرير المبيعات\n';
    report += '===============\n\n';
    
    salesInvoices.forEach(invoice => {
        report += `الفاتورة: ${invoice.invoiceNumber}\n`;
        report += `العميل: ${invoice.customerName}\n`;
        report += `التاريخ: ${invoice.date}\n`;
        report += `الإجمالي: ${invoice.totalPrice.toFixed(2)} جنيه\n\n`;
    });

    const total = salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalPrice), 0);
    report += `\nإجمالي المبيعات: ${total.toFixed(2)} جنيه`;

    alert(report);
}

function generatePurchasesReport() {
    let report = 'تقرير المشتريات\n';
    report += '===============\n\n';
    
    purchasesInvoices.forEach(invoice => {
        report += `الفاتورة: ${invoice.invoiceNumber}\n`;
        report += `المورد: ${invoice.supplier}\n`;
        report += `التاريخ: ${invoice.date}\n`;
        report += `الإجمالي: ${invoice.totalPrice.toFixed(2)} جنيه\n\n`;
    });

    const total = purchasesInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalPrice), 0);
    report += `\nإجمالي المشتريات: ${total.toFixed(2)} جنيه`;

    alert(report);
}

function generateInventoryReport() {
    let report = 'تقرير المخزون\n';
    report += '==============\n\n';
    
    products.forEach(product => {
        report += `الكود: ${product.code}\n`;
        report += `الصنف: ${product.name}\n`;
        report += `الكمية: ${product.quantity}\n`;
        report += `السعر: ${product.price.toFixed(2)} جنيه\n\n`;
    });

    alert(report);
}

function generateCustomersReport() {
    let report = 'تقرير العملاء\n';
    report += '==============\n\n';
    
    customers.forEach(customer => {
        report += `الكود: ${customer.code}\n`;
        report += `الاسم: ${customer.name}\n`;
        report += `الهاتف: ${customer.phone}\n`;
        report += `العنوان: ${customer.address}\n\n`;
    });

    alert(report);
}

function saveSettings() {
    settings.storeName = document.getElementById('storeName').value;
    settings.storeAddress = document.getElementById('storeAddress').value;
    settings.storePhone = document.getElementById('storePhone').value;
    settings.storeEmail = document.getElementById('storeEmail').value;

    saveData();
    showNotification('تم حفظ الإعدادات بنجاح');
}

function backupData() {
    const dataToBackup = {
        products,
        customers,
        salesInvoices,
        purchasesInvoices,
        settings
    };

    const dataStr = JSON.stringify(dataToBackup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `warehouse-backup-${new Date().getTime()}.json`;
    link.click();

    showNotification('تم تحميل النسخة الاحتياطية بنجاح');
}

function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                products = data.products || [];
                customers = data.customers || [];
                salesInvoices = data.salesInvoices || [];
                purchasesInvoices = data.purchasesInvoices || [];
                settings = data.settings || settings;

                saveData();
                updateDashboard();
                refreshTables();
                showNotification('تم استرجاع البيانات بنجاح');
            } catch (error) {
                alert('خطأ في ملف النسخة الاحتياطية');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا لا يمكن التراجع عنه!')) {
        if (confirm('هذا إجراء نهائي. هل أنت متأكد فعلاً؟')) {
            products = [];
            customers = [];
            salesInvoices = [];
            purchasesInvoices = [];
            settings = {
                storeName: 'مخزن عين شمس',
                storeAddress: '',
                storePhone: '',
                storeEmail: ''
            };

            localStorage.clear();
            updateDashboard();
            refreshTables();
            showNotification('تم حذف جميع البيانات بنجاح');
        }
    }
}

function refreshTables() {
    refreshProductsTable();
    refreshCustomersTable();
    refreshSalesTable();
    refreshPurchasesTable();
}

function showNotification(message) {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // إضافة animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(-400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // إزالة الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    showPage('dashboard');
    
    // تحميل الإعدادات
    document.getElementById('storeName').value = settings.storeName;
    document.getElementById('storeAddress').value = settings.storeAddress;
    document.getElementById('storePhone').value = settings.storePhone;
    document.getElementById('storeEmail').value = settings.storeEmail;

    // إغلاق النوافذ المنبثقة عند الضغط خارجها
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
});