using RestaurantAPI.Enums;

namespace RestaurantAPI.Dtos.Delivery;

public record DeliveryInfoResponseDto(
    int DeliveryId,
    DeliveryStatus DeliveryStatus,
    string FullAddress,
    string? CourierName
);