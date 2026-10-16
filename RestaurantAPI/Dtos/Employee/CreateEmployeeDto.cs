namespace RestaurantAPI.Dtos.Employee;

public record CreateEmployeeDto(
    string Login, 
    string Name, 
    string LastName, 
    List<int> RoleIds
);