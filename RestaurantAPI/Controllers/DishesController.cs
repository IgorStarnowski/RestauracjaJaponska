using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestaurantAPI.Dtos.Dish;
using RestaurantAPI.Services;

namespace RestaurantAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DishesController(IDishService service) : ControllerBase
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DishResponseDto>>> GetDishes() 
            => Ok(await service.GetActiveDishesAsync());

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<DishResponseDto>> GetDish(int id)
        {
            var dish = await service.GetDishByIdAsync(id);
            return dish is null ? NotFound("Nie znaleziono dania o podanym ID") : Ok(dish);
        }

        [Authorize(Roles = "Menedżer")]
        [HttpGet("all")]
        public async Task<ActionResult> GetAllDishesForAdmin()
            => Ok(await service.GetAllDishesAsync());
        
        [Authorize(Roles = "Menedżer")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDish(int id)
        {
            var deleted = await service.DeleteDishAsync(id);
            return deleted ? NoContent() : NotFound("Nie znaleziono dania o podanym ID");
        }

        [Authorize(Roles = "Menedżer")]
        [HttpPost]
        public async Task<ActionResult<DishResponseDto>> AddDish([FromForm] CreateDishDto dto)
        {
           var createdDish = await service.AddDishAsync(dto);
           return CreatedAtAction(nameof(GetDish), new { id = createdDish.DishId }, createdDish);
        }

        [Authorize(Roles = "Menedżer")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateDish(int id, UpdateDishDto dto)
        {
            var updated = await service.UpdateDishAsync(id, dto);
            return updated ? NoContent() : NotFound("Nie znaleziono dania o podanym ID");
        }

        [Authorize(Roles = "Menedżer")]
        [HttpPatch("{id}/image")]
        public async Task<IActionResult> UpdateImage(int id, IFormFile? image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest("Nie przesłano pliku.");
            }
            await service.UpdateDishImageAsync(id, image);
            return NoContent();
        }

    }
}
