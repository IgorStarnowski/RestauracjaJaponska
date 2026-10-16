using FluentValidation;
using RestaurantAPI.Dtos.OrderItem;

namespace RestaurantAPI.Validators;

public class UpdateOrderItemStatusDtoValidator : AbstractValidator<UpdateOrderItemStatusDto>
{
    public UpdateOrderItemStatusDtoValidator()
    {
        RuleFor(x => x.OrderItemStatus)
            .IsInEnum().WithMessage("Podano niepoprawny status pozycji zamówienia.");
    }
}