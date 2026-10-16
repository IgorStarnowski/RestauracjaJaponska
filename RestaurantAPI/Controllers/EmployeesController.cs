using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestaurantAPI.Dtos.Employee;
using RestaurantAPI.Services;

namespace RestaurantAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController(IEmployeeService service) : ControllerBase
    {
        [Authorize(Roles = "Menedżer")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> GetEmployees() 
            => Ok(await service.GetAllEmployeesAsync());

        [Authorize(Roles = "Menedżer")]
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployee(int id)
        {
            var result = await service.GetEmployeeByIdAsync(id);
            return result is null ? NotFound("Nie znaleziono pracownika o podanym ID") : Ok(result);
        }

        [Authorize(Roles = "Menedżer,Kelner,Kucharz,Dostawca")]
        [HttpGet("me")]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployeeProfile()
        {
            var idString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idString, out int employeeId))
            {
                throw new UnauthorizedAccessException("Błędny token");
            }
            var result = await service.GetEmployeeByIdAsync(employeeId);
            return result is null ? NotFound("Nie znaleziono pracownika o podanym ID") : Ok(result);
        }
        
        [Authorize(Roles = "Menedżer")]
        [HttpPost]
        public async Task<ActionResult<CreateEmployeeResponseDto>> AddEmployee(CreateEmployeeDto dto)
        {
            var createdEmployee = await service.AddEmployeeAsync(dto);
            return CreatedAtAction(nameof(GetEmployee), new { id = createdEmployee.EmployeeId }, createdEmployee);
        }

        [Authorize(Roles = "Menedżer")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteEmployee(int id)
        {
            var deleted = await service.DeleteEmployeeAsync(id);
            return deleted ? NoContent() : NotFound("Nie znaleziono pracownika o podanym ID");
        }

        [Authorize(Roles = "Menedżer")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateEmployee(int id, UpdateEmployeeDto dto)
        {
            var updated = await service.UpdateEmployeeAsync(id, dto);
            return updated ? NoContent() : NotFound("Nie znaleziono pracownika o podanym ID");
        }

        [Authorize(Roles = "Menedżer")]
        [HttpPatch("{employeeId}/dishes")]
        public async Task<ActionResult> AssignEmployeeToDishes(int employeeId, AssignDishToEmployeeDto dto)
        {
            var updated = await service.AssignEmployeeToDishesAsync(employeeId, dto);
            return updated ? NoContent() : NotFound("Nie znaleziono pracownika o podanym ID");
        }
        
    }
}
