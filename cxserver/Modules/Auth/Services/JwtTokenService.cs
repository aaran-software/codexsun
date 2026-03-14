using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Auth.Security;

namespace cxserver.Modules.Auth.Services;

public sealed class JwtTokenService(
    JwtTokenGenerator tokenGenerator,
    IOptions<JwtSettings> jwtOptions)
{
    private readonly JwtSettings _settings = jwtOptions.Value;

    public (string AccessToken, DateTimeOffset ExpiresAt) GenerateAccessToken(User user, IReadOnlyCollection<string> permissions)
    {
        var result = tokenGenerator.GenerateAccessToken(user, permissions);
        return (result.Token, result.ExpiresAt);
    }

    public string GenerateRefreshToken() => tokenGenerator.GenerateRefreshToken();

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            return tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                ValidIssuer = _settings.Issuer,
                ValidAudience = _settings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey)),
                ClockSkew = TimeSpan.FromMinutes(1)
            }, out _);
        }
        catch
        {
            return null;
        }
    }
}
