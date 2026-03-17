using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class AddStorefrontEngagementModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "product_reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Review = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsVerifiedPurchase = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_reviews_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_product_reviews_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "wishlist_entries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wishlist_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_wishlist_entries_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_wishlist_entries_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_product_reviews_ProductId",
                table: "product_reviews",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_product_reviews_ProductId_IsApproved_CreatedAt",
                table: "product_reviews",
                columns: new[] { "ProductId", "IsApproved", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_product_reviews_UserId_ProductId",
                table: "product_reviews",
                columns: new[] { "UserId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wishlist_entries_ProductId",
                table: "wishlist_entries",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_wishlist_entries_UserId",
                table: "wishlist_entries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_wishlist_entries_UserId_ProductId",
                table: "wishlist_entries",
                columns: new[] { "UserId", "ProductId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "product_reviews");

            migrationBuilder.DropTable(
                name: "wishlist_entries");
        }
    }
}
