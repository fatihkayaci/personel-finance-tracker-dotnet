using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return BadRequest("User not found");
            
            var viewModel = new TransactionIndexViewModel
            {
                Transactions = await _transactionService.GetTransactionsWithCategoryAsync(userId),
                TotalIncome = await _transactionService.GetTotalIncomeAsync(userId),
                TotalExpense = await _transactionService.GetTotalExpenseAsync(userId),
                Balance = await _transactionService.GetBalanceAsync(userId)
            };
            
            return View(viewModel);
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
        public async Task<IActionResult> Add(AddTransactionViewModel model, string action)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return BadRequest("user not found!");

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
            switch (action)
            {
                case "save":
                    return RedirectToAction("Index");
                case "saveAndNew":
                    return RedirectToAction("Add", "Transaction");
                default:
                    return RedirectToAction("Index");
            }
        }
        public IActionResult Edit(int id)
        {
            return View();
        }
    }
}
