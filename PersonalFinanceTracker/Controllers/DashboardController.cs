using Microsoft.AspNetCore.Mvc;
using PersonalFinanceTracker.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
namespace PersonalFinanceTracker.Controllers
{
    public class DashboardController : Controller
    {
        private readonly ITransactionService _transactionService;
        private readonly ICategoryService _categoryService;
        public DashboardController(ITransactionService transactionService, ICategoryService categoryService)
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
                Balance = await _transactionService.GetBalanceAsync(userId),
                MonthlyIncome = await _transactionService.GetMonthlyIncomeAsync(userId),
                MonthlyExpense = await _transactionService.GetMonthlyExpenseAsync(userId),
            };

            viewModel.MonthlyBalance = viewModel.MonthlyIncome - viewModel.MonthlyExpense;
            viewModel.MonthlyTransactionCount = viewModel.Transactions.Count(t => t.TransactionDate.Month == DateTime.Now.Month);
            return View(viewModel);
        }
    }
}
