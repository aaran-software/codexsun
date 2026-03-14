using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class CommonMasterData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "common_brands",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_colours",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_colours", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_contact_types",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_contact_types", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_countries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_countries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_currencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Symbol = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_currencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_gst_percents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Percentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_gst_percents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_hsn_codes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_hsn_codes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_order_types",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_order_types", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_payment_terms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Days = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_payment_terms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_product_groups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_product_groups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_product_types",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_product_types", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_sizes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_sizes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_styles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_styles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_transports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_transports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_units",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ShortName = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_units", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_warehouses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Location = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "common_states",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StateCode = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    CountryId = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_states", x => x.Id);
                    table.ForeignKey(
                        name: "FK_common_states_common_countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "common_countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "common_districts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StateId = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_districts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_common_districts_common_states_StateId",
                        column: x => x.StateId,
                        principalTable: "common_states",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "common_cities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DistrictId = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_cities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_common_cities_common_districts_DistrictId",
                        column: x => x.DistrictId,
                        principalTable: "common_districts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "common_destinations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CountryId = table.Column<int>(type: "integer", nullable: true),
                    CityId = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_destinations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_common_destinations_common_cities_CityId",
                        column: x => x.CityId,
                        principalTable: "common_cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_common_destinations_common_countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "common_countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "common_pincodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    CityId = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_common_pincodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_common_pincodes_common_cities_CityId",
                        column: x => x.CityId,
                        principalTable: "common_cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "common_contact_types",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Customer", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Vendor", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Supplier", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Employee", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "common_countries",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "India", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "United States", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "common_gst_percents",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Percentage", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, 0m, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, 5m, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, 12m, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, 18m, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, 28m, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "common_units",
                columns: new[] { "Id", "CreatedAt", "IsActive", "Name", "ShortName", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Numbers", "Nos", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Kilogram", "Kg", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Meter", "Mtr", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "common_states",
                columns: new[] { "Id", "CountryId", "CreatedAt", "IsActive", "Name", "StateCode", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Tamil Nadu", "TN", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, 1, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Karnataka", "KA", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, 2, new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "California", "CA", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_common_brands_IsActive",
                table: "common_brands",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_brands_Name",
                table: "common_brands",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_cities_DistrictId_Name",
                table: "common_cities",
                columns: new[] { "DistrictId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_cities_IsActive",
                table: "common_cities",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_cities_Name",
                table: "common_cities",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_common_colours_IsActive",
                table: "common_colours",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_colours_Name",
                table: "common_colours",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_contact_types_IsActive",
                table: "common_contact_types",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_contact_types_Name",
                table: "common_contact_types",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_countries_IsActive",
                table: "common_countries",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_countries_Name",
                table: "common_countries",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_currencies_Code",
                table: "common_currencies",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_currencies_IsActive",
                table: "common_currencies",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_currencies_Name",
                table: "common_currencies",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_destinations_CityId",
                table: "common_destinations",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_common_destinations_CountryId",
                table: "common_destinations",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_common_destinations_IsActive",
                table: "common_destinations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_destinations_Name",
                table: "common_destinations",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_common_destinations_Name_CountryId_CityId",
                table: "common_destinations",
                columns: new[] { "Name", "CountryId", "CityId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_districts_IsActive",
                table: "common_districts",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_districts_Name",
                table: "common_districts",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_common_districts_StateId_Name",
                table: "common_districts",
                columns: new[] { "StateId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_gst_percents_IsActive",
                table: "common_gst_percents",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_gst_percents_Percentage",
                table: "common_gst_percents",
                column: "Percentage",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_hsn_codes_Code",
                table: "common_hsn_codes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_hsn_codes_IsActive",
                table: "common_hsn_codes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_order_types_IsActive",
                table: "common_order_types",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_order_types_Name",
                table: "common_order_types",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_payment_terms_Days",
                table: "common_payment_terms",
                column: "Days");

            migrationBuilder.CreateIndex(
                name: "IX_common_payment_terms_IsActive",
                table: "common_payment_terms",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_payment_terms_Name",
                table: "common_payment_terms",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_pincodes_CityId",
                table: "common_pincodes",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_common_pincodes_Code",
                table: "common_pincodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_pincodes_IsActive",
                table: "common_pincodes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_product_groups_IsActive",
                table: "common_product_groups",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_product_groups_Name",
                table: "common_product_groups",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_product_types_IsActive",
                table: "common_product_types",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_product_types_Name",
                table: "common_product_types",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_sizes_IsActive",
                table: "common_sizes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_sizes_Name",
                table: "common_sizes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_states_CountryId_Name",
                table: "common_states",
                columns: new[] { "CountryId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_states_CountryId_StateCode",
                table: "common_states",
                columns: new[] { "CountryId", "StateCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_states_IsActive",
                table: "common_states",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_states_Name",
                table: "common_states",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_common_styles_IsActive",
                table: "common_styles",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_styles_Name",
                table: "common_styles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_transports_IsActive",
                table: "common_transports",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_transports_Name",
                table: "common_transports",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_units_IsActive",
                table: "common_units",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_units_Name",
                table: "common_units",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_units_ShortName",
                table: "common_units",
                column: "ShortName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_common_warehouses_IsActive",
                table: "common_warehouses",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_common_warehouses_Name",
                table: "common_warehouses",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "common_brands");

            migrationBuilder.DropTable(
                name: "common_colours");

            migrationBuilder.DropTable(
                name: "common_contact_types");

            migrationBuilder.DropTable(
                name: "common_currencies");

            migrationBuilder.DropTable(
                name: "common_destinations");

            migrationBuilder.DropTable(
                name: "common_gst_percents");

            migrationBuilder.DropTable(
                name: "common_hsn_codes");

            migrationBuilder.DropTable(
                name: "common_order_types");

            migrationBuilder.DropTable(
                name: "common_payment_terms");

            migrationBuilder.DropTable(
                name: "common_pincodes");

            migrationBuilder.DropTable(
                name: "common_product_groups");

            migrationBuilder.DropTable(
                name: "common_product_types");

            migrationBuilder.DropTable(
                name: "common_sizes");

            migrationBuilder.DropTable(
                name: "common_styles");

            migrationBuilder.DropTable(
                name: "common_transports");

            migrationBuilder.DropTable(
                name: "common_units");

            migrationBuilder.DropTable(
                name: "common_warehouses");

            migrationBuilder.DropTable(
                name: "common_cities");

            migrationBuilder.DropTable(
                name: "common_districts");

            migrationBuilder.DropTable(
                name: "common_states");

            migrationBuilder.DropTable(
                name: "common_countries");
        }
    }
}
