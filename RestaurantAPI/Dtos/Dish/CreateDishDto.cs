namespace RestaurantAPI.Dtos.Dish;

public record CreateDishDto(
    string Name, 
    string? Description, 
    decimal Price, 
    bool IsActive, 
    List<int> IngredientIDs,
    IFormFile? Image
);