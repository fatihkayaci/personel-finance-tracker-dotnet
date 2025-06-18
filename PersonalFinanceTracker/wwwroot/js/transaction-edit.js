// wwwroot/js/transaction-edit.js

// Global değişkenler
let originalTransaction = null;
let currentFormData = null;

document.addEventListener('DOMContentLoaded', function() {
    // İşlem verilerini yükle
    loadTransaction();
    
    // Event listeners
    setupEventListeners();
});

// Event listeners kurulumu
function setupEventListeners() {
    // İşlem tipi değiştiğinde kategorileri güncelle
    setupTransactionTypeListeners();
    
    // Form submit
    document.getElementById('editTransactionForm').addEventListener('submit', handleFormSubmit);
    
    // Form alanları değiştiğinde değişiklikleri kontrol et
    setupChangeTracking();
    
    // Silme onay modal
    setupDeleteConfirmation();
}

// İşlem verilerini yükle
async function loadTransaction() {
    try {
        showLoadingForm(true);
        
        const response = await fetch(`/Transaction/Get/${transactionId}`);
        const data = await response.json();
        
        if (data.success) {
            originalTransaction = data.transaction;
            populateForm(originalTransaction);
            showEditForm(true);
        } else {
            showErrorState(true);
        }
    } catch (error) {
        console.error('İşlem yüklenirken hata:', error);
        showErrorState(true);
    } finally {
        showLoadingForm(false);
    }
}

// Formu doldur
function populateForm(transaction) {
    // İşlem ID
    document.getElementById('transaction-id').value = transaction.id;
    document.getElementById('transaction-id-badge').textContent = `ID: #${transaction.id}`;
    
    // Mevcut işlem bilgileri
    document.getElementById('current-description').textContent = transaction.description;
    document.getElementById('current-amount').textContent = formatCurrency(transaction.amount);
    document.getElementById('current-amount').className = `fw-bold text-${transaction.type === 'income' ? 'success' : 'danger'}`;
    document.getElementById('current-category').textContent = transaction.categoryName;
    document.getElementById('current-date').textContent = formatDate(transaction.date);
    
    // Form alanları
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('description').value = transaction.description;
    document.getElementById('date').value = transaction.date;
    
    // İşlem tipi
    if (transaction.type === 'income') {
        document.getElementById('incomeRadio').checked = true;
        showIncomeCategories();
    } else {
        document.getElementById('expenseRadio').checked = true;
        showExpenseCategories();
    }
    
    // Kategori seçimi
    document.getElementById('category').value = transaction.categorySlug || transaction.category;
    
    // Değişiklik takibini başlat
    currentFormData = getFormData();
}

// İşlem tipi radio butonlarını dinle
function setupTransactionTypeListeners() {
    const expenseRadio = document.getElementById('expenseRadio');
    const incomeRadio = document.getElementById('incomeRadio');
    
    expenseRadio.addEventListener('change', function() {
        if (this.checked) {
            showExpenseCategories();
            checkForChanges();
        }
    });
    
    incomeRadio.addEventListener('change', function() {
        if (this.checked) {
            showIncomeCategories();
            checkForChanges();
        }
    });
}

// Gider kategorilerini göster
function showExpenseCategories() {
    document.getElementById('expense-categories').style.display = 'block';
    document.getElementById('income-categories').style.display = 'none';
    document.getElementById('category').value = '';
}

// Gelir kategorilerini göster
function showIncomeCategories() {
    document.getElementById('expense-categories').style.display = 'none';
    document.getElementById('income-categories').style.display = 'block';
    document.getElementById('category').value = '';
}

// Değişiklik takibi
function setupChangeTracking() {
    const formInputs = ['amount', 'description', 'date', 'category'];
    const radioInputs = ['expenseRadio', 'incomeRadio'];
    
    formInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('input', checkForChanges);
    });
    
    radioInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('change', checkForChanges);
    });
}

// Değişiklikleri kontrol et
function checkForChanges() {
    const newFormData = getFormData();
    const changes = [];
    
    // Tutar değişikliği
    if (newFormData.amount !== originalTransaction.amount) {
        changes.push(`Tutar: ${formatCurrency(originalTransaction.amount)} → ${formatCurrency(newFormData.amount)}`);
    }
    
    // Açıklama değişikliği
    if (newFormData.description !== originalTransaction.description) {
        changes.push(`Açıklama: "${originalTransaction.description}" → "${newFormData.description}"`);
    }
    
    // Tip değişikliği
    if (newFormData.type !== originalTransaction.type) {
        const oldType = originalTransaction.type === 'income' ? 'Gelir' : 'Gider';
        const newType = newFormData.type === 'income' ? 'Gelir' : 'Gider';
        changes.push(`Tip: ${oldType} → ${newType}`);
    }
    
    // Kategori değişikliği
    if (newFormData.category !== (originalTransaction.categorySlug || originalTransaction.category)) {
        const oldCategory = originalTransaction.categoryName;
        const newCategoryElement = document.querySelector(`#category option[value="${newFormData.category}"]`);
        const newCategory = newCategoryElement ? newCategoryElement.textContent : newFormData.category;
        changes.push(`Kategori: ${oldCategory} → ${newCategory}`);
    }
    
    // Tarih değişikliği
    if (newFormData.date !== originalTransaction.date) {
        changes.push(`Tarih: ${formatDate(originalTransaction.date)} → ${formatDate(newFormData.date)}`);
    }
    
    // Değişiklik özetini göster
    showChangesSummary(changes);
    
    currentFormData = newFormData;
}

