namespace RestaurantAPI.Dtos.Employee;

public record UpdateEmployeeDto(
    string Login, 
    string Name, 
    string LastName, 
    List<int> RoleIds
);