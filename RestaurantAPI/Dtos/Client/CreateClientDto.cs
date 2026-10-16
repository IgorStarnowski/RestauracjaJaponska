namespace RestaurantAPI.Dtos.Client;

public record CreateClientDto(
    string Name, 
    string LastName, 
    string PhoneNumber, 
    string Email, 
    string Password, 
    string City, 
    string PostalCode, 
    string Street, 
    string BuildingNumber, 
    string? ApartmentNumber
);