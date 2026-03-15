using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "companies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DisplayName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    LegalName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    BillingName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    CompanyCode = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false, defaultValue: ""),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    Phone = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false, defaultValue: ""),
                    Website = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    SupportEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    GstNumber = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false, defaultValue: ""),
                    PanNumber = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false, defaultValue: ""),
                    LogoMediaId = table.Column<int>(type: "integer", nullable: true),
                    FaviconMediaId = table.Column<int>(type: "integer", nullable: true),
                    CurrencyId = table.Column<int>(type: "integer", nullable: true),
                    Timezone = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false, defaultValue: "UTC"),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_companies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_companies_currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_companies_media_files_FaviconMediaId",
                        column: x => x.FaviconMediaId,
                        principalTable: "media_files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_companies_media_files_LogoMediaId",
                        column: x => x.LogoMediaId,
                        principalTable: "media_files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "company_addresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompanyId = table.Column<int>(type: "integer", nullable: false),
                    AddressLine1 = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    AddressLine2 = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false, defaultValue: ""),
                    CountryId = table.Column<int>(type: "integer", nullable: true),
                    StateId = table.Column<int>(type: "integer", nullable: true),
                    CityId = table.Column<int>(type: "integer", nullable: true),
                    PincodeId = table.Column<int>(type: "integer", nullable: true),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_addresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_company_addresses_cities_CityId",
                        column: x => x.CityId,
                        principalTable: "cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_company_addresses_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_company_addresses_countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_company_addresses_pincodes_PincodeId",
                        column: x => x.PincodeId,
                        principalTable: "pincodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_company_addresses_states_StateId",
                        column: x => x.StateId,
                        principalTable: "states",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "company_settings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompanyId = table.Column<int>(type: "integer", nullable: false),
                    SettingKey = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    SettingValue = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false, defaultValue: ""),
                    SettingGroup = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false, defaultValue: "General"),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_settings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_company_settings_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "companies",
                columns: new[] { "Id", "BillingName", "CompanyCode", "CreatedAt", "CurrencyId", "DisplayName", "Email", "FaviconMediaId", "GstNumber", "LegalName", "LogoMediaId", "PanNumber", "Phone", "SupportEmail", "Timezone", "UpdatedAt", "Website" },
                values: new object[] { 1, "CXStore Platform Private Limited", "CXSTORE", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 2, "CXStore", "hello@cxstore.local", null, "", "CXStore Platform Private Limited", null, "", "+91 00000 00000", "support@cxstore.local", "Asia/Calcutta", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "https://cxstore.local" });

            migrationBuilder.InsertData(
                table: "company_addresses",
                columns: new[] { "Id", "AddressLine1", "AddressLine2", "CityId", "CompanyId", "CountryId", "CreatedAt", "IsPrimary", "PincodeId", "StateId", "UpdatedAt" },
                values: new object[] { 1, "", "", 1, 1, 1, new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, 1, 1, new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) });

            migrationBuilder.InsertData(
                table: "company_settings",
                columns: new[] { "Id", "CompanyId", "CreatedAt", "SettingGroup", "SettingKey", "SettingValue", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Localization", "default_language", "en-IN", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, 1, new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Documents", "order_prefix", "SO", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, 1, new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Documents", "invoice_prefix", "INV", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, 1, new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Localization", "date_format", "dd MMM yyyy", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_companies_CompanyCode",
                table: "companies",
                column: "CompanyCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_companies_CurrencyId",
                table: "companies",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_companies_FaviconMediaId",
                table: "companies",
                column: "FaviconMediaId");

            migrationBuilder.CreateIndex(
                name: "IX_companies_LogoMediaId",
                table: "companies",
                column: "LogoMediaId");

            migrationBuilder.CreateIndex(
                name: "IX_company_addresses_CityId",
                table: "company_addresses",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_company_addresses_CompanyId",
                table: "company_addresses",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_company_addresses_CompanyId_IsPrimary",
                table: "company_addresses",
                columns: new[] { "CompanyId", "IsPrimary" });

            migrationBuilder.CreateIndex(
                name: "IX_company_addresses_CountryId",
                table: "company_addresses",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_company_addresses_PincodeId",
                table: "company_addresses",
                column: "PincodeId");

            migrationBuilder.CreateIndex(
                name: "IX_company_addresses_StateId",
                table: "company_addresses",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_company_settings_CompanyId_SettingKey",
                table: "company_settings",
                columns: new[] { "CompanyId", "SettingKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_company_settings_SettingGroup",
                table: "company_settings",
                column: "SettingGroup");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "company_addresses");

            migrationBuilder.DropTable(
                name: "company_settings");

            migrationBuilder.DropTable(
                name: "companies");
        }
    }
}
