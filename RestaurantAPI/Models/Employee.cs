namespace RestaurantAPI.Models
{
    public class Employee
    {
        public int EmployeeId { get; set; }
        public required string Login {  get; set; }
        public required string PasswordHash { get; set; }
        public required string Name { get; set; }
        public required string LastName { get; set; }
        public List<Role> Roles { get; set; } = new();
        public List<Dish> Dishes { get; set; } = new();
    }
}
