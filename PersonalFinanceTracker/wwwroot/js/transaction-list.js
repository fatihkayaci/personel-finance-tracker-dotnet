// wwwroot/js/transaction-list.js

// Global değişkenler
let currentPage = 1;
let currentPageSize = 25;
let currentSort = { field: 'date', direction: 'desc' };
let allTransactions = [];
let filteredTransactions = [];
let deleteTransactionId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yüklendiğinde
    loadCategories();
    loadTransactions();
    
    // Bu ayın başlangıç ve bitiş tarihlerini set et
    setCurrentMonthDates();
    
    // Event listeners
    setupEventListeners();
});

// Event listeners kurulumu
function setupEventListeners() {
    // Arama inputu
    document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 300));
    
    // Filter değişiklikleri
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('startDate').addEventListener('change', applyFilters);
    document.getElementById('endDate').addEventListener('change', applyFilters);
    
    // Delete modal event
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
}

// Kategorileri yükle
async function loadCategories() {
    try {
        const response = await fetch('/Transaction/GetCategories');
        const data = await response.json();
        
        if (data.success) {
            const categorySelect = document.getElementById('categoryFilter');
            
            // Mevcut kategoriler temizle (ilk option hariç)
            while (categorySelect.children.length > 1) {
                categorySelect.removeChild(categorySelect.lastChild);
            }
            
            // Yeni kategorileri ekle
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
    }
}

// İşlemleri yükle
async function loadTransactions() {
    showLoading(true);
    
    try {
        const response = await fetch('/Transaction/GetAll');
        const data = await response.json();
        
        if (data.success) {
            allTransactions = data.transactions;
            applyFilters();
        } else {
            showError('İşlemler yüklenemedi: ' + data.message);
        }
    } catch (error) {
        console.error('İşlemler yüklenirken hata:', error);
        showError('Bağlantı hatası oluştu');
    } finally {
        showLoading(false);
    }
}

// Filtreleri uygula
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    filteredTransactions = allTransactions.filter(transaction => {
        // Arama filtresi
        if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Tip filtresi
        if (typeFilter && transaction.type !== typeFilter) {
            return false;
        }
        
        // Kategori filtresi
        if (categoryFilter && transaction.categoryId != categoryFilter) {
            return false;
        }
        
        // Tarih filtresi
        const transactionDate = new Date(transaction.date);
        if (startDate && transactionDate < new Date(startDate)) {
            return false;
        }
        if (endDate && transactionDate > new Date(endDate)) {
            return false;
        }
        
        return true;
    });
    
    // Sıralama uygula
    applySorting();
    
    // Özet güncelle
    updateSummary();
    
    // Tabloyu güncelle
    currentPage = 1;
    updateTable();
}

