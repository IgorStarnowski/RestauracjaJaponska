namespace RestaurantAPI.Dtos.Employee;

public record EmployeeResponseDto(
    int EmployeeId, 
    string Login, 
    string Name, 
    string LastName, 
    List<string> RoleNames,
    List<int> DishIds
);