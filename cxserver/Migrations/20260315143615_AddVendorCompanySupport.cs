using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorCompanySupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VendorId",
                table: "vendor_payouts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VendorId",
                table: "vendor_earnings",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VendorId",
                table: "purchase_orders",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VendorId",
                table: "products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VendorId",
                table: "product_vendor_links",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "vendors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompanyName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    LegalName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    GstNumber = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false, defaultValue: ""),
                    PanNumber = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false, defaultValue: ""),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    Phone = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false, defaultValue: ""),
                    Website = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    LogoUrl = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false, defaultValue: ""),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "vendor_addresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VendorId = table.Column<int>(type: "integer", nullable: false),
                    AddressLine1 = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AddressLine2 = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    CountryId = table.Column<int>(type: "integer", nullable: true),
                    StateId = table.Column<int>(type: "integer", nullable: true),
                    DistrictId = table.Column<int>(type: "integer", nullable: true),
                    CityId = table.Column<int>(type: "integer", nullable: true),
                    PincodeId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_addresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vendor_addresses_cities_CityId",
                        column: x => x.CityId,
                        principalTable: "cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vendor_addresses_countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vendor_addresses_districts_DistrictId",
                        column: x => x.DistrictId,
                        principalTable: "districts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vendor_addresses_pincodes_PincodeId",
                        column: x => x.PincodeId,
                        principalTable: "pincodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vendor_addresses_states_StateId",
                        column: x => x.StateId,
                        principalTable: "states",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vendor_addresses_vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_bank_accounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VendorId = table.Column<int>(type: "integer", nullable: false),
                    BankId = table.Column<int>(type: "integer", nullable: true),
                    AccountName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AccountNumber = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    IfscCode = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false, defaultValue: ""),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_bank_accounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vendor_bank_accounts_banks_BankId",
                        column: x => x.BankId,
                        principalTable: "banks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vendor_bank_accounts_vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VendorId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vendor_users_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vendor_users_vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "permissions",
                columns: new[] { "Id", "Code", "Description" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac6"), "vendors.view", "View vendor companies" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac7"), "vendors.manage", "Manage vendor companies" },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac8"), "vendors.users.manage", "Manage vendor user assignments" }
                });

            migrationBuilder.InsertData(
                table: "role_permissions",
                columns: new[] { "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac6"), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac7"), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac8"), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac6"), new Guid("44444444-4444-4444-4444-444444444444") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_vendor_payouts_VendorId",
                table: "vendor_payouts",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_earnings_VendorId",
                table: "vendor_earnings",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_orders_VendorId",
                table: "purchase_orders",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_products_VendorId",
                table: "products",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_product_vendor_links_VendorId",
                table: "product_vendor_links",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_addresses_CityId",
                table: "vendor_addresses",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_addresses_CountryId",
                table: "vendor_addresses",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_addresses_DistrictId",
                table: "vendor_addresses",
                column: "DistrictId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_addresses_PincodeId",
                table: "vendor_addresses",
                column: "PincodeId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_addresses_StateId",
                table: "vendor_addresses",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_addresses_VendorId",
                table: "vendor_addresses",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_bank_accounts_BankId",
                table: "vendor_bank_accounts",
                column: "BankId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_bank_accounts_VendorId",
                table: "vendor_bank_accounts",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_users_UserId",
                table: "vendor_users",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_users_VendorId_UserId",
                table: "vendor_users",
                columns: new[] { "VendorId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vendors_CompanyName",
                table: "vendors",
                column: "CompanyName");

            migrationBuilder.CreateIndex(
                name: "IX_vendors_Email",
                table: "vendors",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_vendors_Status",
                table: "vendors",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_product_vendor_links_vendors_VendorId",
                table: "product_vendor_links",
                column: "VendorId",
                principalTable: "vendors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_products_vendors_VendorId",
                table: "products",
                column: "VendorId",
                principalTable: "vendors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_purchase_orders_vendors_VendorId",
                table: "purchase_orders",
                column: "VendorId",
                principalTable: "vendors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_vendor_earnings_vendors_VendorId",
                table: "vendor_earnings",
                column: "VendorId",
                principalTable: "vendors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_vendor_payouts_vendors_VendorId",
                table: "vendor_payouts",
                column: "VendorId",
                principalTable: "vendors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_product_vendor_links_vendors_VendorId",
                table: "product_vendor_links");

            migrationBuilder.DropForeignKey(
                name: "FK_products_vendors_VendorId",
                table: "products");

            migrationBuilder.DropForeignKey(
                name: "FK_purchase_orders_vendors_VendorId",
                table: "purchase_orders");

            migrationBuilder.DropForeignKey(
                name: "FK_vendor_earnings_vendors_VendorId",
                table: "vendor_earnings");

            migrationBuilder.DropForeignKey(
                name: "FK_vendor_payouts_vendors_VendorId",
                table: "vendor_payouts");

            migrationBuilder.DropTable(
                name: "vendor_addresses");

            migrationBuilder.DropTable(
                name: "vendor_bank_accounts");

            migrationBuilder.DropTable(
                name: "vendor_users");

            migrationBuilder.DropTable(
                name: "vendors");

            migrationBuilder.DropIndex(
                name: "IX_vendor_payouts_VendorId",
                table: "vendor_payouts");

            migrationBuilder.DropIndex(
                name: "IX_vendor_earnings_VendorId",
                table: "vendor_earnings");

            migrationBuilder.DropIndex(
                name: "IX_purchase_orders_VendorId",
                table: "purchase_orders");

            migrationBuilder.DropIndex(
                name: "IX_products_VendorId",
                table: "products");

            migrationBuilder.DropIndex(
                name: "IX_product_vendor_links_VendorId",
                table: "product_vendor_links");

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac6"), new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac7"), new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac8"), new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.DeleteData(
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac6"), new Guid("44444444-4444-4444-4444-444444444444") });

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac6"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac7"));

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac8"));

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "vendor_payouts");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "vendor_earnings");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "purchase_orders");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "products");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "product_vendor_links");
        }
    }
}
