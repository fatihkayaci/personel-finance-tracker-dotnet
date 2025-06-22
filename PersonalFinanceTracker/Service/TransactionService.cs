namespace PersonalFinanceTracker.Service
{
    public class TransactionService : ITransactionService
    {
        private ITransactionRepository _transactionRepository;

        public TransactionService(ITransactionRepository transactionRepository)
        {
            _transactionRepository = transactionRepository;
        }

        public Task<List<TransactionModel>> GetAllTransactionsAsync()
        {
            return _transactionRepository.GetAllAsync();
        }
        public Task<TransactionModel?> GetTransactionByIdAsync(int id)
        {
            return _transactionRepository.GetByIdAsync(id);
        }
        public Task<bool> AddTransactionAsync(TransactionModel transaction)
        {
            return _transactionRepository.AddAsync(transaction);
        }
        public Task<bool> UpdateTransactionAsync(TransactionModel transaction)
        {
            return _transactionRepository.UpdateAsync(transaction);
        }
        public Task<bool> DeleteTransactionAsync(int id)
        {
            return _transactionRepository.DeleteAsync(id);
        }
        public Task<List<TransactionModel>> GetTransactionsByUserIdAsync(string userId)
        {
            return _transactionRepository.GetByUserIdAsync(userId);
        }
        public async Task<List<TransactionWithCategoryDto>> GetTransactionsWithCategoryAsync(string userId)
        {
            return await _transactionRepository.GetTransactionsWithCategoryAsync(userId);
        }

        public async Task<decimal> GetTotalIncomeAsync(string userId)
        {
            var transactions = await _transactionRepository.GetByUserIdAsync(userId);

            return transactions
                .Where(t => t.TransactionType == 1)
                .Sum(t => t.Amount);
        }
        public async Task<decimal> GetTotalExpenseAsync(string userId)
        {
            var transactions = await _transactionRepository.GetByUserIdAsync(userId);

            return transactions
            .Where(t => t.TransactionType == 2)
            .Sum(t => t.Amount);
        }
        public async Task<decimal> GetBalanceAsync(string userId)
        {
            var income = await GetTotalIncomeAsync(userId);
            var expense = await GetTotalExpenseAsync(userId);
            var result = income - expense;
            Console.WriteLine($"Income: {income}, Expense: {expense}, Balance: {result}");
            return result;
        }
        public async Task<List<TransactionModel>> GetTransactionsByDateRangeAsync(string userId, DateTime startDate, DateTime endDate)
        {
            var transactions = await _transactionRepository.GetByUserIdAsync(userId);
            return transactions
            .Where(t => t.TransactionDate >= startDate && t.TransactionDate <= endDate)
            .ToList();
        }
        public async Task<List<TransactionModel>> GetTransactionsByCategoryAsync(string userId, int categoryId)
        {
            var transaction = await _transactionRepository.GetByUserIdAsync(userId);
            return transaction
            .Where(t => t.CategoryId == categoryId)
            .ToList();
        }
        public async Task<decimal> GetMonthlyIncomeAsync(string userId)
        {
            var transactions = await _transactionRepository.GetByUserIdAsync(userId);
            var now = DateTime.Now;
            
            return transactions
                .Where(t => t.TransactionType == 1 && 
                        t.TransactionDate.Month == now.Month && 
                        t.TransactionDate.Year == now.Year)
                .Sum(t => t.Amount);
        }
        public async Task<decimal> GetMonthlyExpenseAsync(string userId)
        {
            var transactions = await _transactionRepository.GetByUserIdAsync(userId);
            var now = DateTime.Now;
            
            return transactions
                .Where(t => t.TransactionType == 2 && 
                        t.TransactionDate.Month == now.Month && 
                        t.TransactionDate.Year == now.Year)
                .Sum(t => t.Amount);
        }
    }
}