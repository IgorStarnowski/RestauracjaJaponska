using FluentValidation;
using RestaurantAPI.Dtos.Client;

namespace RestaurantAPI.Validators;

public class CreateClientDtoValidator : AbstractValidator<CreateClientDto>
{
    public CreateClientDtoValidator()
    {
        RuleFor(client => client.Name)
            .NotEmpty().WithMessage("Imię jest wymagane.")
            .MaximumLength(50).WithMessage("Imię nie może być dłuższe niż 50 znaków.");
        RuleFor(client => client.PhoneNumber)
            .NotEmpty()
            .Matches(@"^\d{9}$").WithMessage("Numer telefonu musi składać się z 9 cyfr.");
        RuleFor(client => client.Email)
            .NotEmpty()
            .EmailAddress().WithMessage("Podano niepoprawny format adresu email.");
        RuleFor(client => client.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Hasło musi mieć conajmniej 8 znaków.");
        RuleFor(client => client.PostalCode)
            .Matches(@"^\d{2}-\d{3}$").WithMessage("Wymagany format kodu pocztowego to XX-XXX.");
    }
    
}

