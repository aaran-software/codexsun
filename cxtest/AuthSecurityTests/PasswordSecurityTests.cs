using Microsoft.EntityFrameworkCore;
using cxserver.Modules.Auth.Security;
using cxserver.Modules.Auth.Services;

namespace cxtest.AuthSecurityTests;

public sealed class PasswordSecurityTests
{
    [Fact]
    public async Task Registered_password_is_stored_only_as_a_bcrypt_hash()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var request = AuthSecurityTestSupport.CreateRegisterRequest("pwd");

        await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);

        var user = await AuthSecurityTestSupport.WithDbContextAsync(factory, dbContext =>
            dbContext.Users.SingleAsync(x => x.Email == request.Email));

        Assert.NotEqual(request.Password, user.PasswordHash);
        Assert.StartsWith("$2", user.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash));
    }

    [Fact]
    public async Task Plain_text_password_is_never_persisted()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var request = AuthSecurityTestSupport.CreateRegisterRequest("dbhash");

        await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);

        var rawMatches = await AuthSecurityTestSupport.WithDbContextAsync(factory, dbContext =>
            dbContext.Users.CountAsync(x => x.Email == request.Email && x.PasswordHash == request.Password));

        Assert.Equal(0, rawMatches);
    }

    [Fact]
    public void Password_verification_works_and_hashes_are_unique_per_invocation()
    {
        var service = new PasswordService(new PasswordHasher());

        var firstHash = service.HashPassword("Password1");
        var secondHash = service.HashPassword("Password1");

        Assert.NotEqual(firstHash, secondHash);
        Assert.True(service.VerifyPassword("Password1", firstHash));
        Assert.True(service.VerifyPassword("Password1", secondHash));
        Assert.False(service.VerifyPassword("WrongPass1", firstHash));
    }
}
