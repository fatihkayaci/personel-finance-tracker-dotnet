using Microsoft.AspNetCore.Mvc;

namespace PersonalFinanceTracker.Controllers
{
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
