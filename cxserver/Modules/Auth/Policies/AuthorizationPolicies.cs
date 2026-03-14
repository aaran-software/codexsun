using Microsoft.AspNetCore.Authorization;

namespace cxserver.Modules.Auth.Policies;

public static class AuthorizationPolicies
{
    public const string AdminAccess = "AdminAccess";
    public const string VendorAccess = "VendorAccess";
    public const string CustomerAccess = "CustomerAccess";

    public static void Configure(AuthorizationOptions options)
    {
        options.AddPolicy(AdminAccess, policy => policy.RequireRole("Admin"));
        options.AddPolicy(VendorAccess, policy => policy.RequireRole("Vendor"));
        options.AddPolicy(CustomerAccess, policy => policy.RequireRole("Customer"));
    }
}
