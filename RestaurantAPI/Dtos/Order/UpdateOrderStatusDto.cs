using RestaurantAPI.Enums;

namespace RestaurantAPI.Dtos.Order;

public record UpdateOrderStatusDto(
    OrderStatus OrderStatus
);
