using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Security;

namespace cxtest.AuthSecurityTests;

internal static class AuthSecurityTestSupport
{
    private static string RequireEnvironmentVariable(string key) =>
        Environment.GetEnvironmentVariable(key)
        ?? throw new InvalidOperationException($"Set {key} to run authentication integration tests.");

    internal static string GetDevelopmentBootstrapPassword() =>
        RequireEnvironmentVariable("Bootstrap__DevelopmentPassword");

    internal static WebApplicationFactory<Program> CreateFactory(
        IReadOnlyDictionary<string, string?>? overrides = null)
    {
        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Development");
            builder.ConfigureAppConfiguration((_, configurationBuilder) =>
                configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:codexsun"] = RequireEnvironmentVariable("ConnectionStrings__codexsun"),
                    ["Jwt:SecretKey"] = RequireEnvironmentVariable("Jwt__SecretKey"),
                    ["Bootstrap:ApplyMigrationsOnStartup"] = "true",
                    ["Bootstrap:SeedDevelopmentUsers"] = "true",
                    ["Bootstrap:DevelopmentPassword"] = GetDevelopmentBootstrapPassword()
                }));

            if (overrides is not null && overrides.Count > 0)
            {
                builder.ConfigureAppConfiguration((_, configurationBuilder) =>
                    configurationBuilder.AddInMemoryCollection(overrides));
            }
        });
    }

    internal static HttpClient CreateClient(WebApplicationFactory<Program> factory) =>
        factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

    internal static RegisterEnvelope CreateRegisterRequest(string? prefix = null)
    {
        var suffix = Guid.NewGuid().ToString("N")[..8];
        var name = string.IsNullOrWhiteSpace(prefix) ? $"user_{suffix}" : $"{prefix}_{suffix}";
        return new RegisterEnvelope(name, $"{name}@example.com", "Password1");
    }

    internal static async Task<TokenEnvelope> RegisterAndReadTokensAsync(HttpClient client, RegisterEnvelope request)
    {
        var response = await client.PostAsJsonAsync("/auth/register", request);
        response.EnsureSuccessStatusCode();
        return await ReadRequiredAsync<TokenEnvelope>(response);
    }

    internal static async Task<TokenEnvelope> LoginAndReadTokensAsync(HttpClient client, string usernameOrEmail, string password)
    {
        var response = await client.PostAsJsonAsync("/auth/login", new
        {
            UsernameOrEmail = usernameOrEmail,
            Password = password
        });

        response.EnsureSuccessStatusCode();
        return await ReadRequiredAsync<TokenEnvelope>(response);
    }

    internal static void SetBearerToken(HttpClient client, string accessToken)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
    }

    internal static async Task<T> WithDbContextAsync<T>(
        WebApplicationFactory<Program> factory,
        Func<CodexsunDbContext, Task<T>> action)
    {
        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<CodexsunDbContext>();
        return await action(dbContext);
    }

    internal static async Task WithDbContextAsync(
        WebApplicationFactory<Program> factory,
        Func<CodexsunDbContext, Task> action)
    {
        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<CodexsunDbContext>();
        await action(dbContext);
    }

    internal static T GetRequiredService<T>(WebApplicationFactory<Program> factory) where T : notnull
    {
        using var scope = factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<T>();
    }

    internal static JwtSettings GetJwtSettings(WebApplicationFactory<Program> factory)
    {
        using var scope = factory.Services.CreateScope();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        return configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
            ?? throw new InvalidOperationException("JWT settings were not available for tests.");
    }

    internal static JwtSecurityToken ReadJwt(string token) =>
        new JwtSecurityTokenHandler().ReadJwtToken(token);

    internal static string CreateSignedJwt(
        JwtSettings settings,
        Guid userId,
        string username,
        string role,
        IEnumerable<string> permissions,
        DateTimeOffset expiresAt)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Role, role),
            new("UserId", userId.ToString()),
            new("Username", username),
            new("Role", role)
        };

        claims.AddRange(permissions.Select(permission => new Claim("Permissions", permission)));

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SecretKey));
        var token = new JwtSecurityToken(
            issuer: settings.Issuer,
            audience: settings.Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    internal static async Task<T> ReadRequiredAsync<T>(HttpResponseMessage response)
    {
        var payload = await response.Content.ReadFromJsonAsync<T>();
        return payload ?? throw new InvalidOperationException($"Expected {typeof(T).Name} payload.");
    }

    internal sealed record RegisterEnvelope(string Username, string Email, string Password);

    internal sealed class TokenEnvelope
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTimeOffset ExpiresAt { get; set; }
    }
}
