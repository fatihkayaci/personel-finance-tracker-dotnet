namespace PersonalFinanceTracker.Models.ViewModels
{
    public class TransactionIndexViewModel
    {
        public List<TransactionWithCategoryDto> Transactions { get; set; }
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal Balance { get; set; }
        
        public TransactionIndexViewModel()
        {
            Transactions = new List<TransactionWithCategoryDto>();
        }
    }
}