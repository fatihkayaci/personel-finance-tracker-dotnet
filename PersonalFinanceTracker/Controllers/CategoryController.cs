using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalFinanceTracker.Interface;
using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Models.ViewModels;

namespace PersonalFinanceTracker.Controllers
{
    [Authorize]
    public class CategoryController : Controller
    {
        private readonly ICategoryService _categoryService;
        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpPost]
        public async Task<IActionResult> Add(CategoryModel model)
        {
            // UserId'yi ekle
            model.UserId = User.Identity?.Name ?? "";
            
            var result = await _categoryService.AddCategoryAsync(model);
            return RedirectToAction("Index");
        }
    }
}
