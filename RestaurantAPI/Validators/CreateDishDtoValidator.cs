using FluentValidation;
using RestaurantAPI.Dtos.Dish;

namespace RestaurantAPI.Validators;

public class CreateDishDtoValidator : AbstractValidator<CreateDishDto>
{
    public CreateDishDtoValidator()
    {
        RuleFor(dish => dish.Name)
            .NotEmpty().WithMessage("Nazwa dania jest wymagana.")
            .MaximumLength(100).WithMessage("Nazwa nie może być dłuższa niż 100 znaków.");

        RuleFor(dish => dish.Description)
            .NotEmpty().WithMessage("Opis dania jest wymagany.")
            .MaximumLength(500).WithMessage("Opis jest zbyt długi.");

        RuleFor(dish => dish.Price)
            .GreaterThan(0).WithMessage("Cena dania musi być większa od zera.");

        RuleFor(dish => dish.IngredientIDs)
            .NotEmpty().WithMessage("Danie musi zawierać przynajmniej jeden składnik.");
    }
}