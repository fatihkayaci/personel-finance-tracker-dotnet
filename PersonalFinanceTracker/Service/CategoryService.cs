using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Interface;
namespace PersonalFinanceTracker.Service
{
    public class CategoryService : ICategoryService
    {
        private ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<bool> AddCategoryAsync(CategoryModel category)
        {
            return await _categoryRepository.AddAsync(category);
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            return await _categoryRepository.DeleteAsync(id);
        }

        public async Task<List<CategoryModel>> GetAllCategoriesAsync()
        {
            return await _categoryRepository.GetAllAsync();
        }

        public async Task<List<CategoryModel>> GetCategoriesByUserIdAsync(string userId)
        {
            return await _categoryRepository.GetByUserIdAsync(userId);
        }

        public async Task<CategoryModel?> GetCategoryByIdAsync(int id)
        {
            return await _categoryRepository.GetByIdAsync(id);
        }

        public async Task<bool> UpdateCategoryAsync(CategoryModel category)
        {
            return await _categoryRepository.UpdateAsync(category);
        }
        public async Task<List<CategoryModel>> GetCategoriesByTypeAsync(int transactionType, string userId)
        {
            return await _categoryRepository.GetCategoriesByTypeAndUserIdAsync(transactionType, userId);
        }
    }
}
