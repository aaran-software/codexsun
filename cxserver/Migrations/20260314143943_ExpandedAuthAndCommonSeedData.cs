using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class ExpandedAuthAndCommonSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "brands",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Codexsun", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Nike", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Adidas", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Puma", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "colours",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Black", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "White", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Blue", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Navy", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Grey", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Red", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 8, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Maroon", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 9, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Olive", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 10, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Green", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 11, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Yellow", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "contact_types",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 6, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Distributor", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Retailer", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "currencies",
                columns: new[] { "Id", "Code", "CreatedAt", "IsActive", "Name", "Symbol", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, "INR", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Indian Rupee", "Rs", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, "USD", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "United States Dollar", "$", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "districts",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "StateId", "UpdatedAt" },
                values: new object[] { 52, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Visakhapatnam", 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "hsncodes",
                columns: new[] { "Id", "Code", "CreatedAt", "Description", "IsActive", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, "61091000", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "T-shirts, singlets and other vests, knitted or crocheted, of cotton", true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, "61099090", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Other T-shirts, singlets and vests, knitted or crocheted", true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, "62052000", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Men's or boys' shirts of cotton", true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "order_types",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Online", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Wholesale", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Retail", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "payment_terms",
                columns: new[] { "Id", "CreatedAt", "Days", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 0, true, "Advance", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 15, true, "Net 15", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 30, true, "Net 30", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 45, true, "Net 45", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "product_groups",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Apparel", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Accessories", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "product_types",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "T-Shirt", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Shirt", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Hoodie", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Polo", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "sizes",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Free Size", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "XS", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "S", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "M", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "L", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "XL", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 8, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "XXL", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 9, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "3XL", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.UpdateData(
                table: "states",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Name", "StateCode" },
                values: new object[] { "Andhra Pradesh", "AP" });

            migrationBuilder.UpdateData(
                table: "states",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "StateCode" },
                values: new object[] { "Arunachal Pradesh", "AR" });

            migrationBuilder.UpdateData(
                table: "states",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CountryId", "Name", "StateCode" },
                values: new object[] { 2, "Assam", "AS" });

            migrationBuilder.InsertData(
                table: "states",
                columns: new[] { "Id", "CountryId", "CreatedAt", "IsActive", "Name", "StateCode", "UpdatedAt" },
                values: new object[,]
                {
                    { 5, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Bihar", "BR", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Chhattisgarh", "CG", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Goa", "GA", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 8, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Gujarat", "GJ", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 9, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Haryana", "HR", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 10, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Himachal Pradesh", "HP", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 11, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Jharkhand", "JH", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 12, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Karnataka", "KA", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 13, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Kerala", "KL", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 14, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Madhya Pradesh", "MP", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 15, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Maharashtra", "MH", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 16, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Manipur", "MN", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 17, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Meghalaya", "ML", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 18, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Mizoram", "MZ", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 19, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Nagaland", "NL", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 20, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Odisha", "OD", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 21, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Punjab", "PB", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 22, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Rajasthan", "RJ", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 23, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Sikkim", "SK", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 24, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tamil Nadu", "TN", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 25, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Telangana", "TS", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 26, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tripura", "TR", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 27, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Uttar Pradesh", "UP", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 28, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Uttarakhand", "UK", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 29, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "West Bengal", "WB", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 30, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Andaman and Nicobar Islands", "AN", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 31, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Chandigarh", "CH", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 32, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Dadra and Nagar Haveli and Daman and Diu", "DH", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 33, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Delhi", "DL", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 34, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Jammu and Kashmir", "JK", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 35, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Ladakh", "LA", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 36, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Lakshadweep", "LD", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 37, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Puducherry", "PY", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 38, 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "California", "CA", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "styles",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Crew Neck", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "V Neck", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Polo", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Oversized", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "transports",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Road Transport", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Air Cargo", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Courier", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Self Pickup", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "units",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "ShortName", "UpdatedAt" },
                values: new object[,]
                {
                    { 6, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Box", "BOX", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Pair", "PAIR", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "Id", "CreatedAt", "Email", "PasswordHash", "RoleId", "Status", "UpdatedAt", "Username" },
                values: new object[,]
                {
                    { new Guid("66666666-6666-6666-6666-666666666666"), new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "management@codexsun.com", "$2a$11$7EqJtq98hPqEX7fNZaFWo.btro5BXkJEfY8NxIfDUBBYwyCXY7bjW", new Guid("11111111-1111-1111-1111-111111111111"), "Active", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "management" },
                    { new Guid("77777777-7777-7777-7777-777777777777"), new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "backoffice@codexsun.com", "$2a$11$7EqJtq98hPqEX7fNZaFWo.btro5BXkJEfY8NxIfDUBBYwyCXY7bjW", new Guid("44444444-4444-4444-4444-444444444444"), "Active", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "backoffice" },
                    { new Guid("88888888-8888-8888-8888-888888888888"), new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "storefront@codexsun.com", "$2a$11$7EqJtq98hPqEX7fNZaFWo.btro5BXkJEfY8NxIfDUBBYwyCXY7bjW", new Guid("33333333-3333-3333-3333-333333333333"), "Active", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "storefront" }
                });

            migrationBuilder.InsertData(
                table: "warehouses",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Location", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Chennai", "Chennai Central Warehouse", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Coimbatore", "Coimbatore Dispatch Center", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Bengaluru", "Bengaluru Fulfilment Center", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "cities",
                columns: new[] { "Id", "CreatedAt", "DistrictId", "IsActive", "Name", "UpdatedAt" },
                values: new object[] { 31, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 52, true, "Visakhapatnam", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "districts",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "StateId", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Ariyalur", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Chengalpattu", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Chennai", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Coimbatore", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Cuddalore", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Dharmapuri", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 8, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Dindigul", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 9, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Erode", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 10, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Kallakurichi", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 11, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Kanchipuram", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 12, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Kanyakumari", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 13, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Karur", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 14, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Krishnagiri", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 15, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Madurai", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 16, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Mayiladuthurai", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 17, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Nagapattinam", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 18, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Namakkal", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 19, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Nilgiris", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 20, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Perambalur", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 21, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Pudukkottai", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 22, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Ramanathapuram", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 23, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Ranipet", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Salem", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 25, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Sivaganga", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 26, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tenkasi", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 27, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Thanjavur", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 28, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Theni", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 29, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Thoothukudi", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 30, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tiruchirappalli", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 31, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tirunelveli", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 32, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tirupattur", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 33, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tiruppur", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 34, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tiruvallur", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 35, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tiruvannamalai", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 36, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tiruvarur", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 37, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Vellore", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 38, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Viluppuram", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 39, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Virudhunagar", 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 40, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Bengaluru Urban", 12, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 41, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Ernakulam", 13, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 42, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Hyderabad", 25, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 43, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Mumbai Suburban", 15, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 44, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "New Delhi", 33, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 45, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Pune", 15, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 46, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Ahmedabad", 8, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 47, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Jaipur", 22, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 48, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Kolkata", 29, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 49, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Lucknow", 27, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 50, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Bhopal", 14, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 51, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Khordha", 20, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 53, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Mysuru", 12, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 54, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Thiruvananthapuram", 13, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 55, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Chandigarh", 31, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 56, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Puducherry", 37, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 57, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "North Goa", 7, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 58, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Srinagar", 34, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 59, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Leh", 35, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "cities",
                columns: new[] { "Id", "CreatedAt", "DistrictId", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 4, true, "Chennai", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 5, true, "Coimbatore", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 15, true, "Madurai", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 30, true, "Tiruchirappalli", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 24, true, "Salem", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 33, true, "Tiruppur", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 8, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 9, true, "Erode", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 9, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 37, true, "Vellore", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 10, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 27, true, "Thanjavur", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 11, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 31, true, "Tirunelveli", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 12, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 29, true, "Thoothukudi", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 13, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 14, true, "Hosur", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 14, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 11, true, "Kanchipuram", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 15, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 8, true, "Dindigul", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 16, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 13, true, "Karur", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 17, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 17, true, "Nagapattinam", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 18, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 12, true, "Nagercoil", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 19, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 40, true, "Bengaluru", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 20, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 41, true, "Kochi", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 21, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 42, true, "Hyderabad", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 22, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 43, true, "Mumbai", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 23, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 44, true, "New Delhi", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 24, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 45, true, "Pune", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 25, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 46, true, "Ahmedabad", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 26, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 47, true, "Jaipur", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 27, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 48, true, "Kolkata", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 28, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 49, true, "Lucknow", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 29, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 50, true, "Bhopal", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 30, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 51, true, "Bhubaneswar", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 32, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 53, true, "Mysuru", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 33, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 54, true, "Thiruvananthapuram", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 34, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 55, true, "Chandigarh", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 35, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 56, true, "Puducherry", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 36, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 57, true, "Panaji", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 37, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 58, true, "Srinagar", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 38, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 59, true, "Leh", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "pincodes",
                columns: new[] { "Id", "CityId", "Code", "CreatedAt", "IsActive", "UpdatedAt" },
                values: new object[] { 31, 31, "530001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "destinations",
                columns: new[] { "Id", "CityId", "CountryId", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, 2, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Chennai Hub", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, 3, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Coimbatore Hub", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, 19, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Bengaluru Hub", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, 22, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Mumbai Hub", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, 23, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Delhi Hub", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "pincodes",
                columns: new[] { "Id", "CityId", "Code", "CreatedAt", "IsActive", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, 2, "600001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, 3, "641001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, 4, "625001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, 5, "620001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, 6, "636001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, 7, "641601", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 8, 8, "638001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 9, 9, "632001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 10, 10, "613001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 11, 11, "627001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 12, 12, "628001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 13, 13, "635109", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 14, 14, "631501", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 15, 15, "624001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 16, 16, "639001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 17, 17, "611001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 18, 18, "629001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 19, 19, "560001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 20, 20, "682001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 21, 21, "500001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 22, 22, "400001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 23, 23, "110001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 24, 24, "411001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 25, 25, "380001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 26, 26, "302001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 27, 27, "700001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 28, 28, "226001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 29, 29, "462001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 30, 30, "751001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 32, 32, "570001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 33, 33, "695001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 34, 34, "160017", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 35, 35, "605001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 36, 36, "403001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 37, 37, "190001", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 38, 38, "194101", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "brands",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "brands",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "brands",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "brands",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "colours",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "contact_types",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "contact_types",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "currencies",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "currencies",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "destinations",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "destinations",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "destinations",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "destinations",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "destinations",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "hsncodes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "hsncodes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "hsncodes",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "order_types",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "order_types",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "order_types",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "payment_terms",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "payment_terms",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "payment_terms",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "payment_terms",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "pincodes",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "product_groups",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "product_groups",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "product_types",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "product_types",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "product_types",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "product_types",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "sizes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "sizes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "sizes",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "sizes",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "sizes",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "sizes",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "sizes",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "sizes",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "styles",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "styles",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "styles",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "styles",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "transports",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "transports",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "transports",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "transports",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "units",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "units",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"));

            migrationBuilder.DeleteData(
                table: "warehouses",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "warehouses",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "warehouses",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "cities",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 53);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 54);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 57);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 58);

            migrationBuilder.DeleteData(
                table: "districts",
                keyColumn: "Id",
                keyValue: 59);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "states",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.UpdateData(
                table: "states",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Name", "StateCode" },
                values: new object[] { "Tamil Nadu", "TN" });

            migrationBuilder.UpdateData(
                table: "states",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "StateCode" },
                values: new object[] { "Karnataka", "KA" });

            migrationBuilder.UpdateData(
                table: "states",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CountryId", "Name", "StateCode" },
                values: new object[] { 3, "California", "CA" });
        }
    }
}
