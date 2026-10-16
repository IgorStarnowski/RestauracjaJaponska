using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RestaurantAPI.Dtos.Report;
using RestaurantAPI.Services;

namespace RestaurantAPI.Controllers;

[Authorize(Roles = "Menedżer")]
[Route("api/[controller]")]
[ApiController]
public class ReportsController(IReportService service) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<RevenueSummaryDto>> GetDailyRevenue([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var end = endDate ?? DateTime.UtcNow;
        var start = startDate ?? end.AddDays(-7);

        if (start > end)
        {
            return BadRequest("Data poczatkowa nie moze byc wieksza niz data koncowa");
        }
        
        return Ok(await service.GetDailyRevenueAsync(start, end));
    }

    [HttpGet("popular")]
    public async Task<ActionResult<IEnumerable<PopularDishDto>>> GetPopularDishes([FromQuery] DateTime? startDate,[FromQuery] DateTime? endDate, [FromQuery, Range(1,50)] int limit = 5)
    {
        var end = endDate.HasValue
            ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
            :  DateTime.UtcNow;
        var start = startDate.HasValue
            ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
            : end.AddDays(-7);

        if (start > end)
        {
            return BadRequest("Data poczatkowa nie moze byc wieksza niz data koncowa");
        }
        
        return Ok(await service.GetPopularDishesAsync(start, end, limit));
    }
}