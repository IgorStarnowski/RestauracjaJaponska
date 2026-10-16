using RestaurantAPI.Dtos.OrderItem;
using RestaurantAPI.Enums;

namespace RestaurantAPI.Dtos.Order;

public record OrderResponseDto(
    int OrderId,
    string OrderNumber,
    int? TableNumber,
    OrderStatus Status, 
    decimal TotalPrice, 
    DateTime OrderDate, 
    DateTime? EstimatedPreparationTime,
    List<OrderItemResponseDto> Items,
    bool isPaid
    );
