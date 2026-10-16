using RestaurantAPI.Dtos.OrderItem;
using RestaurantAPI.Enums;

namespace RestaurantAPI.Dtos.Order;

public record CreateOrderDto (
    OrderType OrderType, 
    string? CustomerNotes, 
    int ? TableNumber,
    int? AddressId,
    List<CreateOrderItemDto> OrderItems
    );