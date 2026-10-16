using RestaurantAPI.Models;

namespace RestaurantAPI.Services;

public interface IPayUService
{
    Task<string> CreatePaymentAsync(Order order);
    Task ProcessNotificationAsync(string body, string signatureHeader);
}