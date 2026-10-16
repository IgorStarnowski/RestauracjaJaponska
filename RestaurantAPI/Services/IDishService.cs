using RestaurantAPI.Dtos.Dish;

namespace RestaurantAPI.Services
{
    public interface IDishService
    {
        Task<IEnumerable<DishResponseDto>> GetActiveDishesAsync();
        Task<IEnumerable<DishResponseDto>> GetAllDishesAsync();
        Task<DishResponseDto?> GetDishByIdAsync(int id);
        Task<DishResponseDto> AddDishAsync(CreateDishDto dto);
        Task<bool> UpdateDishAsync(int id, UpdateDishDto dto);
        Task<bool> UpdateDishImageAsync(int dishId, IFormFile image);
        Task<bool> DeleteDishAsync(int id);
    }
}
