namespace RestaurantAPI.Models
{
    public class Ingredient
    {
        public int IngredientId { get; set; }
        public required string Name { get; set; }
        public required bool IsAllergen { get; set; }
        public List<Dish> Dishes { get; set; } = new();
        public bool IsDeleted { get; set; } =  false;
    }
}
