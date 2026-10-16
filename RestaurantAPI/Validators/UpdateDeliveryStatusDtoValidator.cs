using FluentValidation;
using RestaurantAPI.Dtos.Delivery;

namespace RestaurantAPI.Validators;

public class UpdateDeliveryStatusDtoValidator : AbstractValidator<UpdateDeliveryStatusDto>
{
    public UpdateDeliveryStatusDtoValidator()
    {
        RuleFor(x => x.DeliveryStatus)
            .IsInEnum().WithMessage("Podano niepoprawny status dostawy.");
    }
}