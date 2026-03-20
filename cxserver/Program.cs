using System.Security.Claims;
using System.Threading.RateLimiting;
using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Serilog;
using cxserver.Infrastructure;
using cxserver.Modules.AfterSales.Services;
using cxserver.Modules.Analytics.Services;
using cxserver.Modules.Auth.DTOs;
using cxserver.Modules.Auth.Policies;
using cxserver.Modules.Auth.Security;
using cxserver.Modules.Auth.Services;
using cxserver.Modules.Auth.Validators;
using cxserver.Modules.Company.Services;
using cxserver.Modules.Common.Services;
using cxserver.Modules.Contacts.Services;
using cxserver.Modules.Inventory.Services;
using cxserver.Modules.Media.Services;
using cxserver.Modules.Monitoring.Services;
using cxserver.Modules.Notifications.Providers;
using cxserver.Modules.Notifications.Services;
using cxserver.Modules.Promotions.Services;
using cxserver.Modules.Products.Services;
using cxserver.Modules.Sales.Services;
using cxserver.Modules.Shipping.Services;
using cxserver.Modules.Storefront.Services;
using cxserver.Modules.Vendors.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console());

builder.AddServiceDefaults();
builder.AddRedisClientBuilder("cache")
    .WithOutputCache();

var postgresConnectionString = builder.Configuration.GetConnectionString("codexsun")
    ?? throw new InvalidOperationException("Connection string 'codexsun' is required.");

builder.Services.AddSingleton(_ => new NpgsqlDataSourceBuilder(postgresConnectionString).Build());
builder.Services.AddDbContext<CodexsunDbContext>(options => options.UseNpgsql(postgresConnectionString));

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<SalesSettings>(builder.Configuration.GetSection(SalesSettings.SectionName));
builder.Services.Configure<RazorpaySettings>(builder.Configuration.GetSection(RazorpaySettings.SectionName));
builder.Services.Configure<BootstrapOptions>(builder.Configuration.GetSection(BootstrapOptions.SectionName));
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT settings are required.");
var bootstrapOptions = builder.Configuration.GetSection(BootstrapOptions.SectionName).Get<BootstrapOptions>()
    ?? new BootstrapOptions();

if (string.IsNullOrWhiteSpace(jwtSettings.SecretKey) || jwtSettings.SecretKey.Length < 32)
{
    throw new InvalidOperationException("JWT secret key must be configured and at least 32 characters long.");
}

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = signingKey,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization(options => AuthorizationPolicies.Configure(options));

builder.Services.AddRateLimiter(options =>
{
    var perIpPermitLimit = builder.Configuration.GetValue("RateLimiting:PerIp:PermitLimit", 100);
    var perIpWindowSeconds = builder.Configuration.GetValue("RateLimiting:PerIp:WindowSeconds", 60);
    var perUserPermitLimit = builder.Configuration.GetValue("RateLimiting:PerUser:PermitLimit", 50);
    var perUserWindowSeconds = builder.Configuration.GetValue("RateLimiting:PerUser:WindowSeconds", 60);

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var isAuthenticated = context.User.Identity?.IsAuthenticated == true;
        var partitionKey = isAuthenticated
            ? $"user:{context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous"}"
            : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";

        var permitLimit = isAuthenticated ? perUserPermitLimit : perIpPermitLimit;
        var windowSeconds = isAuthenticated ? perUserWindowSeconds : perIpWindowSeconds;

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromSeconds(windowSeconds),
                QueueLimit = 0
            });
    });
});

builder.Services.AddCors(options =>
{
    var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:7023"];
    options.AddPolicy("DefaultCors", policy =>
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

builder.Services.AddOutputCache();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<JwtTokenGenerator>();
builder.Services.AddScoped<PasswordHasher>();
builder.Services.AddScoped<DevelopmentBootstrapService>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CompanyService>();
builder.Services.AddScoped<CommonMasterDataService>();
builder.Services.AddScoped<ContactService>();
builder.Services.AddScoped<InventoryService>();
builder.Services.AddScoped<MediaService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<ISystemLogService, SystemLogService>();
builder.Services.AddScoped<IErrorLogService, ErrorLogService>();
builder.Services.AddScoped<ILoginHistoryService, LoginHistoryService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<PromotionService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<SalesService>();
builder.Services.AddHttpClient<RazorpayGatewayService>();
builder.Services.AddScoped<ShippingService>();
builder.Services.AddScoped<AfterSalesService>();
builder.Services.AddScoped<StorefrontService>();
builder.Services.AddScoped<VendorService>();
builder.Services.AddSingleton<IFileStorageProvider, LocalFileStorageProvider>();
builder.Services.AddScoped<INotificationProvider, EmailNotificationProvider>();
builder.Services.AddScoped<INotificationProvider, SmsNotificationProvider>();
builder.Services.AddScoped<INotificationProvider, WhatsAppNotificationProvider>();
builder.Services.AddHostedService<NotificationQueueProcessor>();
builder.Services.AddValidatorsFromAssemblyContaining<LoginValidator>();

var app = builder.Build();
var uploadsRoot = Path.Combine(app.Environment.ContentRootPath, "storage");
Directory.CreateDirectory(Path.Combine(uploadsRoot, "media"));

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CodexsunDbContext>();
    if (bootstrapOptions.ApplyMigrationsOnStartup)
    {
        await dbContext.Database.MigrateAsync();
    }

    var developmentBootstrapService = scope.ServiceProvider.GetRequiredService<DevelopmentBootstrapService>();
    await developmentBootstrapService.SeedDevelopmentUsersAsync(dbContext, CancellationToken.None);

    var systemLogService = scope.ServiceProvider.GetRequiredService<ISystemLogService>();
    await systemLogService.LogAsync("Program", "ApplicationStarted", "Application startup completed.", "Info", app.Environment.EnvironmentName, CancellationToken.None);
}

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("DefaultCors");
app.UseAuthentication();
app.UseMiddleware<ErrorLoggingMiddleware>();
app.UseRateLimiter();
app.UseAuthorization();
app.UseMiddleware<AuditMiddleware>();
app.UseOutputCache();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsRoot),
    RequestPath = "/storage"
});

app.MapControllers();
app.MapDefaultEndpoints();
app.UseFileServer();

app.Run();

public partial class Program;
