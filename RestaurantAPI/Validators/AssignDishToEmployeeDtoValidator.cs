using FluentValidation;
using RestaurantAPI.Dtos.Employee;

namespace RestaurantAPI.Validators;

public class AssignDishToEmployeeDtoValidator : AbstractValidator<AssignDishToEmployeeDto>
{
    public AssignDishToEmployeeDtoValidator()
    {
        RuleFor(x => x.DishIds)
            .NotNull().WithMessage("Lista ID dań nie może być nullem (może być pusta, jeśli czyścisz przypisania).");
    }
}