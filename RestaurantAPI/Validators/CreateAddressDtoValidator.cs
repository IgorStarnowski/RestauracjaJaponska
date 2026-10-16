using FluentValidation;
using RestaurantAPI.Dtos.Address;

namespace RestaurantAPI.Validators;

public class CreateAddressDtoValidator : AbstractValidator<CreateAddressDto>
{
    public CreateAddressDtoValidator()
    {
        RuleFor(a => a.City).NotEmpty().WithMessage("Miasto jest wymagane.");
        RuleFor(a => a.Street).NotEmpty().WithMessage("Ulica jest wymagana.");
        RuleFor(a => a.BuildingNumber).NotEmpty().WithMessage("Numer budynku jest wymagany.");
        RuleFor(a => a.PostalCode).Matches(@"^\d{2}-\d{3}$").WithMessage("Wymagany format to XX-XXX.");
    }
}