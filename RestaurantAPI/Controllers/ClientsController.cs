using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestaurantAPI.Dtos.Address;
using RestaurantAPI.Dtos.Auth;
using RestaurantAPI.Dtos.Client;
using RestaurantAPI.Models;
using RestaurantAPI.Services;

namespace RestaurantAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController(IClientService service) : ControllerBase
    {
        //public
        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<ClientResponseDto>> AddClient(CreateClientDto client)
        {
            var createdClient = await service.AddClientAsync(client);
            return CreatedAtAction(nameof(GetClient), new { id = createdClient.ClientId }, createdClient);
        }
        
        //client
        [Authorize(Roles = "Klient")]
        [HttpGet("me")]
        public async Task<ActionResult<ClientResponseDto>> GetClient()
        {
            var clientId = GetUserIdFromToken();
            var client = await service.GetClientByIdAsync(clientId);
            return client is null ? NotFound("Nie znaleziono klienta o podanym ID") : Ok(client);
        }
        
        [Authorize(Roles = "Klient")]
        [HttpPut("me")]
        public async Task<ActionResult> UpdateClient(UpdateClientDto dto)
        {
            var clientId = GetUserIdFromToken();
            var updated = await service.UpdateClientAsync(clientId, dto);
            return updated ? NoContent() : NotFound("Klient z danym id nie zostal odnaleziony");
        }

        [Authorize(Roles = "Klient")]
        [HttpDelete("me")]
        public async Task<ActionResult> DeleteAccount()
        {
            var clientId = GetUserIdFromToken();
            var deleted = await service.DeleteClientAsync(clientId);
            return deleted ? NoContent() : NotFound("Klient z danym id nie zostal odnaleziony");
        }
        
        [Authorize(Roles = "Klient")]
        [HttpGet("me/addresses")]
        public async Task<ActionResult<IEnumerable<AddressResponseDto>>> GetAddresses()
        {
            var clientId = GetUserIdFromToken();
            var addresses = await service.GetAddressesAsync(clientId);
            return addresses is null ? NotFound("Klient z danym id nie zostal odnaleziony") : Ok(addresses);
        }
        
        [Authorize(Roles = "Klient")]
        [HttpPost("me/addresses")]
        public async Task<ActionResult<AddressResponseDto>> AddAddress(CreateAddressDto dto)
        {
            var clientId = GetUserIdFromToken();
            var createdAddress = await service.AddAddressAsync(clientId, dto);
            return createdAddress is null ? NotFound("Klient z danym id nie zostal odnaleziony") : Ok(createdAddress);
        }
        
        [Authorize(Roles = "Klient")]
        [HttpPut("me/addresses/{addressId}")]
        public async Task<ActionResult> UpdateAddress(int addressId, UpdateAddressDto dto)
        {
            var clientId =  GetUserIdFromToken();
            var updated = await service.UpdateAddressAsync(clientId, addressId, dto);
            return updated ? NoContent() : NotFound("Klient z danym id oraz adresem nie zostal odnaleziony");
        }
        
        [Authorize(Roles = "Klient")]
        [HttpDelete("me/addresses/{addressId}")]
        public async Task<ActionResult> DeleteAddress(int addressId)
        {
            var clientId = GetUserIdFromToken();
            var deleted = await service.DeleteAddressAsync(clientId, addressId);
            return deleted ? NoContent() : NotFound("Klient z danym id oraz adresem nie zostal odnaleziony");
        }
        
        [Authorize(Roles = "Klient")]
        [HttpPatch("me/password")]
        public async Task<ActionResult> ChangeMyPassword(ChangePasswordDto dto)
        {
            var clientId = GetUserIdFromToken();
            var changed = await service.ChangeClientPasswordAsync(clientId, dto);
            return changed ? NoContent() : BadRequest("Aktualne hasło jest nieprawidłowe."); 
        }
        
        //employee
        [Authorize(Roles = "Menedżer")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientResponseDto>>> GetClients()
            => Ok(await service.GetAllClientsAsync());

        [Authorize(Roles = "Menedżer,Kelner")]
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientResponseDto>> GetClient(int id)
        {
            var client = await service.GetClientByIdAsync(id);
            return client is null ? NotFound("Nie znaleziono klienta o podanym ID") : Ok(client);
        }

        [Authorize(Roles = "Menedżer")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteClient(int id)
        {
            var deleted = await service.DeleteClientAsync(id);
            return deleted ? NoContent() : NotFound("Klient z danym id nie zostal odnaleziony");
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
}
