using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalFinanceTracker.Interface;
using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Models.ViewModels;
using System.Security.Claims;
namespace PersonalFinanceTracker.Controllers
{
    [Authorize]
    public class TransactionController : Controller
    {
        private readonly ITransactionService _transactionService;
        private readonly ICategoryService _categoryService;
        public TransactionController(ITransactionService transactionService, ICategoryService categoryService)
        {
            _transactionService = transactionService;
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var userId = User.Identity?.Name;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User not found");
            }
            var transactions = await _transactionService.GetTransactionsByUserIdAsync(userId);
            return View(transactions);
        }

        [HttpGet]
        public async Task<IActionResult> Add()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return BadRequest("user not found!");
            var viewModel = new AddTransactionViewModel
            {
                TransactionDate = DateTime.Now,
                TransactionType = 0,
                ExpenseCategories = await _categoryService.GetCategoriesByTypeAsync(0, userId),
                IncomeCategories = await _categoryService.GetCategoriesByTypeAsync(1, userId),
            };
            return View(viewModel);
        }
        [HttpPost]
        public async Task<IActionResult> Add(AddTransactionViewModel model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return BadRequest("user not found!");

            Console.WriteLine($"Amount: {model.Amount}");
            Console.WriteLine($"Description: {model.Description}");
            Console.WriteLine($"TransactionDate: {model.TransactionDate}");
            Console.WriteLine($"CategoryId: {model.CategoryId}");
            Console.WriteLine($"transaction type: {model.TransactionType}");
            var transaction = new TransactionModel
            {
                Amount = model.Amount,
                Description = model.Description,
                TransactionDate = model.TransactionDate,
                TransactionType = model.TransactionType,
                CategoryId = model.CategoryId,
                UserId = userId,
                CreatedDate = DateTime.Now
            };
            await _transactionService.AddTransactionAsync(transaction);
            return RedirectToAction("Index");
        }
        public IActionResult Edit(int id)
        {
            return View();
        }
    }
}
