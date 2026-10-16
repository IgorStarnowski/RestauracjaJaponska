using FluentValidation;
using RestaurantAPI.Dtos.Employee;

namespace RestaurantAPI.Validators;

public class CreateEmployeeDtoValidator : AbstractValidator<CreateEmployeeDto>
{
    public CreateEmployeeDtoValidator()
    {
        RuleFor(e => e.Name).NotEmpty().WithMessage("Imię jest wymagane.");
        RuleFor(e => e.LastName).NotEmpty().WithMessage("Nazwisko jest wymagane.");
        RuleFor(e => e.Login)
            .NotEmpty()
            .MinimumLength(3).WithMessage("Login musi mieć co najmniej 3 znaki.");
    }
}