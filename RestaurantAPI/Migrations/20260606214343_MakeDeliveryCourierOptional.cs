using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeDeliveryCourierOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_deliveries_employees_employee_id",
                table: "deliveries");

            migrationBuilder.DropForeignKey(
                name: "fk_order_items_employees_employee_id",
                table: "order_items");

            migrationBuilder.AlterColumn<int>(
                name: "employee_id",
                table: "order_items",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "employee_id",
                table: "deliveries",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "fk_deliveries_employees_employee_id",
                table: "deliveries",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "employee_id");

            migrationBuilder.AddForeignKey(
                name: "fk_order_items_employees_employee_id",
                table: "order_items",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "employee_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_deliveries_employees_employee_id",
                table: "deliveries");

            migrationBuilder.DropForeignKey(
                name: "fk_order_items_employees_employee_id",
                table: "order_items");

            migrationBuilder.AlterColumn<int>(
                name: "employee_id",
                table: "order_items",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "employee_id",
                table: "deliveries",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_deliveries_employees_employee_id",
                table: "deliveries",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_order_items_employees_employee_id",
                table: "order_items",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
