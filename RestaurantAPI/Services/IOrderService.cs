using RestaurantAPI.Dtos.Order;
using RestaurantAPI.Dtos.OrderItem;
using RestaurantAPI.Enums;

namespace RestaurantAPI.Services;

public interface IOrderService
{
    //metody klienta
    Task<IEnumerable<OrderResponseDto>> GetClientOrdersAsync(int clientId);
    Task<OrderResponseDto?> GetOrderByIdForClientAsync(int orderId, int clientId);
    Task<CreateOrderResponseDto> CreateOrderAsync(int? clientId, CreateOrderDto dto);
    Task<bool> CancelOrderAsync(int orderId, int clientId);
    
    //metody obslugi
    Task<IEnumerable<FullOrderResponseDto>> GetAllActiveOrdersAsync();
    Task<bool> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto newStatus);
    Task<bool> AssignEmployeeToOrderAsync(int orderId, int employeeId);
    Task<bool> UpdateEstimatedPreparationTimeAsync(int orderId, int estimatedTimeInMinutes);
    
    //metody kuchni
    Task<bool> UpdateOrderItemStatusAsync(int orderId, int itemId, int employeeId, UpdateOrderItemStatusDto dto);
}