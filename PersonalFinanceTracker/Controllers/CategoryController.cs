using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalFinanceTracker.Models.ViewModels;
using System.Security.Claims;
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

        [HttpGet]
        public IActionResult Add()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return BadRequest("user not found!");
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> Add(AddCategoryViewModel model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return BadRequest("user not found!");

            if (!ModelState.IsValid) return View(model);
            Console.WriteLine(model.TransactionType);
            var category = new CategoryModel
            {
                Name = model.Name,
                TransactionType = model.TransactionType,
                UserId = userId
            };
            await _categoryService.AddCategoryAsync(category);
            return RedirectToAction("Index", "Transaction");
        }
    }
}