// Sıralama uygula
function applySorting() {
    filteredTransactions.sort((a, b) => {
        let aValue = a[currentSort.field];
        let bValue = b[currentSort.field];
        
        if (currentSort.field === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (currentSort.field === 'amount') {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        }
        
        if (aValue < bValue) {
            return currentSort.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return currentSort.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

// Özet bilgileri güncelle
function updateSummary() {
    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const netBalance = totalIncome - totalExpense;
    const transactionCount = filteredTransactions.length;
    
    document.getElementById('filtered-income').textContent = formatCurrency(totalIncome);
    document.getElementById('filtered-expense').textContent = formatCurrency(totalExpense);
    document.getElementById('filtered-balance').textContent = formatCurrency(netBalance);
    document.getElementById('filtered-count').textContent = transactionCount;
}

// Tabloyu güncelle
function updateTable() {
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    const pageTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    const tbody = document.getElementById('transactions-tbody');
    
    if (pageTransactions.length === 0) {
        showEmptyState(true);
        showTable(false);
        return;
    }
    
    showEmptyState(false);
    showTable(true);
    
    // Tablo içeriğini oluştur
    let html = '';
    pageTransactions.forEach(transaction => {
        const isIncome = transaction.type === 'income';
        const typeClass = isIncome ? 'success' : 'danger';
        const typeIcon = isIncome ? 'fa-arrow-up' : 'fa-arrow-down';
        const amountPrefix = isIncome ? '+' : '-';
        
        html += `
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td>
                    <span class="badge bg-${typeClass}">
                        <i class="fas ${typeIcon} me-1"></i>
                        ${isIncome ? 'Gelir' : 'Gider'}
                    </span>
                </td>
                <td>${transaction.categoryName}</td>
                <td>
                    <span class="text-truncate d-inline-block" style="max-width: 200px;" 
                          title="${transaction.description}">
                        ${transaction.description}
                    </span>
                </td>
                <td>
                    <span class="fw-bold text-${typeClass}">
                        ${amountPrefix}${formatCurrency(transaction.amount)}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a href="/Transaction/Edit/${transaction.id}" 
                           class="btn btn-outline-primary" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-outline-danger" 
                                onclick="showDeleteModal(${transaction.id}, '${transaction.description}', ${transaction.amount}, '${transaction.type}')" 
                                title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Pagination güncelle
    updatePagination();
}

// Pagination güncelle
function updatePagination() {
    const totalPages = Math.ceil(filteredTransactions.length / currentPageSize);
    const pagination = document.getElementById('pagination');
    
    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a></li>`;
    }
    
    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    pagination.innerHTML = html;
}

// Sayfa değiştir
function changePage(page) {
    const totalPages = Math.ceil(filteredTransactions.length / currentPageSize);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateTable();
    }
}

// Sayfa boyutu değiştir
function changePageSize() {
    currentPageSize = parseInt(document.getElementById('pageSize').value);
    currentPage = 1;
    updateTable();
}

// Tablo sırala
function sortTable(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'desc';
    }
    
    // Sort icon'ları güncelle
    document.querySelectorAll('[id^="sort-"]').forEach(icon => {
        icon.className = 'fas fa-sort ms-1';
    });
    
    const icon = document.getElementById(`sort-${field}`);
    icon.className = `fas fa-sort-${currentSort.direction === 'asc' ? 'up' : 'down'} ms-1`;
    
    applySorting();
    updateTable();
}

// Tarih filtresi ayarla
function setDateFilter(period) {
    const now = new Date();
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    endDate.value = now.toISOString().split('T')[0];
    
    switch (period) {
        case 'today':
            startDate.value = now.toISOString().split('T')[0];
            break;
        case 'week':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            startDate.value = weekStart.toISOString().split('T')[0];
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.value = monthStart.toISOString().split('T')[0];
            break;
        case 'year':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            startDate.value = yearStart.toISOString().split('T')[0];
            break;
    }
    
    applyFilters();
}

// Bu ayın tarihlerini set et
function setCurrentMonthDates() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    document.getElementById('startDate').value = monthStart.toISOString().split('T')[0];
    document.getElementById('endDate').value = monthEnd.toISOString().split('T')[0];
}

// Filtreleri temizle
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    applyFilters();
}

// Silme modal'ını göster
function showDeleteModal(id, description, amount, type) {
    deleteTransactionId = id;
    
    const info = document.getElementById('delete-transaction-info');
    const isIncome = type === 'income';
    const typeText = isIncome ? 'Gelir' : 'Gider';
    const amountPrefix = isIncome ? '+' : '-';
    
    info.innerHTML = `
        <div class="d-flex justify-content-between">
            <div>
                <strong>${description}</strong><br>
                <small class="text-muted">${typeText}</small>
            </div>
            <div class="text-end">
                <span class="fw-bold text-${isIncome ? 'success' : 'danger'}">
                    ${amountPrefix}${formatCurrency(amount)}
                </span>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// Silmeyi onayla
async function confirmDelete() {
    if (!deleteTransactionId) return;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Siliniyor...';
    
    try {
        const response = await fetch(`/Transaction/Delete/${deleteTransactionId}`, {
            method: 'DELETE',
            headers: {
                'RequestVerificationToken': getAntiForgeryToken()
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('İşlem başarıyla silindi', 'success');
            
            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            modal.hide();
            
            // Listeyi yenile
            loadTransactions();
        } else {
            showToast(result.message || 'İşlem silinemedi', 'error');
        }
    } catch (error) {
        console.error('Silme hatası:', error);
        showToast('Bağlantı hatası oluştu', 'error');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-trash me-2"></i>Sil';
        deleteTransactionId = null;
    }
}

// CSV export
function exportToCSV() {
    if (filteredTransactions.length === 0) {
        showToast('Export edilecek işlem bulunamadı', 'error');
        return;
    }
    
    const headers = ['Tarih', 'Tip', 'Kategori', 'Açıklama', 'Tutar'];
    const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(t => [
            t.date,
            t.type === 'income' ? 'Gelir' : 'Gider',
            t.categoryName,
            `"${t.description}"`,
            t.amount
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `islemler_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast('CSV dosyası indirildi', 'success');
}

// Yazdır
function printTable() {
    const printWindow = window.open('', '_blank');
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>İşlem Listesi</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .text-success { color: #28a745; }
                .text-danger { color: #dc3545; }
                .header { text-align: center; margin-bottom: 20px; }
                .summary { display: flex; justify-content: space-around; margin: 20px 0; }
                .summary-item { text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>İşlem Listesi</h1>
                <p>Yazdırma Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>
            
            <div class="summary">
                <div class="summary-item">
                    <strong>Toplam Gelir:</strong><br>
                    ${document.getElementById('filtered-income').textContent}
                </div>
                <div class="summary-item">
                    <strong>Toplam Gider:</strong><br>
                    ${document.getElementById('filtered-expense').textContent}
                </div>
                <div class="summary-item">
                    <strong>Net Bakiye:</strong><br>
                    ${document.getElementById('filtered-balance').textContent}
                </div>
                <div class="summary-item">
                    <strong>İşlem Sayısı:</strong><br>
                    ${document.getElementById('filtered-count').textContent}
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Tarih</th>
                        <th>Tip</th>
                        <th>Kategori</th>
                        <th>Açıklama</th>
                        <th>Tutar</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredTransactions.map(t => `
                        <tr>
                            <td>${formatDate(t.date)}</td>
                            <td>${t.type === 'income' ? 'Gelir' : 'Gider'}</td>
                            <td>${t.categoryName}</td>
                            <td>${t.description}</td>
                            <td class="text-${t.type === 'income' ? 'success' : 'danger'}">
                                ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Loading göster/gizle
function showLoading(show) {
    document.getElementById('loading-spinner').style.display = show ? 'block' : 'none';
}

// Tablo göster/gizle
function showTable(show) {
    document.getElementById('transactions-table').style.display = show ? 'block' : 'none';
}

// Boş durum göster/gizle
function showEmptyState(show) {
    document.getElementById('empty-state').style.display = show ? 'block' : 'none';
}

// Hata göster
function showError(message) {
    showLoading(false);
    showTable(false);
    showEmptyState(false);
    
    const tbody = document.getElementById('transactions-tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <i class="fas fa-exclamation-triangle text-warning fa-2x mb-2"></i><br>
                <span class="text-muted">${message}</span><br>
                <button class="btn btn-primary btn-sm mt-2" onclick="loadTransactions()">
                    Tekrar Dene
                </button>
            </td>
        </tr>
    `;
    showTable(true);
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount || 0);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

function getAntiForgeryToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value || '';
}

function showToast(message, type = 'success') {
    const toastElement = document.getElementById(type === 'success' ? 'successToast' : 'errorToast');
    const messageElement = document.getElementById(type === 'success' ? 'successMessage' : 'errorMessage');
    
    if (toastElement && messageElement) {
        messageElement.textContent = message;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    } else {
        alert(message);
    }
}

// Debounce function (arama için)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}