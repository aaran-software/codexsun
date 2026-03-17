using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class AddRazorpayPaymentIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentGatewayOrderId",
                table: "orders",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentProvider",
                table: "orders",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_orders_PaymentGatewayOrderId",
                table: "orders",
                column: "PaymentGatewayOrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_orders_PaymentGatewayOrderId",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "PaymentGatewayOrderId",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "PaymentProvider",
                table: "orders");
        }
    }
}
