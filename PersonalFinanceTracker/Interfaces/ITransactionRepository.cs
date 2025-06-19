namespace PersonalFinanceTracker.Interface
{
    public interface ITransactionRepository
    {
        Task<List<TransactionModel>> GetAllAsync();
        Task<TransactionModel?> GetByIdAsync(int id);
        Task<bool> AddAsync(TransactionModel transaction);
        Task<bool> UpdateAsync(TransactionModel transaction);
        Task<bool> DeleteAsync(int id);
        Task<List<TransactionModel>> GetByUserIdAsync(string userId);
        Task<List<TransactionWithCategoryDto>> GetTransactionsWithCategoryAsync(string userId);
    }
}