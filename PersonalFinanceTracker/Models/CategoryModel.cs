namespace PersonalFinanceTracker.Models
{
    public class CategoryModel
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int TransactionType { get; set; }
        public string UserId { get; set; }
    }
}
