using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class RenameCommonTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_common_cities_common_districts_DistrictId",
                table: "common_cities");

            migrationBuilder.DropForeignKey(
                name: "FK_common_destinations_common_cities_CityId",
                table: "common_destinations");

            migrationBuilder.DropForeignKey(
                name: "FK_common_destinations_common_countries_CountryId",
                table: "common_destinations");

            migrationBuilder.DropForeignKey(
                name: "FK_common_districts_common_states_StateId",
                table: "common_districts");

            migrationBuilder.DropForeignKey(
                name: "FK_common_pincodes_common_cities_CityId",
                table: "common_pincodes");

            migrationBuilder.DropForeignKey(
                name: "FK_common_states_common_countries_CountryId",
                table: "common_states");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_warehouses",
                table: "common_warehouses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_units",
                table: "common_units");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_transports",
                table: "common_transports");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_styles",
                table: "common_styles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_states",
                table: "common_states");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_sizes",
                table: "common_sizes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_product_types",
                table: "common_product_types");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_product_groups",
                table: "common_product_groups");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_pincodes",
                table: "common_pincodes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_payment_terms",
                table: "common_payment_terms");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_order_types",
                table: "common_order_types");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_hsn_codes",
                table: "common_hsn_codes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_gst_percents",
                table: "common_gst_percents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_districts",
                table: "common_districts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_destinations",
                table: "common_destinations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_currencies",
                table: "common_currencies");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_countries",
                table: "common_countries");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_contact_types",
                table: "common_contact_types");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_colours",
                table: "common_colours");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_cities",
                table: "common_cities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_common_brands",
                table: "common_brands");

            migrationBuilder.RenameTable(
                name: "common_warehouses",
                newName: "warehouses");

            migrationBuilder.RenameTable(
                name: "common_units",
                newName: "units");

            migrationBuilder.RenameTable(
                name: "common_transports",
                newName: "transports");

            migrationBuilder.RenameTable(
                name: "common_styles",
                newName: "styles");

            migrationBuilder.RenameTable(
                name: "common_states",
                newName: "states");

            migrationBuilder.RenameTable(
                name: "common_sizes",
                newName: "sizes");

            migrationBuilder.RenameTable(
                name: "common_product_types",
                newName: "product_types");

            migrationBuilder.RenameTable(
                name: "common_product_groups",
                newName: "product_groups");

            migrationBuilder.RenameTable(
                name: "common_pincodes",
                newName: "pincodes");

            migrationBuilder.RenameTable(
                name: "common_payment_terms",
                newName: "payment_terms");

            migrationBuilder.RenameTable(
                name: "common_order_types",
                newName: "order_types");

            migrationBuilder.RenameTable(
                name: "common_hsn_codes",
                newName: "hsn_codes");

            migrationBuilder.RenameTable(
                name: "common_gst_percents",
                newName: "gst_percents");

            migrationBuilder.RenameTable(
                name: "common_districts",
                newName: "districts");

            migrationBuilder.RenameTable(
                name: "common_destinations",
                newName: "destinations");

            migrationBuilder.RenameTable(
                name: "common_currencies",
                newName: "currencies");

            migrationBuilder.RenameTable(
                name: "common_countries",
                newName: "countries");

            migrationBuilder.RenameTable(
                name: "common_contact_types",
                newName: "contact_types");

            migrationBuilder.RenameTable(
                name: "common_colours",
                newName: "colours");

            migrationBuilder.RenameTable(
                name: "common_cities",
                newName: "cities");

            migrationBuilder.RenameTable(
                name: "common_brands",
                newName: "brands");

            migrationBuilder.RenameIndex(
                name: "IX_common_warehouses_Name",
                table: "warehouses",
                newName: "IX_warehouses_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_warehouses_IsActive",
                table: "warehouses",
                newName: "IX_warehouses_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_units_ShortName",
                table: "units",
                newName: "IX_units_ShortName");

            migrationBuilder.RenameIndex(
                name: "IX_common_units_Name",
                table: "units",
                newName: "IX_units_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_units_IsActive",
                table: "units",
                newName: "IX_units_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_transports_Name",
                table: "transports",
                newName: "IX_transports_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_transports_IsActive",
                table: "transports",
                newName: "IX_transports_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_styles_Name",
                table: "styles",
                newName: "IX_styles_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_styles_IsActive",
                table: "styles",
                newName: "IX_styles_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_states_Name",
                table: "states",
                newName: "IX_states_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_states_IsActive",
                table: "states",
                newName: "IX_states_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_states_CountryId_StateCode",
                table: "states",
                newName: "IX_states_CountryId_StateCode");

            migrationBuilder.RenameIndex(
                name: "IX_common_states_CountryId_Name",
                table: "states",
                newName: "IX_states_CountryId_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_sizes_Name",
                table: "sizes",
                newName: "IX_sizes_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_sizes_IsActive",
                table: "sizes",
                newName: "IX_sizes_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_product_types_Name",
                table: "product_types",
                newName: "IX_product_types_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_product_types_IsActive",
                table: "product_types",
                newName: "IX_product_types_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_product_groups_Name",
                table: "product_groups",
                newName: "IX_product_groups_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_product_groups_IsActive",
                table: "product_groups",
                newName: "IX_product_groups_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_pincodes_IsActive",
                table: "pincodes",
                newName: "IX_pincodes_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_pincodes_Code",
                table: "pincodes",
                newName: "IX_pincodes_Code");

            migrationBuilder.RenameIndex(
                name: "IX_common_pincodes_CityId",
                table: "pincodes",
                newName: "IX_pincodes_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_common_payment_terms_Name",
                table: "payment_terms",
                newName: "IX_payment_terms_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_payment_terms_IsActive",
                table: "payment_terms",
                newName: "IX_payment_terms_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_payment_terms_Days",
                table: "payment_terms",
                newName: "IX_payment_terms_Days");

            migrationBuilder.RenameIndex(
                name: "IX_common_order_types_Name",
                table: "order_types",
                newName: "IX_order_types_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_order_types_IsActive",
                table: "order_types",
                newName: "IX_order_types_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_hsn_codes_IsActive",
                table: "hsn_codes",
                newName: "IX_hsn_codes_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_hsn_codes_Code",
                table: "hsn_codes",
                newName: "IX_hsn_codes_Code");

            migrationBuilder.RenameIndex(
                name: "IX_common_gst_percents_Percentage",
                table: "gst_percents",
                newName: "IX_gst_percents_Percentage");

            migrationBuilder.RenameIndex(
                name: "IX_common_gst_percents_IsActive",
                table: "gst_percents",
                newName: "IX_gst_percents_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_districts_StateId_Name",
                table: "districts",
                newName: "IX_districts_StateId_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_districts_Name",
                table: "districts",
                newName: "IX_districts_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_districts_IsActive",
                table: "districts",
                newName: "IX_districts_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_destinations_Name_CountryId_CityId",
                table: "destinations",
                newName: "IX_destinations_Name_CountryId_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_common_destinations_Name",
                table: "destinations",
                newName: "IX_destinations_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_destinations_IsActive",
                table: "destinations",
                newName: "IX_destinations_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_destinations_CountryId",
                table: "destinations",
                newName: "IX_destinations_CountryId");

            migrationBuilder.RenameIndex(
                name: "IX_common_destinations_CityId",
                table: "destinations",
                newName: "IX_destinations_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_common_currencies_Name",
                table: "currencies",
                newName: "IX_currencies_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_currencies_IsActive",
                table: "currencies",
                newName: "IX_currencies_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_currencies_Code",
                table: "currencies",
                newName: "IX_currencies_Code");

            migrationBuilder.RenameIndex(
                name: "IX_common_countries_Name",
                table: "countries",
                newName: "IX_countries_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_countries_IsActive",
                table: "countries",
                newName: "IX_countries_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_contact_types_Name",
                table: "contact_types",
                newName: "IX_contact_types_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_contact_types_IsActive",
                table: "contact_types",
                newName: "IX_contact_types_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_colours_Name",
                table: "colours",
                newName: "IX_colours_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_colours_IsActive",
                table: "colours",
                newName: "IX_colours_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_cities_Name",
                table: "cities",
                newName: "IX_cities_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_cities_IsActive",
                table: "cities",
                newName: "IX_cities_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_common_cities_DistrictId_Name",
                table: "cities",
                newName: "IX_cities_DistrictId_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_brands_Name",
                table: "brands",
                newName: "IX_brands_Name");

            migrationBuilder.RenameIndex(
                name: "IX_common_brands_IsActive",
                table: "brands",
                newName: "IX_brands_IsActive");

            migrationBuilder.AddPrimaryKey(
                name: "PK_warehouses",
                table: "warehouses",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_units",
                table: "units",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_transports",
                table: "transports",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_styles",
                table: "styles",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_states",
                table: "states",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_sizes",
                table: "sizes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_product_types",
                table: "product_types",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_product_groups",
                table: "product_groups",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_pincodes",
                table: "pincodes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_payment_terms",
                table: "payment_terms",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_order_types",
                table: "order_types",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_hsn_codes",
                table: "hsn_codes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_gst_percents",
                table: "gst_percents",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_districts",
                table: "districts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_destinations",
                table: "destinations",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_currencies",
                table: "currencies",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_countries",
                table: "countries",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_contact_types",
                table: "contact_types",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_colours",
                table: "colours",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_cities",
                table: "cities",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_brands",
                table: "brands",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_cities_districts_DistrictId",
                table: "cities",
                column: "DistrictId",
                principalTable: "districts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_destinations_cities_CityId",
                table: "destinations",
                column: "CityId",
                principalTable: "cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_destinations_countries_CountryId",
                table: "destinations",
                column: "CountryId",
                principalTable: "countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_districts_states_StateId",
                table: "districts",
                column: "StateId",
                principalTable: "states",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_pincodes_cities_CityId",
                table: "pincodes",
                column: "CityId",
                principalTable: "cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_states_countries_CountryId",
                table: "states",
                column: "CountryId",
                principalTable: "countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_cities_districts_DistrictId",
                table: "cities");

            migrationBuilder.DropForeignKey(
                name: "FK_destinations_cities_CityId",
                table: "destinations");

            migrationBuilder.DropForeignKey(
                name: "FK_destinations_countries_CountryId",
                table: "destinations");

            migrationBuilder.DropForeignKey(
                name: "FK_districts_states_StateId",
                table: "districts");

            migrationBuilder.DropForeignKey(
                name: "FK_pincodes_cities_CityId",
                table: "pincodes");

            migrationBuilder.DropForeignKey(
                name: "FK_states_countries_CountryId",
                table: "states");

            migrationBuilder.DropPrimaryKey(
                name: "PK_warehouses",
                table: "warehouses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_units",
                table: "units");

            migrationBuilder.DropPrimaryKey(
                name: "PK_transports",
                table: "transports");

            migrationBuilder.DropPrimaryKey(
                name: "PK_styles",
                table: "styles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_states",
                table: "states");

            migrationBuilder.DropPrimaryKey(
                name: "PK_sizes",
                table: "sizes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_product_types",
                table: "product_types");

            migrationBuilder.DropPrimaryKey(
                name: "PK_product_groups",
                table: "product_groups");

            migrationBuilder.DropPrimaryKey(
                name: "PK_pincodes",
                table: "pincodes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_payment_terms",
                table: "payment_terms");

            migrationBuilder.DropPrimaryKey(
                name: "PK_order_types",
                table: "order_types");

            migrationBuilder.DropPrimaryKey(
                name: "PK_hsn_codes",
                table: "hsn_codes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_gst_percents",
                table: "gst_percents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_districts",
                table: "districts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_destinations",
                table: "destinations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_currencies",
                table: "currencies");

            migrationBuilder.DropPrimaryKey(
                name: "PK_countries",
                table: "countries");

            migrationBuilder.DropPrimaryKey(
                name: "PK_contact_types",
                table: "contact_types");

            migrationBuilder.DropPrimaryKey(
                name: "PK_colours",
                table: "colours");

            migrationBuilder.DropPrimaryKey(
                name: "PK_cities",
                table: "cities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_brands",
                table: "brands");

            migrationBuilder.RenameTable(
                name: "warehouses",
                newName: "common_warehouses");

            migrationBuilder.RenameTable(
                name: "units",
                newName: "common_units");

            migrationBuilder.RenameTable(
                name: "transports",
                newName: "common_transports");

            migrationBuilder.RenameTable(
                name: "styles",
                newName: "common_styles");

            migrationBuilder.RenameTable(
                name: "states",
                newName: "common_states");

            migrationBuilder.RenameTable(
                name: "sizes",
                newName: "common_sizes");

            migrationBuilder.RenameTable(
                name: "product_types",
                newName: "common_product_types");

            migrationBuilder.RenameTable(
                name: "product_groups",
                newName: "common_product_groups");

            migrationBuilder.RenameTable(
                name: "pincodes",
                newName: "common_pincodes");

            migrationBuilder.RenameTable(
                name: "payment_terms",
                newName: "common_payment_terms");

            migrationBuilder.RenameTable(
                name: "order_types",
                newName: "common_order_types");

            migrationBuilder.RenameTable(
                name: "hsn_codes",
                newName: "common_hsn_codes");

            migrationBuilder.RenameTable(
                name: "gst_percents",
                newName: "common_gst_percents");

            migrationBuilder.RenameTable(
                name: "districts",
                newName: "common_districts");

            migrationBuilder.RenameTable(
                name: "destinations",
                newName: "common_destinations");

            migrationBuilder.RenameTable(
                name: "currencies",
                newName: "common_currencies");

            migrationBuilder.RenameTable(
                name: "countries",
                newName: "common_countries");

            migrationBuilder.RenameTable(
                name: "contact_types",
                newName: "common_contact_types");

            migrationBuilder.RenameTable(
                name: "colours",
                newName: "common_colours");

            migrationBuilder.RenameTable(
                name: "cities",
                newName: "common_cities");

            migrationBuilder.RenameTable(
                name: "brands",
                newName: "common_brands");

            migrationBuilder.RenameIndex(
                name: "IX_warehouses_Name",
                table: "common_warehouses",
                newName: "IX_common_warehouses_Name");

            migrationBuilder.RenameIndex(
                name: "IX_warehouses_IsActive",
                table: "common_warehouses",
                newName: "IX_common_warehouses_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_units_ShortName",
                table: "common_units",
                newName: "IX_common_units_ShortName");

            migrationBuilder.RenameIndex(
                name: "IX_units_Name",
                table: "common_units",
                newName: "IX_common_units_Name");

            migrationBuilder.RenameIndex(
                name: "IX_units_IsActive",
                table: "common_units",
                newName: "IX_common_units_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_transports_Name",
                table: "common_transports",
                newName: "IX_common_transports_Name");

            migrationBuilder.RenameIndex(
                name: "IX_transports_IsActive",
                table: "common_transports",
                newName: "IX_common_transports_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_styles_Name",
                table: "common_styles",
                newName: "IX_common_styles_Name");

            migrationBuilder.RenameIndex(
                name: "IX_styles_IsActive",
                table: "common_styles",
                newName: "IX_common_styles_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_states_Name",
                table: "common_states",
                newName: "IX_common_states_Name");

            migrationBuilder.RenameIndex(
                name: "IX_states_IsActive",
                table: "common_states",
                newName: "IX_common_states_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_states_CountryId_StateCode",
                table: "common_states",
                newName: "IX_common_states_CountryId_StateCode");

            migrationBuilder.RenameIndex(
                name: "IX_states_CountryId_Name",
                table: "common_states",
                newName: "IX_common_states_CountryId_Name");

            migrationBuilder.RenameIndex(
                name: "IX_sizes_Name",
                table: "common_sizes",
                newName: "IX_common_sizes_Name");

            migrationBuilder.RenameIndex(
                name: "IX_sizes_IsActive",
                table: "common_sizes",
                newName: "IX_common_sizes_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_product_types_Name",
                table: "common_product_types",
                newName: "IX_common_product_types_Name");

            migrationBuilder.RenameIndex(
                name: "IX_product_types_IsActive",
                table: "common_product_types",
                newName: "IX_common_product_types_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_product_groups_Name",
                table: "common_product_groups",
                newName: "IX_common_product_groups_Name");

            migrationBuilder.RenameIndex(
                name: "IX_product_groups_IsActive",
                table: "common_product_groups",
                newName: "IX_common_product_groups_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_pincodes_IsActive",
                table: "common_pincodes",
                newName: "IX_common_pincodes_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_pincodes_Code",
                table: "common_pincodes",
                newName: "IX_common_pincodes_Code");

            migrationBuilder.RenameIndex(
                name: "IX_pincodes_CityId",
                table: "common_pincodes",
                newName: "IX_common_pincodes_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_payment_terms_Name",
                table: "common_payment_terms",
                newName: "IX_common_payment_terms_Name");

            migrationBuilder.RenameIndex(
                name: "IX_payment_terms_IsActive",
                table: "common_payment_terms",
                newName: "IX_common_payment_terms_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_payment_terms_Days",
                table: "common_payment_terms",
                newName: "IX_common_payment_terms_Days");

            migrationBuilder.RenameIndex(
                name: "IX_order_types_Name",
                table: "common_order_types",
                newName: "IX_common_order_types_Name");

            migrationBuilder.RenameIndex(
                name: "IX_order_types_IsActive",
                table: "common_order_types",
                newName: "IX_common_order_types_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_hsn_codes_IsActive",
                table: "common_hsn_codes",
                newName: "IX_common_hsn_codes_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_hsn_codes_Code",
                table: "common_hsn_codes",
                newName: "IX_common_hsn_codes_Code");

            migrationBuilder.RenameIndex(
                name: "IX_gst_percents_Percentage",
                table: "common_gst_percents",
                newName: "IX_common_gst_percents_Percentage");

            migrationBuilder.RenameIndex(
                name: "IX_gst_percents_IsActive",
                table: "common_gst_percents",
                newName: "IX_common_gst_percents_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_districts_StateId_Name",
                table: "common_districts",
                newName: "IX_common_districts_StateId_Name");

            migrationBuilder.RenameIndex(
                name: "IX_districts_Name",
                table: "common_districts",
                newName: "IX_common_districts_Name");

            migrationBuilder.RenameIndex(
                name: "IX_districts_IsActive",
                table: "common_districts",
                newName: "IX_common_districts_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_destinations_Name_CountryId_CityId",
                table: "common_destinations",
                newName: "IX_common_destinations_Name_CountryId_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_destinations_Name",
                table: "common_destinations",
                newName: "IX_common_destinations_Name");

            migrationBuilder.RenameIndex(
                name: "IX_destinations_IsActive",
                table: "common_destinations",
                newName: "IX_common_destinations_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_destinations_CountryId",
                table: "common_destinations",
                newName: "IX_common_destinations_CountryId");

            migrationBuilder.RenameIndex(
                name: "IX_destinations_CityId",
                table: "common_destinations",
                newName: "IX_common_destinations_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_currencies_Name",
                table: "common_currencies",
                newName: "IX_common_currencies_Name");

            migrationBuilder.RenameIndex(
                name: "IX_currencies_IsActive",
                table: "common_currencies",
                newName: "IX_common_currencies_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_currencies_Code",
                table: "common_currencies",
                newName: "IX_common_currencies_Code");

            migrationBuilder.RenameIndex(
                name: "IX_countries_Name",
                table: "common_countries",
                newName: "IX_common_countries_Name");

            migrationBuilder.RenameIndex(
                name: "IX_countries_IsActive",
                table: "common_countries",
                newName: "IX_common_countries_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_contact_types_Name",
                table: "common_contact_types",
                newName: "IX_common_contact_types_Name");

            migrationBuilder.RenameIndex(
                name: "IX_contact_types_IsActive",
                table: "common_contact_types",
                newName: "IX_common_contact_types_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_colours_Name",
                table: "common_colours",
                newName: "IX_common_colours_Name");

            migrationBuilder.RenameIndex(
                name: "IX_colours_IsActive",
                table: "common_colours",
                newName: "IX_common_colours_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_cities_Name",
                table: "common_cities",
                newName: "IX_common_cities_Name");

            migrationBuilder.RenameIndex(
                name: "IX_cities_IsActive",
                table: "common_cities",
                newName: "IX_common_cities_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_cities_DistrictId_Name",
                table: "common_cities",
                newName: "IX_common_cities_DistrictId_Name");

            migrationBuilder.RenameIndex(
                name: "IX_brands_Name",
                table: "common_brands",
                newName: "IX_common_brands_Name");

            migrationBuilder.RenameIndex(
                name: "IX_brands_IsActive",
                table: "common_brands",
                newName: "IX_common_brands_IsActive");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_warehouses",
                table: "common_warehouses",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_units",
                table: "common_units",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_transports",
                table: "common_transports",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_styles",
                table: "common_styles",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_states",
                table: "common_states",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_sizes",
                table: "common_sizes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_product_types",
                table: "common_product_types",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_product_groups",
                table: "common_product_groups",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_pincodes",
                table: "common_pincodes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_payment_terms",
                table: "common_payment_terms",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_order_types",
                table: "common_order_types",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_hsn_codes",
                table: "common_hsn_codes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_gst_percents",
                table: "common_gst_percents",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_districts",
                table: "common_districts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_destinations",
                table: "common_destinations",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_currencies",
                table: "common_currencies",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_countries",
                table: "common_countries",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_contact_types",
                table: "common_contact_types",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_colours",
                table: "common_colours",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_cities",
                table: "common_cities",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_common_brands",
                table: "common_brands",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_common_cities_common_districts_DistrictId",
                table: "common_cities",
                column: "DistrictId",
                principalTable: "common_districts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_common_destinations_common_cities_CityId",
                table: "common_destinations",
                column: "CityId",
                principalTable: "common_cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_common_destinations_common_countries_CountryId",
                table: "common_destinations",
                column: "CountryId",
                principalTable: "common_countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_common_districts_common_states_StateId",
                table: "common_districts",
                column: "StateId",
                principalTable: "common_states",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_common_pincodes_common_cities_CityId",
                table: "common_pincodes",
                column: "CityId",
                principalTable: "common_cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_common_states_common_countries_CountryId",
                table: "common_states",
                column: "CountryId",
                principalTable: "common_countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
