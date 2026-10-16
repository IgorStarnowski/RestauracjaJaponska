using FluentValidation;
using RestaurantAPI.Dtos.Order;
using RestaurantAPI.Enums;

namespace RestaurantAPI.Validators;

public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator()
    {
        RuleFor(order => order.OrderType)
            .IsInEnum().WithMessage("Niepoprawny typ zamówienia.");

        RuleFor(order => order.TableNumber)
            .NotNull()
            .GreaterThan(0)
            .When(order => order.OrderType == OrderType.NaMiejscu)
            .WithMessage("Dla zamówień na miejscu wymagane jest podanie numeru stolika.");

        RuleFor(order => order.AddressId)
            .NotNull()
            .When(order => order.OrderType == OrderType.Dostawa)
            .WithMessage("Dla zamówień z dostawą wymagany jest adres.");

        RuleFor(order => order.OrderItems)
            .NotEmpty().WithMessage("Zamówienie musi zawierać co najmniej jedno danie.");

        RuleForEach(order => order.OrderItems)
            .SetValidator(new CreateOrderItemDtoValidator());
            
        RuleFor(order => order.CustomerNotes)
            .MaximumLength(500).WithMessage("Notatki do zamówienia nie mogą przekraczać 500 znaków.");
    }
}