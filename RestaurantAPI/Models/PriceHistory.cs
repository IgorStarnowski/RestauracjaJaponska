namespace RestaurantAPI.Models;

public class PriceHistory
{
    public int PriceHistoryId { get; set; }
    public required decimal Price { get; set; }
    public DateTime ChangeDate { get; set; }
    public int DishId { get; set; }
    public Dish Dish { get; set; } = null!;
}