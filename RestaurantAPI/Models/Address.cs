namespace RestaurantAPI.Models
{
    public class Address
    {
        public int AddressId { get; set; }
        public required string City { get; set; }
        public required string PostalCode { get; set; }
        public required string Street { get; set; }
        public required string BuildingNumber { get; set; }
        public string? ApartmentNumber { get; set; }
        public int ClientId {  get; set; }
        public Client? Client { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
