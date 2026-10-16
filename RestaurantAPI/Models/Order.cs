using System.ComponentModel.DataAnnotations.Schema;
using RestaurantAPI.Enums;

namespace RestaurantAPI.Models
{
    public class Order
    {
        public int OrderId { get; set; }
        public required string OrderNumber { get; set; }
        public OrderType OrderType { get; set; }
        public int? TableNumber { get; set; }
        public Delivery? Delivery { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Nowe;
        public decimal TotalPrice { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? EstimatedPreparationTime { get; set; }
        public string? CustomerNotes { get; set; }
        public List<OrderItem> Items { get; set; } = new();
        
        public int? ClientId { get; set; }
        public Client? Client { get; set; }
        
        public int? EmployeeId { get; set; }
        public Employee? Employee { get; set; }
        public bool IsPaid { get; set; }
    }
}
