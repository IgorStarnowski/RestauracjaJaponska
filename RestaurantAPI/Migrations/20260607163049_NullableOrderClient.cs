using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantAPI.Migrations
{
    /// <inheritdoc />
    public partial class NullableOrderClient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_orders_clients_client_id",
                table: "orders");

            migrationBuilder.AlterColumn<int>(
                name: "client_id",
                table: "orders",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "fk_orders_clients_client_id",
                table: "orders",
                column: "client_id",
                principalTable: "clients",
                principalColumn: "client_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_orders_clients_client_id",
                table: "orders");

            migrationBuilder.AlterColumn<int>(
                name: "client_id",
                table: "orders",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_orders_clients_client_id",
                table: "orders",
                column: "client_id",
                principalTable: "clients",
                principalColumn: "client_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
