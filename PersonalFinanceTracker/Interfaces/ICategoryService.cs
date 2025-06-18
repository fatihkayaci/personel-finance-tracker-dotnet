
using PersonalFinanceTracker.Models;

namespace PersonalFinanceTracker.Interface
{
    public interface ICategoryService
    {
        Task<List<CategoryModel>> GetAllCategoriesAsync();
        Task<CategoryModel?> GetCategoryByIdAsync(int id);
        Task<bool> AddCategoryAsync(CategoryModel category);
        Task<bool> UpdateCategoryAsync(CategoryModel category);
        Task<bool> DeleteCategoryAsync(int id);
        Task<List<CategoryModel>> GetCategoriesByUserIdAsync(string userId);
    }
}