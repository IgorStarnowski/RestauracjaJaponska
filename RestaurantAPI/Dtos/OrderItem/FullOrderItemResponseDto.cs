using RestaurantAPI.Enums;

namespace RestaurantAPI.Dtos.OrderItem;

public record FullOrderItemResponseDto(
    int OrderItemId,
    int Quantity,
    decimal UnitPrice,
    OrderItemStatus Status,
    int OrderId,
    int DishId, 
    string DishName,
    string? EmployeeName
    );