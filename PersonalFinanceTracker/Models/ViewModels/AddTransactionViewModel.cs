namespace PersonalFinanceTracker.Models.ViewModels
{
    public class AddTransactionViewModel
    {
        // Transaction bilgileri
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime TransactionDate { get; set; }
        public int TransactionType { get; set; }
        public int CategoryId { get; set; }
        
        // Kategori listeleri
        public List<CategoryModel> ExpenseCategories { get; set; } = new List<CategoryModel>();
        public List<CategoryModel> IncomeCategories { get; set; } = new List<CategoryModel>();
    }
}