using cxserver.Modules.Auth.Security;

namespace cxserver.Modules.Auth.Services;

public sealed class PasswordService(PasswordHasher passwordHasher)
{
    public string HashPassword(string password) => passwordHasher.HashPassword(password);

    public bool VerifyPassword(string password, string passwordHash) =>
        passwordHasher.VerifyPassword(password, passwordHash);
}
