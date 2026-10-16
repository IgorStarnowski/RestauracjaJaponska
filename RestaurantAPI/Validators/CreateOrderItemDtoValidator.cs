using FluentValidation;
using RestaurantAPI.Dtos.OrderItem;

namespace RestaurantAPI.Validators;

public class CreateOrderItemDtoValidator : AbstractValidator<CreateOrderItemDto>
{
    public  CreateOrderItemDtoValidator()
    {
        RuleFor(item => item.DishId)
            .GreaterThan(0).WithMessage("Identyfikator dania jest niepoprawny.");
        RuleFor(item => item.Quantity)
            .GreaterThan(0).WithMessage("Ilość porcji musi być większa od zera.");
    }
}