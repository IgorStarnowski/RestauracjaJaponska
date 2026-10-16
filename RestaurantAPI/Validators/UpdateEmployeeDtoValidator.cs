using FluentValidation;
using RestaurantAPI.Dtos.Employee;

namespace RestaurantAPI.Validators;

public class UpdateEmployeeDtoValidator : AbstractValidator<UpdateEmployeeDto>
{
    public UpdateEmployeeDtoValidator()
    {
        RuleFor(e => e.Login)
            .NotEmpty().WithMessage("Login jest wymagany.")
            .MinimumLength(3).WithMessage("Login musi mieć co najmniej 3 znaki.");

        RuleFor(e => e.Name)
            .NotEmpty().WithMessage("Imię jest wymagane.")
            .MaximumLength(50).WithMessage("Imię nie może być dłuższe niż 50 znaków.");

        RuleFor(e => e.LastName)
            .NotEmpty().WithMessage("Nazwisko jest wymagane.")
            .MaximumLength(50).WithMessage("Nazwisko nie może być dłuższe niż 50 znaków.");

        RuleFor(e => e.RoleIds)
            .NotNull().WithMessage("Pracownik musi mieć przypisaną listę ról (może być pusta, ale nie null).");
    }
}