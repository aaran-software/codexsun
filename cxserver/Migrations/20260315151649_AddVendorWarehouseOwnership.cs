using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorWarehouseOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VendorId",
                table: "warehouses",
                type: "integer",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "warehouses",
                keyColumn: "Id",
                keyValue: 1,
                column: "VendorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "warehouses",
                keyColumn: "Id",
                keyValue: 2,
                column: "VendorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "warehouses",
                keyColumn: "Id",
                keyValue: 3,
                column: "VendorId",
                value: null);

            migrationBuilder.UpdateData(
                table: "warehouses",
                keyColumn: "Id",
                keyValue: 4,
                column: "VendorId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_warehouses_VendorId",
                table: "warehouses",
                column: "VendorId");

            migrationBuilder.AddForeignKey(
                name: "FK_warehouses_vendors_VendorId",
                table: "warehouses",
                column: "VendorId",
                principalTable: "vendors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_warehouses_vendors_VendorId",
                table: "warehouses");

            migrationBuilder.DropIndex(
                name: "IX_warehouses_VendorId",
                table: "warehouses");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "warehouses");
        }
    }
}
