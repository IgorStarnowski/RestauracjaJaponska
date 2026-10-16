using Microsoft.EntityFrameworkCore;
using RestaurantAPI.Data;
using RestaurantAPI.Dtos.Ingredient;
using RestaurantAPI.Models;

namespace RestaurantAPI.Services
{
    public class IngredientService(AppDbContext context) : IIngredientService
    {
        public async Task<IngredientResponseDto> AddIngredientAsync(CreateIngredientDto dto)
        {
            var newIngredient = new Ingredient
            {
                Name = dto.Name,
                IsAllergen = dto.IsAllergen
            };

            context.Ingredients.Add(newIngredient);
            await context.SaveChangesAsync();

            var result = new IngredientResponseDto
            (
                newIngredient.IngredientId,
                newIngredient.Name,
                newIngredient.IsAllergen
            );

            return result;
        }

        public async Task<bool> DeleteIngredientAsync(int id)
        {
            var ingredientToDelete = await context.Ingredients.FindAsync(id);
            if (ingredientToDelete is null) return false;

            ingredientToDelete.IsDeleted = true;
            await context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<IngredientResponseDto>> GetAllIngredientsAsync() => await context.Ingredients
            .Select(c => new IngredientResponseDto
            (
                c.IngredientId,
                c.Name,
                c.IsAllergen
            )).ToListAsync();

        public async Task<IngredientResponseDto?> GetIngredientByIdAsync(int id)
        {
            var result = await context.Ingredients.Where(I => I.IngredientId == id)
                .Select(c => new IngredientResponseDto
                (
                    c.IngredientId,
                    c.Name,
                    c.IsAllergen
                )).FirstOrDefaultAsync();

            return result;
        }

        public async Task<bool> UpdateIngredientAsync(int id, UpdateIngredientDto dto)
        {
            var ingredientToUpdate = await context.Ingredients.FindAsync(id);
            if(ingredientToUpdate is null) return false;

            ingredientToUpdate.Name = dto.Name;
            ingredientToUpdate.IsAllergen = dto.IsAllergen;

            await context.SaveChangesAsync();

            return true;
        }
    }
}
