using RestaurantAPI.Dtos.Delivery;
using RestaurantAPI.Enums;

namespace RestaurantAPI.Services;

public interface IDeliveryService
{
    Task<IEnumerable<DeliveryResponseDto>> GetAvailableDeliveriesAsync();
    Task<IEnumerable<DeliveryResponseDto>> GetEmployeeDelivery(int employeeId);
    Task<bool> AssignEmployeeAsync(int deliveryId, int emloyeeId);
    Task<bool> UpdateDeliveryStatusAsync(int deliveryId, int employeeId, UpdateDeliveryStatusDto dto);
}