namespace RestaurantAPI.Dtos.Dish;

public record DishResponseDto(
    int DishId, 
    string Name, 
    string? Description, 
    decimal Price, 
    bool IsActive, 
    List<string> IngredientNames,
    string? ImageUrl
);