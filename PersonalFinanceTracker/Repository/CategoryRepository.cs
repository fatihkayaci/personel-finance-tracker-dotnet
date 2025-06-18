using Microsoft.EntityFrameworkCore;
using PersonalFinanceTracker.Data;
using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Interface;

namespace PersonalFinanceTracker.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private ApplicationDbContext _dbContext;
        public CategoryRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<bool> AddAsync(CategoryModel category)
        {
            _dbContext.Categories.Add(category);
            var result = await _dbContext.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id);
            if (category == null)
                return false;
            

            _dbContext.Remove(category);
            var result = await _dbContext.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<CategoryModel>> GetAllAsync()
        {
            return await _dbContext.Categories.ToListAsync();
        }

        public async Task<CategoryModel?> GetByIdAsync(int id)
        {
            return await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<CategoryModel>> GetByUserIdAsync(string userId)
        {
            return await _dbContext.Categories
            .Where(c => c.UserId == userId)
            .ToListAsync();
        }

        public async Task<bool> UpdateAsync(CategoryModel category)
        {
            var existingTransaction = await GetByIdAsync(category.Id);
            if (existingTransaction == null) return false;
            _dbContext.Update(category);
            var result = await _dbContext.SaveChangesAsync();
            return result > 0;
        }
    }
}