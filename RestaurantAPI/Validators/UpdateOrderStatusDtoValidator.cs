using FluentValidation;
using RestaurantAPI.Dtos.Order;

namespace RestaurantAPI.Validators;

public class UpdateOrderStatusDtoValidator : AbstractValidator<UpdateOrderStatusDto>
{
    public UpdateOrderStatusDtoValidator()
    {
        RuleFor(x => x.OrderStatus)
            .IsInEnum().WithMessage("Podano niepoprawny status zamówienia.");
    }
}