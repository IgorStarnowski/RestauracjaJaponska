using RestaurantAPI.Dtos.Auth;

namespace RestaurantAPI.Services;

public interface IAuthService
{
    Task<string?> ClientLoginAsync(LoginDto dto);
    Task<string?> EmployeeLoginAsync(LoginDto dto);
}