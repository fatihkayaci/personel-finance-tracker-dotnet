namespace PersonalFinanceTracker.Models.DTOs
{
    public class TransactionWithCategoryDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime TransactionDate { get; set; }
        public int TransactionType { get; set; }
        public string? CategoryName { get; set; }
    }    
}
