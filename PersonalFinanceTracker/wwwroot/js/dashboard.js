// wwwroot/js/dashboard.js

// Sayfa yüklendiğinde çalışır
document.addEventListener('DOMContentLoaded', function () {
    loadDashboardData();
    loadRecentTransactions();
});

// Dashboard verilerini yükle
async function loadDashboardData() {
    try {
        const response = await fetch('/Dashboard/GetSummary');
        const data = await response.json();

        if (data.success) {
            updateSummaryCards(data.summary);
        }
    } catch (error) {
        console.error('Dashboard yüklenirken hata:', error);
        showToast('Dashboard yüklenirken hata oluştu', 'error');
    }
}

// Özet kartları güncelle
function updateSummaryCards(summary) {
    // Toplam değerler
    document.getElementById('total-income').textContent = formatCurrency(summary.totalIncome);
    document.getElementById('total-expense').textContent = formatCurrency(summary.totalExpense);
    document.getElementById('net-balance').textContent = formatCurrency(summary.netBalance);
    document.getElementById('total-transactions').textContent = summary.totalTransactions;

    // Aylık değerler
    document.getElementById('monthly-income').textContent = formatCurrency(summary.monthlyIncome);
    document.getElementById('monthly-expense').textContent = formatCurrency(summary.monthlyExpense);
    document.getElementById('monthly-balance').textContent = formatCurrency(summary.monthlyBalance);
    document.getElementById('monthly-transactions').textContent = summary.monthlyTransactions;

    // Bugünkü değerler
    document.getElementById('today-income').textContent = '+' + formatCurrency(summary.todayIncome);
    document.getElementById('today-expense').textContent = '-' + formatCurrency(summary.todayExpense);
    document.getElementById('today-balance').textContent = formatCurrency(summary.todayBalance);

    // Bakiye kartının rengini güncelle
    const balanceCard = document.getElementById('balance-card');
    if (summary.netBalance < 0) {
        balanceCard.classList.add('negative');
    } else {
        balanceCard.classList.remove('negative');
    }
}

// Son işlemleri yükle
async function loadRecentTransactions() {
    try {
        const response = await fetch('/Dashboard/GetRecentTransactions');
        const data = await response.json();

        if (data.success) {
            displayRecentTransactions(data.transactions);
        }
    } catch (error) {
        console.error('Son işlemler yüklenirken hata:', error);
        document.getElementById('recent-transactions').innerHTML =
            '<div class="text-center py-4"><span class="text-muted">İşlemler yüklenemedi</span></div>';
    }
}

// Son işlemleri göster
function displayRecentTransactions(transactions) {
    const container = document.getElementById('recent-transactions');

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">Henüz işlem yok</h6>
                <button class="btn btn-primary mt-2" onclick="quickAdd('expense', 'other', 'İlk İşlem')">
                    İlk İşlemi Ekle
                </button>
            </div>
        `;
        return;
    }

    let html = '<div class="list-group list-group-flush">';

    transactions.forEach(transaction => {
        const isIncome = transaction.type === 'income';
        const iconClass = isIncome ? 'fa-arrow-up text-success' : 'fa-arrow-down text-danger';
        const amountClass = isIncome ? 'text-success' : 'text-danger';
        const amountPrefix = isIncome ? '+' : '-';

        html += `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <span class="badge ${isIncome ? 'bg-success' : 'bg-danger'} rounded-pill">
                            <i class="fas ${iconClass}"></i>
                        </span>
                    </div>
                    <div>
                        <h6 class="mb-0">${transaction.description}</h6>
                        <small class="text-muted">
                            ${transaction.category} • ${formatDate(transaction.date)}
                        </small>
                    </div>
                </div>
                <div class="text-end">
                    <span class="${amountClass} fw-bold">
                        ${amountPrefix}${formatCurrency(transaction.amount)}
                    </span>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="/Transaction/Edit/${transaction.id}">
                                <i class="fas fa-edit me-2"></i>Düzenle
                            </a></li>
                            <li><a class="dropdown-item text-danger" onclick="deleteTransaction(${transaction.id})">
                                <i class="fas fa-trash me-2"></i>Sil
                            </a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Hızlı işlem ekleme modal'ını aç
function quickAdd(type, category, categoryName) {
    document.getElementById('quick-type').value = type;
    document.getElementById('quick-category').value = category;
    document.getElementById('quick-category-display').textContent = categoryName;

    const modalTitle = document.getElementById('quick-modal-title');
    const icon = type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down';
    const color = type === 'income' ? 'text-success' : 'text-danger';
    modalTitle.innerHTML = `<i class="fas ${icon} ${color} me-2"></i>${categoryName} ${type === 'income' ? 'Geliri' : 'Gideri'}`;

    // Formu temizle
    document.getElementById('quick-amount').value = '';
    document.getElementById('quick-description').value = '';

    // Modal'ı aç
    const modal = new bootstrap.Modal(document.getElementById('quickAddModal'));
    modal.show();

    // Amount input'a focus
    setTimeout(() => {
        document.getElementById('quick-amount').focus();
    }, 500);
}

// Hızlı işlemi kaydet
async function saveQuickTransaction() {
    const amount = document.getElementById('quick-amount').value;
    const description = document.getElementById('quick-description').value;
    const type = document.getElementById('quick-type').value;
    const category = document.getElementById('quick-category').value;

    // Validasyon
    if (!amount || amount <= 0) {
        showToast('Lütfen geçerli bir tutar girin', 'error');
        return;
    }

    // Veriyi hazırla
    const transactionData = {
        amount: parseFloat(amount),
        description: description || `${document.getElementById('quick-category-display').textContent} işlemi`,
        type: type,
        category: category,
        date: new Date().toISOString().split('T')[0]
    };

    try {
        // Backend'e gönder
        const response = await fetch('/Transaction/QuickAdd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify(transactionData)
        });

        const result = await response.json();

        if (result.success) {
            // Başarılı
            showToast('İşlem başarıyla eklendi! 🎉', 'success');

            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickAddModal'));
            modal.hide();

            // Dashboard'ı yenile
            refreshDashboard();
        } else {
            showToast(result.message || 'İşlem eklenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('İşlem ekleme hatası:', error);
        showToast('Bağlantı hatası oluştu', 'error');
    }
}

// Dashboard'ı yenile
function refreshDashboard() {
    loadDashboardData();
    loadRecentTransactions();
    showToast('Dashboard yenilendi', 'success');
}

// İşlem sil
async function deleteTransaction(transactionId) {
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const response = await fetch(`/Transaction/Delete/${transactionId}`, {
            method: 'DELETE',
            headers: {
                'RequestVerificationToken': getAntiForgeryToken()
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast('İşlem silindi', 'success');
            refreshDashboard();
        } else {
            showToast(result.message || 'İşlem silinemedi', 'error');
        }
    } catch (error) {
        console.error('İşlem silme hatası:', error);
        showToast('Bağlantı hatası oluştu', 'error');
    }
}

// Para formatı
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount || 0);
}

// Tarih formatı
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short'
    });
}

// Anti-forgery token al
function getAntiForgeryToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value || '';
}

// Toast bildirimi göster
function showToast(message, type = 'success') {
    const toastElement = document.getElementById(type === 'success' ? 'successToast' : 'errorToast');
    const messageElement = document.getElementById(type === 'success' ? 'successMessage' : 'errorMessage');

    messageElement.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}