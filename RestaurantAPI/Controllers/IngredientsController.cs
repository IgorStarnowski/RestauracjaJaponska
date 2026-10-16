using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestaurantAPI.Dtos.Ingredient;
using RestaurantAPI.Services;

namespace RestaurantAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IngredientsController(IIngredientService service) : ControllerBase
    {
        [Authorize(Roles = "Menedżer,Kucharz")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IngredientResponseDto>>> GetIngredients() 
            => Ok(await service.GetAllIngredientsAsync());

        [Authorize(Roles = "Menedżer,Kucharz")]
        [HttpGet("{id}")]
        public async Task<ActionResult<IngredientResponseDto>> GetIngredient(int id)
        {
            var ingredient = await service.GetIngredientByIdAsync(id);
            return ingredient is null ? NotFound("Nie znaleziono skladnika o podanym ID") : Ok(ingredient); 
        }

        [Authorize(Roles = "Menedżer")]
        [HttpPost]
        public async Task<ActionResult<IngredientResponseDto>> AddIngredient(CreateIngredientDto dto)
        {
            var createdIngredient = await service.AddIngredientAsync(dto);
            return CreatedAtAction(nameof(GetIngredient), new { id = createdIngredient.IngredientId }, createdIngredient);
        }

        [Authorize(Roles = "Menedżer")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteIngredient(int id)
        {
            var deleted = await service.DeleteIngredientAsync(id);
            return deleted ? NoContent() : NotFound("Nie znaleziono skladnika o podanym ID");
        }

        [Authorize(Roles = "Menedżer")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateIngredient(int id, UpdateIngredientDto dto)
        {
            var updated = await service.UpdateIngredientAsync(id, dto);
            return updated ? NoContent() : NotFound("Nie znaleziono skladnika o podanym ID");
        }
    }
}
