using RestaurantAPI.Enums;

namespace RestaurantAPI.Models;

public class Delivery
{
    public int DeliveryId { get; set; }
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.OczekujeNaKuriera;
    public DateTime? DepartureTime { get; set; }
    public DateTime? DeliveryTime { get; set; }
    
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    
    public int AddressId { get; set; }
    public Address Address { get; set; } = null!;
    
    public int? EmployeeId { get; set; }
    public Employee? Employee { get; set; } = null!;
}