namespace RestaurantAPI.Dtos.Client;

public record ClientResponseDto(
    int ClientId, 
    string Name, 
    string LastName, 
    string PhoneNumber
);