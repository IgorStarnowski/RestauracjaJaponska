using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantAPI.Dtos.Order;
using RestaurantAPI.Dtos.OrderItem;
using RestaurantAPI.Services;

namespace RestaurantAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrdersController(IOrderService service) : ControllerBase
{
    //client
    [Authorize(Roles = "Klient")]
    [HttpPost("me")]
    public async Task<ActionResult<OrderResponseDto>> CreateMyOrder(CreateOrderDto order)
    {
        var clientId = GetUserIdFromToken();
        
        var createdOrder = await service.CreateOrderAsync(clientId, order);
        return CreatedAtAction(nameof(GetMyOrder), new { orderId = createdOrder.OrderId }, createdOrder);
    }

    [Authorize(Roles = "Klient")]
    [HttpGet("me")]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetMyOrders()
    {
        var clientId = GetUserIdFromToken();
        return Ok(await service.GetClientOrdersAsync(clientId));
    }
    
    [Authorize(Roles = "Klient")]
    [HttpGet("{orderId}/me")]
    public async Task<ActionResult<OrderResponseDto>> GetMyOrder(int orderId)
    {
        var clientId = GetUserIdFromToken();
        var result = await service.GetOrderByIdForClientAsync(orderId, clientId);
        return result is null ? NotFound("Nie znaleziono zamówienia.") : Ok(result);
    }

    [Authorize(Roles = "Klient")]
    [HttpPatch("{orderId}/me/cancel")]
    public async Task<ActionResult> CancelMyOrder(int orderId)
    {
        var clientId = GetUserIdFromToken();
        var canceled = await service.CancelOrderAsync(orderId, clientId);
        return canceled ? NoContent() : BadRequest("Nie znaleziono zamówienia lub jest już przygotowywane.");
    }

    //employee
    [Authorize(Roles = "Kelner,Menedżer")]
    [HttpPost("pos")]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder(CreateOrderDto order)
    {
        var createdOrder = await service.CreateOrderAsync(null, order); 
        return Ok(createdOrder);
    }

    [Authorize(Roles = "Kelner,Kucharz,Menedżer")]
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<FullOrderResponseDto>>> GetActiveOrders()
        => Ok(await service.GetAllActiveOrdersAsync());

    [Authorize(Roles = "Kelner,Menedżer")]
    [HttpPatch("{orderId}/status")]
    public async Task<ActionResult> UpdateOrderStatus(int orderId, UpdateOrderStatusDto status)
    {
        var updated = await service.UpdateOrderStatusAsync(orderId, status);
        return updated ? NoContent() : BadRequest("Nie znaleziono zamówienia.");
    }

    [Authorize(Roles = "Kelner,Menedżer")]
    [HttpPatch("{orderId}/assign")]
    public async Task<ActionResult> AssignEmployeeToOrder(int orderId)
    {
        var employeeId = GetUserIdFromToken();
        var assigned = await service.AssignEmployeeToOrderAsync(orderId, employeeId);
        return assigned ? NoContent() : BadRequest("Nie znaleziono zamówienia.");
    }

    [Authorize(Roles = "Kucharz")]
    [HttpPatch("{orderId}/items/{itemId}/status")]
    public async Task<ActionResult> UpdateOrderItemStatus(int orderId, int itemId, UpdateOrderItemStatusDto dto)
    {
        var employeeId = GetUserIdFromToken();
        var updated = await service.UpdateOrderItemStatusAsync(orderId, itemId, employeeId,dto);
        return updated ? NoContent() : BadRequest("Nie znaleziono pozycji.");
    }
    
    [Authorize(Roles = "Kelner,Kucharz,Menedżer")]
    [HttpPatch("{orderId}/estimated-time")]
    public async Task<ActionResult> UpdateEstimatedTime(int orderId, UpdateOrderEstimatedTimeDto dto)
    {
        var updated = await service.UpdateEstimatedPreparationTimeAsync(orderId, dto.EstimatedTimeInMinutes);
        return updated ? NoContent() : BadRequest("Nie znaleziono zamówienia.");
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