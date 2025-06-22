// wwwroot/js/dashboard.js

// Sayfa yüklendiğinde çalışır
document.addEventListener('DOMContentLoaded', function () {
    // AJAX çağrıları kaldırıldı
    console.log('Dashboard yüklendi');
});

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

// Hızlı işlemi kaydet - AJAX kaldırıldı
async function saveQuickTransaction() {
    const amount = document.getElementById('quick-amount').value;
    const description = document.getElementById('quick-description').value;

    // Validasyon
    if (!amount || amount <= 0) {
        alert('Lütfen geçerli bir tutar girin');
        return;
    }

    // Modal'ı kapat
    const modal = bootstrap.Modal.getInstance(document.getElementById('quickAddModal'));
    modal.hide();

    // Transaction/Add sayfasına yönlendir
    window.location.href = '/Transaction/Add';
}

// İşlem sil - AJAX kaldırıldı  
function deleteTransaction(transactionId) {
    if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
        // Form submit ile sil
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/Transaction/Delete/${transactionId}`;
        
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = 'DELETE';
        form.appendChild(methodInput);

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '__RequestVerificationToken';
        tokenInput.value = getAntiForgeryToken();
        form.appendChild(tokenInput);

        document.body.appendChild(form);
        form.submit();
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

// Toast bildirimi göster - basitleştirildi
function showToast(message, type = 'success') {
    alert(message);
}