using FluentValidation;
using RestaurantAPI.Dtos.Client;

namespace RestaurantAPI.Validators;

public class UpdateClientDtoValidator : AbstractValidator<UpdateClientDto>
{
    public UpdateClientDtoValidator()
    {
        RuleFor(client => client.Name)
            .NotEmpty().WithMessage("Imię jest wymagane.")
            .MaximumLength(50).WithMessage("Imię nie może być dłuższe niż 50 znaków.");
            
        RuleFor(client => client.LastName)
            .NotEmpty().WithMessage("Nazwisko jest wymagane.")
            .MaximumLength(50).WithMessage("Nazwisko nie może być dłuższe niż 50 znaków.");

        RuleFor(client => client.PhoneNumber)
            .NotEmpty()
            .Matches(@"^\d{9}$").WithMessage("Numer telefonu musi składać się z 9 cyfr.");

        RuleFor(client => client.Email)
            .NotEmpty()
            .EmailAddress().WithMessage("Podano niepoprawny format adresu email.");
    }
}