using RestaurantAPI.Enums;

namespace RestaurantAPI.Dtos.Delivery;

public record DeliveryResponseDto(
    int DeliveryId,
    DeliveryStatus DeliveryStatus,
    string FullAddress
    );