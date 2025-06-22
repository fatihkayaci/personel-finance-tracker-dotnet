namespace PersonalFinanceTracker.Models.ViewModels
{
    public class TransactionIndexViewModel
    {
        public List<TransactionWithCategoryDto> Transactions { get; set; }
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal Balance { get; set; }
        
        // Aylık veriler - bunları ekle
        public decimal MonthlyIncome { get; set; }
        public decimal MonthlyExpense { get; set; }
        public decimal MonthlyBalance { get; set; }
        public int MonthlyTransactionCount { get; set; }
        
        // Bugünkü veriler (istersan)
        public decimal TodayIncome { get; set; }
        public decimal TodayExpense { get; set; }
        public decimal TodayBalance { get; set; }
        
        public TransactionIndexViewModel()
        {
            Transactions = new List<TransactionWithCategoryDto>();
        }
    }
}