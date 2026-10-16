using Microsoft.EntityFrameworkCore;
using RestaurantAPI.Models;

namespace RestaurantAPI.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<Dish> Dishes => Set<Dish>();
        public DbSet<Ingredient> Ingredients => Set<Ingredient>();
        public DbSet<Address> Addresses => Set<Address>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Delivery> Deliveries => Set<Delivery>();
        public DbSet<PriceHistory> PriceHistories => Set<PriceHistory>();
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Dish>().HasQueryFilter(d => d.IsActive);
            
            modelBuilder.Entity<Order>().Property(o => o.Status).HasConversion<string>();
            modelBuilder.Entity<Order>().Property(o => o.OrderType).HasConversion<string>();
            modelBuilder.Entity<Delivery>().Property(d => d.DeliveryStatus).HasConversion<string>();
            modelBuilder.Entity<OrderItem>().Property(o => o.Status).HasConversion<string>();
        }
    }
}
