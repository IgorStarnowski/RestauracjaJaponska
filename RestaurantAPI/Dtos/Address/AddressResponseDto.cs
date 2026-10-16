namespace RestaurantAPI.Dtos.Address;

public record AddressResponseDto(
    int AddressId, 
    string City, 
    string PostalCode, 
    string Street, 
    string BuildingNumber, 
    string? ApartmentNumber, 
    int ClientId
);