using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class AddMonitoringModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Module",
                table: "audit_logs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NewValues",
                table: "audit_logs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OldValues",
                table: "audit_logs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                table: "audit_logs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "error_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Service = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ExceptionMessage = table.Column<string>(type: "text", nullable: false),
                    StackTrace = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Source = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false, defaultValue: ""),
                    Path = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false, defaultValue: ""),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_error_logs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_error_logs_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "login_history",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Device = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false, defaultValue: ""),
                    Browser = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false, defaultValue: ""),
                    OS = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false, defaultValue: ""),
                    LoginStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LoginTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LogoutTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_login_history", x => x.Id);
                    table.ForeignKey(
                        name: "FK_login_history_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "system_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Service = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EventType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_logs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_Module",
                table: "audit_logs",
                column: "Module");

            migrationBuilder.CreateIndex(
                name: "IX_error_logs_CreatedAt",
                table: "error_logs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_error_logs_Service_CreatedAt",
                table: "error_logs",
                columns: new[] { "Service", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_error_logs_UserId",
                table: "error_logs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_login_history_IpAddress_LoginTime",
                table: "login_history",
                columns: new[] { "IpAddress", "LoginTime" });

            migrationBuilder.CreateIndex(
                name: "IX_login_history_LoginTime",
                table: "login_history",
                column: "LoginTime");

            migrationBuilder.CreateIndex(
                name: "IX_login_history_UserId",
                table: "login_history",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_login_history_UserId_LoginTime",
                table: "login_history",
                columns: new[] { "UserId", "LoginTime" });

            migrationBuilder.CreateIndex(
                name: "IX_system_logs_CreatedAt",
                table: "system_logs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_system_logs_Service",
                table: "system_logs",
                column: "Service");

            migrationBuilder.CreateIndex(
                name: "IX_system_logs_Service_Severity_CreatedAt",
                table: "system_logs",
                columns: new[] { "Service", "Severity", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "error_logs");

            migrationBuilder.DropTable(
                name: "login_history");

            migrationBuilder.DropTable(
                name: "system_logs");

            migrationBuilder.DropIndex(
                name: "IX_audit_logs_Module",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "Module",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "NewValues",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "OldValues",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                table: "audit_logs");
        }
    }
}
