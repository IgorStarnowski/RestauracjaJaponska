using RestaurantAPI.Dtos.Employee;

namespace RestaurantAPI.Services
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeResponseDto>> GetAllEmployeesAsync();
        Task<EmployeeResponseDto?> GetEmployeeByIdAsync(int id);
        Task<CreateEmployeeResponseDto> AddEmployeeAsync(CreateEmployeeDto dto);   
        Task<bool> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto);
        Task<bool> DeleteEmployeeAsync(int id);
        Task<bool> AssignEmployeeToDishesAsync(int employeeId, AssignDishToEmployeeDto dto);
    }
}
