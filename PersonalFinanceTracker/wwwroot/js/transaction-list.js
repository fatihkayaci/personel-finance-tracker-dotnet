// Global değişkenler
let deleteTransactionId = null;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners kurulumu
    setupEventListeners();
    
    // Bu ayın başlangıç ve bitiş tarihlerini set et
    setCurrentMonthDates();
    
    // Statik HTML verilerini kontrol et
    checkStaticData();
});

// Event listeners kurulumu
function setupEventListeners() {
    // Arama inputu (300ms gecikme ile)
    document.getElementById('searchInput').addEventListener('input', debounce(filterTable, 300));
    
    // Filter değişiklikleri
    document.getElementById('typeFilter').addEventListener('change', filterTable);
    document.getElementById('categoryFilter').addEventListener('change', filterTable);
    document.getElementById('startDate').addEventListener('change', filterTable);
    document.getElementById('endDate').addEventListener('change', filterTable);
    
    // Delete modal event
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmDelete);
    }
}

// Statik HTML verilerini kontrol et
function checkStaticData() {
    const tbody = document.getElementById('transactions-tbody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        showTable(false);
        showEmptyState(true);
    } else {
        showTable(true);
        showEmptyState(false);
        filterTable(); // İlk filtrelemeyi yap
    }
}

// Tablo filtreleme
function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const rows = document.querySelectorAll('#transactions-tbody tr');
    let visibleCount = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    
    rows.forEach(row => {
        let show = true;
        
        // Arama filtresi
        if (searchTerm) {
            const description = row.cells[3].textContent.toLowerCase();
            const category = row.cells[2].textContent.toLowerCase();
            if (!description.includes(searchTerm) && !category.includes(searchTerm)) {
                show = false;
            }
        }
        
        // Tip filtresi
        if (typeFilter && row.dataset.type !== typeFilter) {
            show = false;
        }
        
        // Kategori filtresi
        if (categoryFilter && row.dataset.category !== categoryFilter) {
            show = false;
        }
        
        // Tarih filtresi
        if (startDate && row.dataset.date < startDate) {
            show = false;
        }
        
        if (endDate && row.dataset.date > endDate) {
            show = false;
        }
        
        row.style.display = show ? '' : 'none';
        
        if (show) {
            visibleCount++;
            // Filtrelenmiş toplamları hesapla
            const amountText = row.cells[4].textContent.replace(/[^\d,.-]/g, '').replace(',', '.');
            const amount = parseFloat(amountText) || 0;
            if (row.dataset.type === '1') {
                totalIncome += amount;
            } else if (row.dataset.type === '2') {
                totalExpense += amount;
            }
        }
    });
    
    // Boş durum kontrolü
    document.getElementById('empty-state').style.display = visibleCount === 0 ? 'block' : 'none';
    document.getElementById('transactions-table').style.display = visibleCount === 0 ? 'none' : 'block';
    
    // Kayıt sayısını güncelle
    document.getElementById('record-info').textContent = `${visibleCount} kayıt görüntüleniyor`;
    
    // Filtrelenmiş özet bilgileri güncelle
    updateFilteredSummary(totalIncome, totalExpense, visibleCount);
}

// Filtrelenmiş özet bilgileri güncelle
function updateFilteredSummary(income, expense, count) {
    const balance = income - expense;
    
    document.getElementById('filtered-income').textContent = formatCurrency(income);
    document.getElementById('filtered-expense').textContent = formatCurrency(expense);
    document.getElementById('filtered-balance').textContent = formatCurrency(balance);
    document.getElementById('filtered-count').textContent = count;
}

// Hızlı tarih filtreleri
function setDateFilter(period) {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];
    
    // Önceki aktif butonu kaldır
    document.querySelectorAll('.btn-group .btn').forEach(btn => btn.classList.remove('active'));
    
    switch(period) {
        case 'all':
            startDate = '';
            endDate = '';
            break;
        case 'today':
            startDate = endDate;
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            startDate = weekStart.toISOString().split('T')[0];
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            break;
        case 'year':
            startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
            break;
    }
    
    document.getElementById('startDate').value = startDate;
    document.getElementById('endDate').value = endDate;
    
    // Aktif butonu işaretle
    event.target.classList.add('active');
    
    filterTable();
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
    
    // Tümü butonunu aktif yap
    document.querySelectorAll('.btn-group .btn').forEach(btn => btn.classList.remove('active'));
    const allButton = document.querySelector('[onclick="setDateFilter(\'all\')"]');
    if (allButton) allButton.classList.add('active');
    
    filterTable();
}

// İşlem düzenleme
function editTransaction(id) {
    window.location.href = `/Transaction/Edit/${id}`;
}

// İşlem silme modal'ını göster
function deleteTransaction(id, description, amount, type) {
    deleteTransactionId = id;
    
    const info = document.getElementById('delete-transaction-info');
    const isIncome = type === 1;
    const typeText = isIncome ? 'Gelir' : 'Gider';
    const amountPrefix = isIncome ? '+' : '-';
    
    if (info) {
        info.innerHTML = `
            <div class="d-flex justify-content-between">
                <div>
                    <strong>${description || 'Açıklama yok'}</strong><br>
                    <small class="text-muted">${typeText}</small>
                </div>
                <div class="text-end">
                    <span class="fw-bold text-${isIncome ? 'success' : 'danger'}">
                        ${amountPrefix}${formatCurrency(amount)}
                    </span>
                </div>
            </div>
        `;
    }
    
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
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('İşlem başarıyla silindi', 'success');
            
            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            modal.hide();
            
            // Sayfayı yenile
            setTimeout(() => window.location.reload(), 1000);
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
    const visibleRows = Array.from(document.querySelectorAll('#transactions-tbody tr'))
        .filter(row => row.style.display !== 'none');
    
    if (visibleRows.length === 0) {
        showToast('Dışa aktarılacak veri bulunamadı', 'error');
        return;
    }
    
    let csv = 'Tarih,Tip,Kategori,Açıklama,Tutar\n';
    
    visibleRows.forEach(row => {
        const cells = Array.from(row.cells).slice(0, 5); // İşlemler sütununu hariç tut
        const csvRow = cells.map(cell => `"${cell.textContent.trim()}"`).join(',');
        csv += csvRow + '\n';
    });
    
    // CSV dosyasını indir
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `islemler_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Print
function printTable() {
    window.print();
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount || 0);
}

function getAntiForgeryToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value || '';
}

function showToast(message, type = 'success') {
    // Bootstrap toast varsa kullan, yoksa alert
    const toastElement = document.getElementById(type === 'success' ? 'successToast' : 'errorToast');
    if (toastElement) {
        const messageElement = toastElement.querySelector('.toast-body');
        if (messageElement) messageElement.textContent = message;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    } else {
        alert(message);
    }
}

// Loading/Table/EmptyState kontrolleri
function showTable(show) {
    const tableElement = document.getElementById('transactions-table');
    if (tableElement) tableElement.style.display = show ? 'block' : 'none';
}

function showEmptyState(show) {
    const emptyElement = document.getElementById('empty-state');
    if (emptyElement) emptyElement.style.display = show ? 'block' : 'none';
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