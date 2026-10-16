using RestaurantAPI.Dtos.Report;

namespace RestaurantAPI.Services;

public interface IReportService
{
    Task<RevenueSummaryDto> GetDailyRevenueAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<PopularDishDto>> GetPopularDishesAsync(DateTime startDate, DateTime endDate, int topLimit = 5);
}