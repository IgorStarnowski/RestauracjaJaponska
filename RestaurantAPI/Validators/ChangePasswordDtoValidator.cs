using FluentValidation;
using RestaurantAPI.Dtos.Auth;

namespace RestaurantAPI.Validators;

public class ChangePasswordDtoValidator : AbstractValidator<ChangePasswordDto>
{
    public ChangePasswordDtoValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty().WithMessage("Podaj stare hasło.");
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Nowe hasło musi mieć co najmniej 8 znaków.");
        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.NewPassword).WithMessage("Hasła nie są identyczne.");
    }
}