using System.Diagnostics;

namespace RestaurantAPI.Models
{
    public class Dish
    {
        public int DishId { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required decimal Price { get; set; }
        public required bool IsActive { get; set; }
        public List<Ingredient> Ingredients { get; set; } = new();
        public List<Employee> Employees { get; set; } = new();
        public List<PriceHistory> PriceHistories { get; set; } = new();
        public string? ImageUrl { get; set; }
    }
}
