using RestaurantAPI.Dtos.Address;
using RestaurantAPI.Dtos.Client;
using System.ComponentModel;
using RestaurantAPI.Dtos.Auth;

namespace RestaurantAPI.Services
{
    public interface IClientService
    {
        Task<IEnumerable<ClientResponseDto>> GetAllClientsAsync();
        Task<ClientResponseDto> AddClientAsync(CreateClientDto dto);
        Task<ClientResponseDto?> GetClientByIdAsync(int id);
        Task<bool> DeleteClientAsync(int id);
        Task<bool> UpdateClientAsync(int id, UpdateClientDto dto);
        Task<AddressResponseDto?> AddAddressAsync(int id, CreateAddressDto dto);
        Task<IEnumerable<AddressResponseDto>?> GetAddressesAsync(int id);
        Task<bool> DeleteAddressAsync(int clientId, int addressId);
        Task<bool> UpdateAddressAsync(int clientId, int addressId, UpdateAddressDto dto);
        Task<bool> ChangeClientPasswordAsync(int clientId, ChangePasswordDto dto);
    }
}
