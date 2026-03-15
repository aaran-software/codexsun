using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiChannelProductPricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_product_prices_ProductId",
                table: "product_prices");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "product_prices",
                newName: "price");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EndDate",
                table: "product_prices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinQuantity",
                table: "product_prices",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "ProductVariantId",
                table: "product_prices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SalesChannel",
                table: "product_prices",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "StartDate",
                table: "product_prices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_product_prices_ProductId_ProductVariantId_PriceType_SalesCh~",
                table: "product_prices",
                columns: new[] { "ProductId", "ProductVariantId", "PriceType", "SalesChannel", "MinQuantity" });

            migrationBuilder.CreateIndex(
                name: "IX_product_prices_ProductVariantId",
                table: "product_prices",
                column: "ProductVariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_product_prices_product_variants_ProductVariantId",
                table: "product_prices",
                column: "ProductVariantId",
                principalTable: "product_variants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_product_prices_product_variants_ProductVariantId",
                table: "product_prices");

            migrationBuilder.DropIndex(
                name: "IX_product_prices_ProductId_ProductVariantId_PriceType_SalesCh~",
                table: "product_prices");

            migrationBuilder.DropIndex(
                name: "IX_product_prices_ProductVariantId",
                table: "product_prices");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "product_prices");

            migrationBuilder.DropColumn(
                name: "MinQuantity",
                table: "product_prices");

            migrationBuilder.DropColumn(
                name: "ProductVariantId",
                table: "product_prices");

            migrationBuilder.DropColumn(
                name: "SalesChannel",
                table: "product_prices");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "product_prices");

            migrationBuilder.RenameColumn(
                name: "price",
                table: "product_prices",
                newName: "Amount");

            migrationBuilder.CreateIndex(
                name: "IX_product_prices_ProductId",
                table: "product_prices",
                column: "ProductId");
        }
    }
}
