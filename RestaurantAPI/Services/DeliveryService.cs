using Microsoft.EntityFrameworkCore;
using RestaurantAPI.Data;
using RestaurantAPI.Dtos.Delivery;
using RestaurantAPI.Enums;

namespace RestaurantAPI.Services;

public class DeliveryService(AppDbContext context) : IDeliveryService
{
    public async Task<IEnumerable<DeliveryResponseDto>> GetAvailableDeliveriesAsync()
        => await context.Deliveries.Where(d => d.DeliveryStatus == DeliveryStatus.OczekujeNaKuriera)
            .Select(d => new DeliveryResponseDto(
                d.DeliveryId,
                d.DeliveryStatus,
                string.IsNullOrEmpty(d.Address.ApartmentNumber)
                ?$"{d.Address.City}, {d.Address.Street} {d.Address.BuildingNumber}"
                : $"{d.Address.City}, {d.Address.Street} {d.Address.BuildingNumber}/{d.Address.ApartmentNumber}"
            )).ToListAsync();

    public async Task<IEnumerable<DeliveryResponseDto>> GetEmployeeDelivery(int employeeId)
        => await context.Deliveries.Where(d => d.EmployeeId == employeeId)
            .Select(d => new DeliveryResponseDto(
                d.DeliveryId,
                d.DeliveryStatus,
                string.IsNullOrEmpty(d.Address.ApartmentNumber)
                    ?$"{d.Address.City}, {d.Address.Street} {d.Address.BuildingNumber}"
                    : $"{d.Address.City}, {d.Address.Street} {d.Address.BuildingNumber}/{d.Address.ApartmentNumber}"
            )).ToListAsync();

    public async Task<bool> AssignEmployeeAsync(int deliveryId, int emloyeeId)
    {
        var delivery = await context.Deliveries.FindAsync(deliveryId);
        if (delivery is null) return false;
        
        delivery.EmployeeId = emloyeeId;
        delivery.DeliveryStatus = DeliveryStatus.WDrodze;
        delivery.DepartureTime = DateTime.UtcNow;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateDeliveryStatusAsync(int deliveryId, int employeeId, UpdateDeliveryStatusDto dto)
    {
        var delivery = await context.Deliveries
            .Include(d => d.Order)
            .FirstOrDefaultAsync(d => d.DeliveryId == deliveryId && d.EmployeeId == employeeId);
        
        if (delivery is null) return false;
        
        delivery.DeliveryStatus =  dto.DeliveryStatus;
        if (dto.DeliveryStatus == DeliveryStatus.Dostarczone)
        {
            delivery.DeliveryTime = DateTime.UtcNow;

            if (delivery.Order != null)
            {
                delivery.Order.Status = OrderStatus.Zakonczone;
            }
        }

        await context.SaveChangesAsync();
        return true;
        
    }
}