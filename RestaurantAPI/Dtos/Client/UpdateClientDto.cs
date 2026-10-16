namespace RestaurantAPI.Dtos.Client;

public record UpdateClientDto(
    string Name, 
    string LastName, 
    string PhoneNumber, 
    string Email
);