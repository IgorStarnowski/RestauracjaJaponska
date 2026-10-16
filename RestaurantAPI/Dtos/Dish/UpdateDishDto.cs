namespace RestaurantAPI.Dtos.Dish;

public record UpdateDishDto(
    string Name, 
    string? Description, 
    decimal Price, 
    bool IsActive, 
    List<int> IngredientIDs
);