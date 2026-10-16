namespace RestaurantAPI.Dtos.Address;

public record CreateAddressDto(
    string City, 
    string PostalCode, 
    string Street, 
    string BuildingNumber, 
    string? ApartmentNumber
);