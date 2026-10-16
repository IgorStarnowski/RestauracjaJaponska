using FluentValidation;
using RestaurantAPI.Dtos.Dish;

namespace RestaurantAPI.Validators;

public class UpdateDishDtoValidator : AbstractValidator<UpdateDishDto>
{
    public UpdateDishDtoValidator()
    {
        RuleFor(dish => dish.Name)
            .NotEmpty().WithMessage("Nazwa dania jest wymagana.")
            .MaximumLength(100).WithMessage("Nazwa nie może być dłuższa niż 100 znaków.");

        RuleFor(dish => dish.Description)
            .MaximumLength(500).WithMessage("Opis jest zbyt długi.");

        RuleFor(dish => dish.Price)
            .GreaterThan(0).WithMessage("Cena dania musi być większa od zera.");

        RuleFor(dish => dish.IngredientIDs)
            .NotNull().WithMessage("Lista składników nie może być nullem.");
    }
}