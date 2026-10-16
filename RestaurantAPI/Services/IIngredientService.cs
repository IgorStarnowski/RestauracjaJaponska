using Microsoft.AspNetCore.SignalR;
using RestaurantAPI.Dtos.Ingredient;

namespace RestaurantAPI.Services
{
    public interface IIngredientService
    {
        Task<IngredientResponseDto> AddIngredientAsync(CreateIngredientDto dto);
        Task<IEnumerable<IngredientResponseDto>> GetAllIngredientsAsync();
        Task<IngredientResponseDto?> GetIngredientByIdAsync(int id);
        Task<bool> DeleteIngredientAsync(int id);
        Task<bool> UpdateIngredientAsync(int id, UpdateIngredientDto dto);
    }
}
