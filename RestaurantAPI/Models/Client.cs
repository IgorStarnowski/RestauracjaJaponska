namespace RestaurantAPI.Models
{
    public class Client
    {
        public int ClientId { get; set; }
        public required string Name { get; set; }
        public required string LastName { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public List<Address> Addresses { get; set; } = new();
        public bool IsDeleted { get; set; } =  false;
    }
}
