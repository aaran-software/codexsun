using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace cxserver.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationsModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "notification_templates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Channel = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Subject = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    TemplateBody = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_templates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TemplateId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Channel = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    PayloadJson = table.Column<string>(type: "text", nullable: false),
                    SentAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_notifications_notification_templates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "notification_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_notifications_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notification_logs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NotificationId = table.Column<int>(type: "integer", nullable: false),
                    ProviderResponse = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_logs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_notification_logs_notifications_NotificationId",
                        column: x => x.NotificationId,
                        principalTable: "notifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "notification_templates",
                columns: new[] { "Id", "Channel", "Code", "CreatedAt", "IsActive", "Name", "Subject", "TemplateBody", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Email", "USER_REGISTRATION", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "User Registration Email", "Welcome to Codexsun", "Hello {{Username}}, your account has been created successfully.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, "InApp", "USER_REGISTRATION", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "User Registration In-App", "Welcome", "Your account is active and ready to use.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, "Email", "PASSWORD_RESET", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Password Reset Email", "Password Updated", "Hello {{Username}}, your password was updated on {{OccurredAt}}.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, "Email", "ORDER_CREATED", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Order Created Email", "Order {{OrderNumber}} created", "Your order {{OrderNumber}} has been created with total {{TotalAmount}}.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, "Email", "PAYMENT_SUCCESS", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Payment Success Email", "Payment received for {{OrderNumber}}", "We received payment {{Amount}} for order {{OrderNumber}}.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, "SMS", "SHIPMENT_SHIPPED", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Shipment Shipped SMS", "Shipment shipped", "Shipment {{TrackingNumber}} for order {{OrderNumber}} has shipped.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, "WhatsApp", "SHIPMENT_DELIVERED", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Shipment Delivered WhatsApp", "Shipment delivered", "Shipment {{TrackingNumber}} for order {{OrderNumber}} was delivered.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 8, "Email", "RETURN_APPROVED", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Return Approved Email", "Return {{ReturnNumber}} approved", "Your return {{ReturnNumber}} has been approved.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 9, "Email", "VENDOR_PAYOUT_CREATED", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Vendor Payout Email", "Vendor payout {{PayoutNumber}} created", "Payout {{PayoutNumber}} for {{Amount}} is ready for processing.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 10, "InApp", "LOW_INVENTORY_ALERT", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Low Inventory In-App", "Low inventory alert", "Product {{ProductName}} in warehouse {{WarehouseName}} is at {{QuantityOnHand}} units.", new DateTimeOffset(new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_notification_logs_NotificationId_CreatedAt",
                table: "notification_logs",
                columns: new[] { "NotificationId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_notification_templates_Code_Channel",
                table: "notification_templates",
                columns: new[] { "Code", "Channel" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notifications_Status_CreatedAt",
                table: "notifications",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_notifications_TemplateId",
                table: "notifications",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_UserId_CreatedAt",
                table: "notifications",
                columns: new[] { "UserId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notification_logs");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "notification_templates");
        }
    }
}
