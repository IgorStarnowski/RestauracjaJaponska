using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantAPI.Services;

namespace RestaurantAPI.Controllers;


[Route("api/[controller]")]
[ApiController]
public class WebhooksController(IPayUService payUService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("payu")]
    public async Task<IActionResult> ReceivePayUNotification()
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        var signatureHeader = Request.Headers["OpenPayU-Signature"].ToString();

        try
        {
            await payUService.ProcessNotificationAsync(body, signatureHeader);
            return Ok();
        }
        catch (UnauthorizedAccessException)
        {
            return BadRequest("Niepoprawny podpis transakcji");
        }
        catch (Exception)
        {
            return StatusCode(500, "Wewnetrzny blad serwera przy przetwarzaniu webhooka");
        }
        
    }
}