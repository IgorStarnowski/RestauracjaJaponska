using RestaurantAPI.Dtos.Delivery;
using RestaurantAPI.Dtos.OrderItem;
using RestaurantAPI.Enums;
using RestaurantAPI.Models;

namespace RestaurantAPI.Dtos.Order;

public record FullOrderResponseDto(
    int OrderId, 
    string OrderNumber, 
    OrderType OrderType,
    int? TableNumber,
    DeliveryInfoResponseDto? Delivery,
    OrderStatus Status, 
    decimal TotalPrice, 
    DateTime OrderDate,
    DateTime? EstimatedPreparationTime,
    string? CustomerNotes,
    List<FullOrderItemResponseDto> Items,
    int? ClientId, 
    string? ClientName,
    string? ClientPhoneNumber,
    int? EmployeeId,
    string? EmployeeName,
    bool IsPaid);
