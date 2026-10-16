using Microsoft.EntityFrameworkCore;
using RestaurantAPI.Data;
using RestaurantAPI.Dtos.Report;
using RestaurantAPI.Enums;

namespace RestaurantAPI.Services;

public class ReportService(AppDbContext context) : IReportService
{
    public async Task<RevenueSummaryDto> GetDailyRevenueAsync(DateTime startDate, DateTime endDate)
    {

        var stats = await context.Orders
            .Where(o => o.Status == OrderStatus.Zakonczone
                        && o.OrderDate >= startDate
                        && o.OrderDate < endDate.AddDays(1))
            .GroupBy(o => 1)
            .Select(g => new
            {
                TotalOrders = g.Count(),
                TotalRevenue = g.Sum(o => o.TotalPrice)
            })
            .FirstOrDefaultAsync();

        var totalOrders = stats?.TotalOrders ?? 0;
        var totalRevenue = stats?.TotalRevenue ?? 0;
        
        return new RevenueSummaryDto(startDate, endDate, totalOrders, totalRevenue);
    }

    public async Task<IEnumerable<PopularDishDto>> GetPopularDishesAsync(DateTime startDate, DateTime endDate,int topLimit = 5)
    {
        var rawData = await context.OrderItems
            .Where(i => i.Order.Status == OrderStatus.Zakonczone
                        && i.Order.OrderDate >= startDate
                        && i.Order.OrderDate < endDate.AddDays(1))
            .GroupBy(i => i.Dish!.Name)
            .Select(g => new {
                DishName = g.Key,
                QuantitySold = g.Sum(i => i.Quantity)
            }).OrderByDescending(dto => dto.QuantitySold)
            .Take(topLimit)
            .ToListAsync();

        var popularDishes = rawData
            .Select(x => new PopularDishDto(x.DishName, x.QuantitySold))
            .ToList();
       
        return popularDishes;
    }
}