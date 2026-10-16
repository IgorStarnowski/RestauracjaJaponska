using Microsoft.EntityFrameworkCore;
using RestaurantAPI.Data;
using RestaurantAPI.Dtos.Address;
using RestaurantAPI.Dtos.Client;
using RestaurantAPI.Models;
using System.Runtime.InteropServices;
using RestaurantAPI.Dtos.Auth;

namespace RestaurantAPI.Services
{
    public class ClientService(AppDbContext context) : IClientService
    {

        public async Task<ClientResponseDto> AddClientAsync(CreateClientDto dto)
        {
            var newClient = new Client 
            { 
                Name = dto.Name, 
                LastName = dto.LastName, 
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Addresses = new List<Address>
                {
                    new Address
                    {
                        City = dto.City,
                        PostalCode = dto.PostalCode,
                        Street = dto.Street,
                        BuildingNumber = dto.BuildingNumber,
                        ApartmentNumber = dto.ApartmentNumber   
                    }
                }
            };
            

            context.Clients.Add(newClient);
            await context.SaveChangesAsync();

            ClientResponseDto result = new ClientResponseDto
            (
                newClient.ClientId,
                newClient.Name,
                newClient.LastName,
                newClient.PhoneNumber
            );

            return result;
        }
        
        public async Task<AddressResponseDto?> AddAddressAsync(int id, CreateAddressDto dto)
        {
            var client = await context.Clients.FindAsync(id);
            if (client is null) return null;

            var newAddress = new Address
            {
                City = dto.City,
                PostalCode = dto.PostalCode,
                Street = dto.Street,
                BuildingNumber = dto.BuildingNumber,
                ApartmentNumber = dto.ApartmentNumber,
                ClientId = id
            };

            context.Addresses.Add(newAddress);
            await context.SaveChangesAsync();

            var result = new AddressResponseDto(
                newAddress.AddressId,
                newAddress.City,
                newAddress.PostalCode,
                newAddress.Street,
                newAddress.BuildingNumber,
                newAddress.ApartmentNumber,
                newAddress.ClientId
            );

            return result;
        }

        public async Task<bool> DeleteClientAsync(int id)
        {
            var clientToDelete = await context.Clients
                .Include(c => c.Addresses)
                .FirstOrDefaultAsync(c => c.ClientId == id);
            
            if( clientToDelete is null) return false;

            clientToDelete.IsDeleted = true;
            clientToDelete.Name = "Usunięto";
            clientToDelete.LastName = "";
            clientToDelete.PhoneNumber = "";
            clientToDelete.Email = "";
            clientToDelete.PasswordHash = "";

            foreach (var address in clientToDelete.Addresses)
            {
                address.City = "Usunięto";
                address.PostalCode = "";
                address.Street = "Usunięto";
                address.BuildingNumber = "";
                address.ApartmentNumber = null;
                address.IsDeleted = true;
            }
            
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ClientResponseDto>> GetAllClientsAsync()
            => await context.Clients.Select(c => new ClientResponseDto
            (
                c.ClientId,
                c.Name,
                c.LastName,
                c.PhoneNumber
            )).ToListAsync();

        public async Task<ClientResponseDto?> GetClientByIdAsync(int id)
        {
            var result = await context.Clients.Where(c => c.ClientId == id)
                .Select(c => new ClientResponseDto
                (
                    c.ClientId,
                    c.Name,
                    c.LastName,
                    c.PhoneNumber
                )).FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> UpdateClientAsync(int id, UpdateClientDto dto)
        {
            var clientToChange = await context.Clients.FindAsync(id);
            if(clientToChange is null) return false;

            clientToChange.Name = dto.Name;
            clientToChange.LastName = dto.LastName;
            clientToChange.PhoneNumber = dto.PhoneNumber;
            clientToChange.Email = dto.Email;
            
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AddressResponseDto>?> GetAddressesAsync(int id)
        {
            var clientExists = await context.Clients.AnyAsync(c => c.ClientId == id);
            if (clientExists is false) return null;

            var addresses = await context.Addresses.Where(c => c.ClientId == id)
                .Select(a => new AddressResponseDto
                (
                    a.AddressId,
                    a.City,
                    a.PostalCode,
                    a.Street,
                    a.BuildingNumber,
                    a.ApartmentNumber,
                    a.ClientId
                )).ToListAsync();

            return addresses;
        }

        public async Task<bool> DeleteAddressAsync(int clientId, int addressId)
        {
            var addressToDelete = await context.Addresses.FirstOrDefaultAsync(a => a.AddressId == addressId && a.ClientId == clientId);
            if(addressToDelete is null) return false;

            context.Addresses.Remove(addressToDelete);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAddressAsync(int clientId, int addressId, UpdateAddressDto dto)
        {
            var addressToUpdate = await context.Addresses.FirstOrDefaultAsync(a => a.AddressId == addressId && a.ClientId == clientId);
            if (addressToUpdate is null) return false;

            addressToUpdate.City = dto.City;
            addressToUpdate.PostalCode = dto.PostalCode;
            addressToUpdate.Street = dto.Street;
            addressToUpdate.BuildingNumber = dto.BuildingNumber;
            addressToUpdate.ApartmentNumber = dto.ApartmentNumber;

            await context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> ChangeClientPasswordAsync(int clientId, ChangePasswordDto dto)
        {
            var client = await context.Clients.FirstOrDefaultAsync(c => c.ClientId == clientId);
            if (client is null) return false;

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, client.PasswordHash))
            {
                return false; 
            }
    
            client.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
