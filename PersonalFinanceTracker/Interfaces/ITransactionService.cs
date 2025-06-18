
using PersonalFinanceTracker.Models;
namespace PersonalFinanceTracker.Interface
{
    public interface ITransactionService
    {
        Task<List<TransactionModel>> GetAllTransactionsAsync();
        Task<TransactionModel?> GetTransactionByIdAsync(int id);
        Task<bool> AddTransactionAsync(TransactionModel transaction);
        Task<bool> UpdateTransactionAsync(TransactionModel transaction);
        Task<bool> DeleteTransactionAsync(int id);
        Task<List<TransactionModel>> GetTransactionsByUserIdAsync(string userId);

        Task<decimal> GetTotalIncomeAsync(string userId);
        Task<decimal> GetTotalExpenseAsync(string userId);
        Task<decimal> GetBalanceAsync(string userId);
        Task<List<TransactionModel>> GetTransactionsByDateRangeAsync(string userId, DateTime startDate, DateTime endDate);
        Task<List<TransactionModel>> GetTransactionsByCategoryAsync(string userId, int categoryId);
        
    }
}
