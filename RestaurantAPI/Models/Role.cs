namespace RestaurantAPI.Models
{
    public class Role
    {
        public int RoleId { get; set; }
        public required string RoleName { get; set; }
        public List<Employee> Employees { get; set; } = new();
    }
}
