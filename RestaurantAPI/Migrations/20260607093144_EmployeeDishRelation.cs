using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantAPI.Migrations
{
    /// <inheritdoc />
    public partial class EmployeeDishRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "dish_employee",
                columns: table => new
                {
                    dishes_dish_id = table.Column<int>(type: "integer", nullable: false),
                    employees_employee_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_dish_employee", x => new { x.dishes_dish_id, x.employees_employee_id });
                    table.ForeignKey(
                        name: "fk_dish_employee_dishes_dishes_dish_id",
                        column: x => x.dishes_dish_id,
                        principalTable: "dishes",
                        principalColumn: "dish_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_dish_employee_employees_employees_employee_id",
                        column: x => x.employees_employee_id,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_dish_employee_employees_employee_id",
                table: "dish_employee",
                column: "employees_employee_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dish_employee");
        }
    }
}
