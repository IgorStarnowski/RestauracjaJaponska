using Microsoft.EntityFrameworkCore;
using RestaurantAPI.Data;
using RestaurantAPI.Dtos.Employee;
using RestaurantAPI.Models;

namespace RestaurantAPI.Services
{
    public class EmployeeService(AppDbContext context) : IEmployeeService
    {
        public async Task<CreateEmployeeResponseDto> AddEmployeeAsync(CreateEmployeeDto dto)
        {
            string rawPassword = GenerateRandomPassword(12);
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(rawPassword);
            
            var roles = await context.Roles
                .Where(r => dto.RoleIds.Contains(r.RoleId))
                .ToListAsync();

            var newEmployee = new Employee
            {
                Login = dto.Login,
                PasswordHash = hashedPassword,
                Name = dto.Name,
                LastName = dto.LastName,
                Roles = roles
            };

            context.Employees.Add(newEmployee);
            await context.SaveChangesAsync();

            var roleNames = roles.Select(r => r.RoleName).ToList();

            var result = new CreateEmployeeResponseDto
            (
                newEmployee.EmployeeId,
                newEmployee.Login,
                newEmployee.Name,
                newEmployee.LastName,
                rawPassword
            );

            return result;
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            var employeeToDelete = await context.Employees.FindAsync(id);
            if(employeeToDelete is null) return false;
            
            context.Employees.Remove(employeeToDelete);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignEmployeeToDishesAsync(int employeeId, AssignDishToEmployeeDto dto)
        {
            var employeeToAssign = await context.Employees
                .Include(e => e.Dishes)
                .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
            if (employeeToAssign is null) return false;

            var dishes = await context.Dishes
                .Where(d => dto.DishIds.Contains(d.DishId))
                .ToListAsync();
            
            employeeToAssign.Dishes =  dishes;
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<EmployeeResponseDto>> GetAllEmployeesAsync() 
            => await context.Employees.Select(e => new EmployeeResponseDto
        (
            e.EmployeeId,
            e.Login,
            e.Name,
            e.LastName,
            e.Roles.Select(r => r.RoleName).ToList(),
            e.Dishes.Select(d => d.DishId).ToList()
        )).ToListAsync();

        public async Task<EmployeeResponseDto?> GetEmployeeByIdAsync(int id)
            => await context.Employees.Where(e => e.EmployeeId == id)
            .Select(e => new EmployeeResponseDto
            (
                e.EmployeeId,
                e.Login,
                e.Name,
                e.LastName,
                e.Roles.Select(r => r.RoleName).ToList(),
                e.Dishes.Select(d => d.DishId).ToList()
            )).FirstOrDefaultAsync();
        
        

        public async Task<bool> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto)
        {
            var employeeToChange = await context.Employees
                .Include(e => e.Roles).FirstOrDefaultAsync(d => d.EmployeeId == id);
            if (employeeToChange is null) return false;

            var roles = await context.Roles
                .Where(r => dto.RoleIds.Contains(r.RoleId))
                .ToListAsync();

            employeeToChange.Login = dto.Login;
            employeeToChange.Name = dto.Name;
            employeeToChange.LastName = dto.LastName;
            employeeToChange.Roles = roles;

            await context.SaveChangesAsync();
            return true;

        }

        private string GenerateRandomPassword(int length = 12)
        {
            const string validChars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?_-";
            var chars = new char[length];

            for (int i = 0; i < length; i++)
            {
                chars[i] = validChars[Random.Shared.Next(validChars.Length)];
            }
            return new string(chars);
        }
    }
}
