namespace RestaurantAPI.Dtos.Address;

public record UpdateAddressDto(
    string City, 
    string PostalCode, 
    string Street, 
    string BuildingNumber, 
    string? ApartmentNumber
);