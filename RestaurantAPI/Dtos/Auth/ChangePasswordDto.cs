namespace RestaurantAPI.Dtos.Auth;

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword
);
