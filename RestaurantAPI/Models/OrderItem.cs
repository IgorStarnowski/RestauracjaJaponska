using RestaurantAPI.Enums;

namespace RestaurantAPI.Models;

public class OrderItem
{
    public int OrderItemId { get; set; }
    public required int Quantity { get; set; }
    public required decimal UnitPrice { get; set; }
    public OrderItemStatus Status { get; set; }
    
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    
    public int DishId { get; set; }
    public Dish Dish { get; set; } = null!;
    
    public int? EmployeeId { get; set; }
    public Employee? Employee { get; set; }
}