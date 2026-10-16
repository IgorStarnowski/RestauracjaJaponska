namespace RestaurantAPI.Dtos.Report;

public record RevenueSummaryDto(
    DateTime StartDate,
    DateTime EndDate,
    int TotalOrders,
    decimal TotalRevenue
);
