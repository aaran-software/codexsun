using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckoutResilienceAndReservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "orders",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "orders",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingMethod",
                table: "orders",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "order_inventory_reservations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrderItemId = table.Column<int>(type: "integer", nullable: false),
                    ProductInventoryId = table.Column<int>(type: "integer", nullable: true),
                    VendorUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    ReleasedQuantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_order_inventory_reservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_order_inventory_reservations_order_items_OrderItemId",
                        column: x => x.OrderItemId,
                        principalTable: "order_items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_order_inventory_reservations_product_inventory_ProductInven~",
                        column: x => x.ProductInventoryId,
                        principalTable: "product_inventory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_order_inventory_reservations_users_VendorUserId",
                        column: x => x.VendorUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_orders_CustomerUserId_IdempotencyKey",
                table: "orders",
                columns: new[] { "CustomerUserId", "IdempotencyKey" });

            migrationBuilder.CreateIndex(
                name: "IX_order_inventory_reservations_OrderItemId",
                table: "order_inventory_reservations",
                column: "OrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_order_inventory_reservations_ProductInventoryId",
                table: "order_inventory_reservations",
                column: "ProductInventoryId");

            migrationBuilder.CreateIndex(
                name: "IX_order_inventory_reservations_VendorUserId",
                table: "order_inventory_reservations",
                column: "VendorUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "order_inventory_reservations");

            migrationBuilder.DropIndex(
                name: "IX_orders_CustomerUserId_IdempotencyKey",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "ShippingMethod",
                table: "orders");
        }
    }
}
