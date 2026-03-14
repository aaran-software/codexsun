using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class SuperAdminSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "auth_users",
                columns: new[] { "Id", "CreatedAt", "Email", "PasswordHash", "RoleId", "Status", "UpdatedAt", "Username" },
                values: new object[] { new Guid("55555555-5555-5555-5555-555555555555"), new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "sundar@sundar.com", "$2a$11$7EqJtq98hPqEX7fNZaFWo.btro5BXkJEfY8NxIfDUBBYwyCXY7bjW", new Guid("11111111-1111-1111-1111-111111111111"), "Active", new DateTimeOffset(new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "sundar" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "auth_users",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"));
        }
    }
}
