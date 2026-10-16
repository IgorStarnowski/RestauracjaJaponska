using Microsoft.EntityFrameworkCore;
using RestaurantAPI.Data;
using RestaurantAPI.Dtos.Dish;
using RestaurantAPI.Models;

namespace RestaurantAPI.Services
{
    public class DishService(AppDbContext context, IWebHostEnvironment environment) : IDishService
    {
        public async Task<DishResponseDto> AddDishAsync(CreateDishDto dto)
        {
            var ingredients = await context.Ingredients
                .Where(i => dto.IngredientIDs.Contains(i.IngredientId))
                .ToListAsync();

            var newDish = new Dish
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                IsActive = dto.IsActive,
                Ingredients = ingredients,
                PriceHistories = new List<PriceHistory>
                {
                    new PriceHistory
                    {
                        Price = dto.Price,
                        ChangeDate = DateTime.UtcNow
                    }
                }
            };

            if (dto.Image != null)
            {
                newDish.ImageUrl = await SaveImageAsync(dto.Image);
            }

            context.Dishes.Add(newDish);
            await context.SaveChangesAsync();

            var ingredientNames = ingredients.Select(i => i.Name).ToList();

            var result = new DishResponseDto
            (
                newDish.DishId,
                newDish.Name,
                newDish.Description,
                newDish.Price,
                newDish.IsActive,
                ingredientNames,
                newDish.ImageUrl
            );

            return result;
        }

        public async Task<bool> UpdateDishImageAsync(int dishId, IFormFile image)
        {
            var dish = await context.Dishes.FindAsync(dishId);
            if(dish is null) { return false; }

            if (!string.IsNullOrEmpty(dish.ImageUrl))
            {
                DeleteOldImage(dish.ImageUrl);
            }

            dish.ImageUrl = await SaveImageAsync(image);
            await context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteDishAsync(int id)
        {
            var dishToDelete = await context.Dishes.FindAsync(id);
            if(dishToDelete is null) return false;

            dishToDelete.IsActive = false;
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<DishResponseDto>> GetActiveDishesAsync() => await context.Dishes.Select(d =>
            new DishResponseDto
            (
                d.DishId,
                d.Name,
                d.Description,
                d.Price,
                d.IsActive,
                d.Ingredients.Select(i => i.Name).ToList(),
                d.ImageUrl
            )).ToListAsync();

        public async Task<IEnumerable<DishResponseDto>> GetAllDishesAsync() => await context.Dishes
            .IgnoreQueryFilters()
            .Select(d => new DishResponseDto
            (
                d.DishId,
                d.Name,
                d.Description,
                d.Price,
                d.IsActive,
                d.Ingredients.Select(i => i.Name).ToList(),
                d.ImageUrl
            )).ToListAsync();

        public async Task<DishResponseDto?> GetDishByIdAsync(int id)
        {
            var result = await context.Dishes.Where(d => d.DishId == id)
                .IgnoreQueryFilters()
                .Select(d => new DishResponseDto
                (
                    d.DishId,
                    d.Name,
                    d.Description,
                    d.Price,
                    d.IsActive,
                    d.Ingredients.Select(i => i.Name).ToList(),
                    d.ImageUrl
                )).FirstOrDefaultAsync();

            return result;
        }

        public async Task<bool> UpdateDishAsync(int id, UpdateDishDto dto)
        {
            var dishToChange = await context.Dishes
                .IgnoreQueryFilters()
                .Include(d => d.Ingredients)
                .Include(d=> d.PriceHistories)
                .FirstOrDefaultAsync(d => d.DishId == id);

            if (dishToChange is null) return false;
            
            var ingredients = await context.Ingredients
                .Where(i => dto.IngredientIDs.Contains(i.IngredientId))
                .ToListAsync();

            dishToChange.Name = dto.Name;
            dishToChange.Description = dto.Description;
            if (dishToChange.Price != dto.Price)
            {
                dishToChange.PriceHistories.Add(new PriceHistory
                {
                    Price = dto.Price,
                    ChangeDate = DateTime.UtcNow
                });
                
                dishToChange.Price = dto.Price;
            }
            dishToChange.IsActive = dto.IsActive;
            dishToChange.Ingredients = ingredients;

            await context.SaveChangesAsync();
            return true;
        }
        
        private async Task<string> SaveImageAsync(IFormFile file)
        {
            var uploadsFolder = Path.Combine(environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images", "dishes");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            return Path.Combine("images", "dishes", uniqueFileName).Replace("\\", "/"); 
        }

        private void DeleteOldImage(string imageUrl)
        {
            var oldImagePath = Path.Combine(environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), imageUrl.Replace("/", Path.DirectorySeparatorChar.ToString()));
        
            if (File.Exists(oldImagePath))
            {
                File.Delete(oldImagePath);
            }
        }
    }
}
