using FluentValidation;
using RestaurantAPI.Dtos.Ingredient;

namespace RestaurantAPI.Validators;

public class CreateIngredientDtoValidator : AbstractValidator<CreateIngredientDto>
{
    public CreateIngredientDtoValidator()
    {
        RuleFor(i => i.Name)
            .NotEmpty().WithMessage("Nazwa składnika jest wymagana.")
            .MaximumLength(50).WithMessage("Nazwa jest zbyt długa.");
    }
}