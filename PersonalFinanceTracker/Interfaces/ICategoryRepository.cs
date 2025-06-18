
using PersonalFinanceTracker.Models;

namespace PersonalFinanceTracker.Interface
{
    public interface ICategoryRepository
    {
        Task<List<CategoryModel>> GetAllAsync();
        Task<CategoryModel?> GetByIdAsync(int id);
        Task<bool> AddAsync(CategoryModel transaction);
        Task<bool> UpdateAsync(CategoryModel transaction);
        Task<bool> DeleteAsync(int id);
        Task<List<CategoryModel>> GetByUserIdAsync(string userId);
    }
}