using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RestaurantAPI.Dtos.Auth;
using RestaurantAPI.Services;

namespace RestaurantAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("client")]
    public async Task<ActionResult> ClientLogin(LoginDto dto)
    {
        var token = await service.ClientLoginAsync(dto);
        if (token is null) return Unauthorized("Nieprawidlowy e-mail lub hasło.");
        return Ok(new { Token = token });
    }

    [AllowAnonymous]
    [HttpPost("employee")]
    public async Task<ActionResult> EmployeeLogin(LoginDto dto)
    {
        var token = await service.EmployeeLoginAsync(dto);
        if (token is null) return Unauthorized("Nieprawidlowy login lub hasło.");
        return Ok(new { Token = token });
    }
}