using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestaurantAPI.Data;
using RestaurantAPI.Dtos.Auth;

namespace RestaurantAPI.Services;

public class AuthService(AppDbContext context, IConfiguration configuration) : IAuthService
{
    public async Task<string?> ClientLoginAsync(LoginDto dto)
    {
        var client = await context.Clients.FirstOrDefaultAsync(c => c.Email == dto.Identifier);
        if (client == null || !BCrypt.Net.BCrypt.Verify(dto.Password, client.PasswordHash))
        {
            return null;
        }
        
        return GenerateJwtToken(client.ClientId.ToString(), client.Email, new List<string>{"Klient"});
    }

    public async Task<string?> EmployeeLoginAsync(LoginDto dto)
    {
        var employee = await context.Employees
            .Include(e => e.Roles)
            .FirstOrDefaultAsync(e => e.Login == dto.Identifier);
        if (employee == null || !BCrypt.Net.BCrypt.Verify(dto.Password, employee.PasswordHash))
        {
            return null;
        }
        
        var rolesString = employee.Roles.Select(r => r.RoleName).ToList();
        
        return GenerateJwtToken(employee.EmployeeId.ToString(),employee.Login,rolesString);   
    }

    private string GenerateJwtToken(string userId, string identifier, List<string> roles)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var keyFromConfig = configuration["Jwt:Key"] ?? "SuperTajnyIBezpiecznyKluczDoPodpisywaniaTokenow123!";
        var key = Encoding.UTF8.GetBytes(keyFromConfig);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, identifier)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }
        
        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddHours(2),
            SigningCredentials =
                new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}