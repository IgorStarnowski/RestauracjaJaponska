namespace RestaurantAPI.Dtos.Employee;

public record CreateEmployeeResponseDto(
    int EmployeeId,
    string Login,
    string Name,
    string LastName,
    string GeneratedPassword
    );