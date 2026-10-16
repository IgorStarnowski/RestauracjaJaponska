using RestaurantAPI.Enums;

namespace RestaurantAPI.Dtos.OrderItem;

public record UpdateOrderItemStatusDto(
    OrderItemStatus OrderItemStatus
    );