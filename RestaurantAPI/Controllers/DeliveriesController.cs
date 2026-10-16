using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantAPI.Dtos.Delivery;
using RestaurantAPI.Enums;
using RestaurantAPI.Services;

namespace RestaurantAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DeliveriesController(IDeliveryService service) : ControllerBase
{
    [Authorize(Roles = "Dostawca")]
    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<DeliveryResponseDto>>> GetAvailableDeliveries()
        => Ok(await service.GetAvailableDeliveriesAsync());

    [Authorize(Roles = "Dostawca")]
    [HttpGet("me")]
    public async Task<ActionResult<IEnumerable<DeliveryResponseDto>>> GetCourierDeliveries()
        => Ok(await service.GetEmployeeDelivery(GetUserIdFromToken()));
    
    [Authorize(Roles = "Dostawca")]
    [HttpPatch("{deliveryId}/assign")]
    public async Task<ActionResult> AssignEmployee(int deliveryId)
    {
        var employeeId = GetUserIdFromToken();
        var assigned = await service.AssignEmployeeAsync(deliveryId, employeeId);
        return assigned ? NoContent() : NotFound("Nie znaleziono dostawy lub pracownika.");
    }

    [Authorize(Roles = "Dostawca")]
    [HttpPatch("{deliveryId}/status")]
    public async Task<ActionResult> UpdateDeliveryStatus(int deliveryId, UpdateDeliveryStatusDto dto)
    {
        var employeeId = GetUserIdFromToken();
        var updated = await service.UpdateDeliveryStatusAsync(deliveryId, employeeId, dto);
        return updated ? NoContent() : NotFound("Nie znaleziono dostawy");
    }
    
    private int GetUserIdFromToken()
    {
        var idString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idString, out int userId))
        {
            throw new UnauthorizedAccessException("Błędny token");
        }
        return userId;
    }
}