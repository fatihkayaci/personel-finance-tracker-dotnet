using Microsoft.EntityFrameworkCore;
using PersonalFinanceTracker.Data;

namespace PersonalFinanceTracker.Repository
{
    public class TransactionRepository : ITransactionRepository
    {
        private ApplicationDbContext _dbContext;
        public TransactionRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<bool> AddAsync(TransactionModel transaction)
        {
            _dbContext.Transactions.Add(transaction);
            var result = await _dbContext.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var transaction = await _dbContext.Transactions
            .FirstOrDefaultAsync(t => t.Id == id);

            if (transaction == null)
                return false;

            _dbContext.Remove(transaction);
            var result = await _dbContext.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<TransactionModel>> GetAllAsync()
        {
            return await _dbContext.Transactions.ToListAsync();
        }

        public async Task<TransactionModel?> GetByIdAsync(int id)
        {
            return await _dbContext.Transactions
            .FirstOrDefaultAsync(t => t.Id == id);

        }

        public async Task<List<TransactionModel>> GetByUserIdAsync(string userId)
        {
            return await _dbContext.Transactions
            .Where(t => t.UserId == userId)
            .ToListAsync();
        }
        public async Task<List<TransactionWithCategoryDto>> GetTransactionsWithCategoryAsync(string userId)
        {
            return await _dbContext.Transactions
                .Where(t => t.UserId == userId)
                .Join(_dbContext.Categories,
                    t => t.CategoryId,
                    c => c.Id,
                    (t, c) => new TransactionWithCategoryDto
                    {
                        Id = t.Id,
                        Amount = t.Amount,
                        Description = t.Description,
                        TransactionDate = t.TransactionDate,
                        TransactionType = t.TransactionType,
                        CategoryName = c.Name
                    })
                .ToListAsync();
        }

        public async Task<bool> UpdateAsync(TransactionModel transaction)
        {
            var existingTransaction  = await GetByIdAsync(transaction.Id);
            if (existingTransaction  == null)
                return false;
            _dbContext.Update(transaction);
            var result = await _dbContext.SaveChangesAsync();
            return result > 0;
        }
    }
}