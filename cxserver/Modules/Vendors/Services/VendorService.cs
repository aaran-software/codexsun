using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.DTOs;
using cxserver.Modules.Vendors.DTOs;
using cxserver.Modules.Vendors.Entities;

namespace cxserver.Modules.Vendors.Services;

public sealed class VendorService(CodexsunDbContext dbContext)
{
    private static readonly HashSet<string> AllowedVendorUserRoles = ["Owner", "Manager", "Staff"];

    public async Task<IReadOnlyList<VendorSummaryResponse>> GetVendorsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Vendors
            .AsNoTracking()
            .Include(x => x.Users)
            .OrderBy(x => x.CompanyName)
            .Select(x => new VendorSummaryResponse
            {
                Id = x.Id,
                CompanyName = x.CompanyName,
                LegalName = x.LegalName,
                GstNumber = x.GstNumber,
                PanNumber = x.PanNumber,
                Email = x.Email,
                Phone = x.Phone,
                Website = x.Website,
                LogoUrl = x.LogoUrl,
                Status = x.Status,
                UserCount = x.Users.Count,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<VendorDetailResponse?> GetVendorDetailsAsync(int vendorId, CancellationToken cancellationToken)
    {
        return await dbContext.Vendors
            .AsNoTracking()
            .Include(x => x.Users).ThenInclude(x => x.User)
            .Include(x => x.Addresses).ThenInclude(x => x.Country)
            .Include(x => x.Addresses).ThenInclude(x => x.State)
            .Include(x => x.Addresses).ThenInclude(x => x.District)
            .Include(x => x.Addresses).ThenInclude(x => x.City)
            .Include(x => x.Addresses).ThenInclude(x => x.Pincode)
            .Include(x => x.BankAccounts).ThenInclude(x => x.Bank)
            .Where(x => x.Id == vendorId)
            .Select(x => new VendorDetailResponse
            {
                Id = x.Id,
                CompanyName = x.CompanyName,
                LegalName = x.LegalName,
                GstNumber = x.GstNumber,
                PanNumber = x.PanNumber,
                Email = x.Email,
                Phone = x.Phone,
                Website = x.Website,
                LogoUrl = x.LogoUrl,
                Status = x.Status,
                UserCount = x.Users.Count,
                CreatedAt = x.CreatedAt,
                Users = x.Users
                    .OrderBy(user => user.CreatedAt)
                    .Select(user => new VendorUserResponse
                    {
                        Id = user.Id,
                        VendorId = user.VendorId,
                        UserId = user.UserId,
                        Username = user.User.Username,
                        Email = user.User.Email,
                        Role = user.Role,
                        CreatedAt = user.CreatedAt
                    })
                    .ToList(),
                Addresses = x.Addresses
                    .OrderBy(address => address.Id)
                    .Select(address => new VendorAddressResponse
                    {
                        Id = address.Id,
                        AddressLine1 = address.AddressLine1,
                        AddressLine2 = address.AddressLine2,
                        CountryId = address.CountryId,
                        CountryName = address.Country != null ? address.Country.Name : string.Empty,
                        StateId = address.StateId,
                        StateName = address.State != null ? address.State.Name : string.Empty,
                        DistrictId = address.DistrictId,
                        DistrictName = address.District != null ? address.District.Name : string.Empty,
                        CityId = address.CityId,
                        CityName = address.City != null ? address.City.Name : string.Empty,
                        PincodeId = address.PincodeId,
                        PincodeValue = address.Pincode != null ? address.Pincode.Code : string.Empty
                    })
                    .ToList(),
                BankAccounts = x.BankAccounts
                    .OrderByDescending(account => account.IsPrimary)
                    .ThenBy(account => account.Id)
                    .Select(account => new VendorBankAccountResponse
                    {
                        Id = account.Id,
                        BankId = account.BankId,
                        BankName = account.Bank != null ? account.Bank.Name : string.Empty,
                        AccountName = account.AccountName,
                        AccountNumber = account.AccountNumber,
                        IfscCode = account.IfscCode,
                        IsPrimary = account.IsPrimary
                    })
                    .ToList()
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<VendorDetailResponse> CreateVendorAsync(VendorUpsertRequest request, CancellationToken cancellationToken)
    {
        ValidateVendorRequest(request);
        await EnsureReferenceDataAsync(request, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var vendor = new Vendor
        {
            CompanyName = request.CompanyName.Trim(),
            LegalName = request.LegalName.Trim(),
            GstNumber = request.GstNumber.Trim(),
            PanNumber = request.PanNumber.Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone.Trim(),
            Website = request.Website.Trim(),
            LogoUrl = request.LogoUrl.Trim(),
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Active" : request.Status.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        ApplyCollections(vendor, request, now);
        dbContext.Vendors.Add(vendor);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await GetVendorDetailsAsync(vendor.Id, cancellationToken))!;
    }

    public async Task<VendorDetailResponse?> UpdateVendorProfileAsync(int vendorId, VendorUpsertRequest request, CancellationToken cancellationToken)
    {
        ValidateVendorRequest(request);
        await EnsureReferenceDataAsync(request, cancellationToken);

        var vendor = await dbContext.Vendors
            .Include(x => x.Addresses)
            .Include(x => x.BankAccounts)
            .SingleOrDefaultAsync(x => x.Id == vendorId, cancellationToken);

        if (vendor is null)
        {
            return null;
        }

        vendor.CompanyName = request.CompanyName.Trim();
        vendor.LegalName = request.LegalName.Trim();
        vendor.GstNumber = request.GstNumber.Trim();
        vendor.PanNumber = request.PanNumber.Trim();
        vendor.Email = request.Email.Trim();
        vendor.Phone = request.Phone.Trim();
        vendor.Website = request.Website.Trim();
        vendor.LogoUrl = request.LogoUrl.Trim();
        vendor.Status = string.IsNullOrWhiteSpace(request.Status) ? vendor.Status : request.Status.Trim();
        vendor.UpdatedAt = DateTimeOffset.UtcNow;

        dbContext.VendorAddresses.RemoveRange(vendor.Addresses);
        dbContext.VendorBankAccounts.RemoveRange(vendor.BankAccounts);
        ApplyCollections(vendor, request, vendor.UpdatedAt);

        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetVendorDetailsAsync(vendor.Id, cancellationToken);
    }

    public async Task<VendorUserResponse> AssignVendorUserAsync(int vendorId, AssignVendorUserRequest request, CancellationToken cancellationToken)
    {
        if (!AllowedVendorUserRoles.Contains(request.Role.Trim()))
        {
            throw new InvalidOperationException("Vendor user role must be Owner, Manager, or Staff.");
        }

        var vendorExists = await dbContext.Vendors.AnyAsync(x => x.Id == vendorId, cancellationToken);
        if (!vendorExists)
        {
            throw new InvalidOperationException("Vendor company was not found.");
        }

        var user = await dbContext.Users
            .Include(x => x.Role)
            .SingleOrDefaultAsync(x => x.Id == request.UserId && !x.IsDeleted, cancellationToken);

        if (user is null || user.Role.Name != "Vendor")
        {
            throw new InvalidOperationException("Selected user must be an active Vendor user.");
        }

        var existing = await dbContext.VendorUsers
            .AsNoTracking()
            .AnyAsync(x => x.VendorId == vendorId && x.UserId == request.UserId, cancellationToken);

        if (existing)
        {
            throw new InvalidOperationException("This user is already assigned to the vendor company.");
        }

        var now = DateTimeOffset.UtcNow;
        var vendorUser = new VendorUser
        {
            VendorId = vendorId,
            UserId = request.UserId,
            Role = request.Role.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.VendorUsers.Add(vendorUser);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new VendorUserResponse
        {
            Id = vendorUser.Id,
            VendorId = vendorId,
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = vendorUser.Role,
            CreatedAt = vendorUser.CreatedAt
        };
    }

    public async Task<IReadOnlyList<VendorUserResponse>> GetVendorUsersAsync(int vendorId, CancellationToken cancellationToken)
    {
        return await dbContext.VendorUsers
            .AsNoTracking()
            .Include(x => x.User)
            .Where(x => x.VendorId == vendorId)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new VendorUserResponse
            {
                Id = x.Id,
                VendorId = x.VendorId,
                UserId = x.UserId,
                Username = x.User.Username,
                Email = x.User.Email,
                Role = x.Role,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonMasterDataResponse>> GetAccessibleWarehousesAsync(Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        var warehouses = dbContext.Warehouses
            .AsNoTracking()
            .Include(x => x.Vendor)
            .AsQueryable();

        if (role == "Vendor")
        {
            var actorVendorIds = dbContext.VendorUsers
                .Where(x => x.UserId == actorUserId)
                .Select(x => x.VendorId);

            warehouses = warehouses.Where(x => x.VendorId.HasValue && actorVendorIds.Contains(x.VendorId.Value));
        }

        return await warehouses
            .OrderBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                Location = x.Location,
                VendorId = x.VendorId,
                VendorCompanyName = x.Vendor != null ? x.Vendor.CompanyName : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    private static void ValidateVendorRequest(VendorUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CompanyName))
        {
            throw new InvalidOperationException("Company name is required.");
        }

        if (request.BankAccounts.Count(account => account.IsPrimary) > 1)
        {
            throw new InvalidOperationException("Only one primary bank account is allowed.");
        }
    }

    private async Task EnsureReferenceDataAsync(VendorUpsertRequest request, CancellationToken cancellationToken)
    {
        foreach (var address in request.Addresses)
        {
            await EnsureExistsAsync(address.CountryId, dbContext.Countries, "Country", cancellationToken);
            await EnsureExistsAsync(address.StateId, dbContext.States, "State", cancellationToken);
            await EnsureExistsAsync(address.DistrictId, dbContext.Districts, "District", cancellationToken);
            await EnsureExistsAsync(address.CityId, dbContext.Cities, "City", cancellationToken);
            await EnsureExistsAsync(address.PincodeId, dbContext.Pincodes, "Pincode", cancellationToken);
        }

        foreach (var bankAccount in request.BankAccounts)
        {
            await EnsureExistsAsync(bankAccount.BankId, dbContext.Banks, "Bank", cancellationToken);
        }
    }

    private static async Task EnsureExistsAsync<TEntity>(int? id, IQueryable<TEntity> query, string label, CancellationToken cancellationToken)
        where TEntity : class
    {
        if (!id.HasValue)
        {
            return;
        }

        var exists = await query.AnyAsync(
            entity => EF.Property<int>(entity, "Id") == id.Value,
            cancellationToken);

        if (!exists)
        {
            throw new InvalidOperationException($"{label} was not found.");
        }
    }

    private static void ApplyCollections(Vendor vendor, VendorUpsertRequest request, DateTimeOffset now)
    {
        vendor.Addresses = request.Addresses
            .Where(address => !string.IsNullOrWhiteSpace(address.AddressLine1))
            .Select(address => new VendorAddress
            {
                AddressLine1 = address.AddressLine1.Trim(),
                AddressLine2 = address.AddressLine2.Trim(),
                CountryId = address.CountryId,
                StateId = address.StateId,
                DistrictId = address.DistrictId,
                CityId = address.CityId,
                PincodeId = address.PincodeId,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();

        vendor.BankAccounts = request.BankAccounts
            .Where(account => !string.IsNullOrWhiteSpace(account.AccountName) && !string.IsNullOrWhiteSpace(account.AccountNumber))
            .Select(account => new VendorBankAccount
            {
                BankId = account.BankId,
                AccountName = account.AccountName.Trim(),
                AccountNumber = account.AccountNumber.Trim(),
                IfscCode = account.IfscCode.Trim(),
                IsPrimary = account.IsPrimary,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();
    }
}
