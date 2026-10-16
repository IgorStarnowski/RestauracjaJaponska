namespace RestaurantAPI.Dtos.OrderItem;

public record OrderItemResponseDto(
    int DishId, 
    string DishName, 
    int Quantity, 
    decimal UnitPrice
    );