// Değişiklik özetini göster
function showChangesSummary(changes) {
    const summaryDiv = document.getElementById('changes-summary');
    const changesList = document.getElementById('changes-list');
    
    if (changes.length > 0) {
        changesList.innerHTML = changes.map(change => `<li>${change}</li>`).join('');
        summaryDiv.style.display = 'block';
    } else {
        summaryDiv.style.display = 'none';
    }
}

// Form verilerini al
function getFormData() {
    return {
        id: parseInt(document.getElementById('transaction-id').value),
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value.trim(),
        type: document.querySelector('input[name="transactionType"]:checked')?.value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };
}

// Form submit işlemi
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = getFormData();
    
    // Validasyon
    if (!validateForm(formData)) {
        return;
    }
    
    const updateButton = document.getElementById('updateButton');
    const buttonText = updateButton.querySelector('.button-text');
    const buttonSpinner = updateButton.querySelector('.button-spinner');
    
    // Button loading state
    updateButton.disabled = true;
    buttonText.classList.add('d-none');
    buttonSpinner.classList.remove('d-none');
    
    try {
        const response = await fetch(`/Transaction/Edit/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('İşlem başarıyla güncellendi! 🎉', 'success');
            
            // 1.5 saniye sonra işlem listesine yönlendir
            setTimeout(() => {
                window.location.href = '/Transaction';
            }, 1500);
        } else {
            showToast(result.message || 'İşlem güncellenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Güncelleme hatası:', error);
        showToast('Bağlantı hatası oluştu', 'error');
    } finally {
        // Button normal state
        updateButton.disabled = false;
        buttonText.classList.remove('d-none');
        buttonSpinner.classList.add('d-none');
    }
}

// Form validasyonu
function validateForm(formData) {
    if (!formData.amount || formData.amount <= 0) {
        showToast('Lütfen geçerli bir tutar girin', 'error');
        document.getElementById('amount').focus();
        return false;
    }
    
    if (!formData.category) {
        showToast('Lütfen bir kategori seçin', 'error');
        document.getElementById('category').focus();
        return false;
    }
    
    if (!formData.description) {
        showToast('Lütfen açıklama girin', 'error');
        document.getElementById('description').focus();
        return false;
    }
    
    if (!formData.date) {
        showToast('Lütfen tarih seçin', 'error');
        document.getElementById('date').focus();
        return false;
    }
    
    if (!formData.type) {
        showToast('Lütfen işlem tipi seçin', 'error');
        return false;
    }
    
    return true;
}

// Silme onayı kurulumu
function setupDeleteConfirmation() {
    const deleteConfirmText = document.getElementById('deleteConfirmText');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    
    deleteConfirmText.addEventListener('input', function() {
        const isValid = this.value.toUpperCase() === 'SİL';
        confirmDeleteButton.disabled = !isValid;
    });
    
    confirmDeleteButton.addEventListener('click', handleDelete);
}

// Silme onayı göster
function showDeleteConfirmation() {
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    
    // İşlem detaylarını doldur
    const detailsDiv = document.getElementById('delete-transaction-details');
    detailsDiv.innerHTML = `
        <div class="d-flex justify-content-between">
            <div>
                <strong>${originalTransaction.description}</strong><br>
                <small class="text-muted">${originalTransaction.categoryName} • ${formatDate(originalTransaction.date)}</small>
            </div>
            <div class="text-end">
                <span class="fw-bold text-${originalTransaction.type === 'income' ? 'success' : 'danger'}">
                    ${originalTransaction.type === 'income' ? '+' : '-'}${formatCurrency(originalTransaction.amount)}
                </span>
            </div>
        </div>
    `;
    
    // Input'u temizle
    document.getElementById('deleteConfirmText').value = '';
    document.getElementById('confirmDeleteButton').disabled = true;
    
    modal.show();
}

// İşlemi sil
async function handleDelete() {
    const confirmButton = document.getElementById('confirmDeleteButton');
    const buttonText = confirmButton.querySelector('.delete-button-text');
    const buttonSpinner = confirmButton.querySelector('.delete-button-spinner');
    
    // Button loading state
    confirmButton.disabled = true;
    buttonText.classList.add('d-none');
    buttonSpinner.classList.remove('d-none');
    
    try {
        const response = await fetch(`/Transaction/Delete/${transactionId}`, {
            method: 'DELETE',
            headers: {
                'RequestVerificationToken': getAntiForgeryToken()
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('İşlem başarıyla silindi', 'success');
            
            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
            modal.hide();
            
            // İşlem listesine yönlendir
            setTimeout(() => {
                window.location.href = '/Transaction';
            }, 1000);
        } else {
            showToast(result.message || 'İşlem silinemedi', 'error');
        }
    } catch (error) {
        console.error('Silme hatası:', error);
        showToast('Bağlantı hatası oluştu', 'error');
    } finally {
        // Button normal state
        confirmButton.disabled = false;
        buttonText.classList.remove('d-none');
        buttonSpinner.classList.add('d-none');
    }
}

// UI durumları
function showLoadingForm(show) {
    document.getElementById('loading-form').style.display = show ? 'block' : 'none';
}

function showEditForm(show) {
    document.getElementById('edit-form').style.display = show ? 'block' : 'none';
}

function showErrorState(show) {
    document.getElementById('error-state').style.display = show ? 'block' : 'none';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + S = Kaydet
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        document.getElementById('editTransactionForm').dispatchEvent(new Event('submit'));
    }
    
    // ESC = İptal
    if (e.key === 'Escape') {
        if (confirm('Değişiklikler kaydedilmedi. Çıkmak istediğinizden emin misiniz?')) {
            window.location.href = '/Transaction';
        }
    }
});

// Sayfa kapatılmadan önce uyarı (değişiklik varsa)
window.addEventListener('beforeunload', function(e) {
    const currentData = getFormData();
    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(currentFormData);
    
    if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});

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