using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Company.DTOs;
using cxserver.Modules.Company.Entities;
using CompanyAggregate = cxserver.Modules.Company.Entities.Company;

namespace cxserver.Modules.Company.Services;

public sealed class CompanyService(CodexsunDbContext dbContext)
{
    private const int DefaultCompanyId = 1;

    public async Task<CompanyResponse> GetCompanyAsync(CancellationToken cancellationToken)
        => MapCompany(await GetCompanyEntityAsync(cancellationToken));

    public async Task<CompanyResponse> UpdateCompanyAsync(
        CompanyUpsertRequest request,
        Guid actorUserId,
        string ipAddress,
        CancellationToken cancellationToken)
    {
        ValidateCompanyRequest(request);
        await EnsureReferenceDataAsync(request, cancellationToken);

        var company = await dbContext.Companies
            .Include(x => x.Addresses)
            .SingleAsync(x => x.Id == DefaultCompanyId, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        company.DisplayName = request.DisplayName.Trim();
        company.LegalName = request.LegalName.Trim();
        company.BillingName = request.BillingName.Trim();
        company.CompanyCode = request.CompanyCode.Trim().ToUpperInvariant();
        company.Email = request.Email.Trim();
        company.Phone = request.Phone.Trim();
        company.Website = request.Website.Trim();
        company.SupportEmail = request.SupportEmail.Trim();
        company.GstNumber = request.GstNumber.Trim();
        company.PanNumber = request.PanNumber.Trim();
        company.LogoMediaId = request.LogoMediaId;
        company.FaviconMediaId = request.FaviconMediaId;
        company.CurrencyId = request.CurrencyId;
        company.Timezone = request.Timezone.Trim();
        company.UpdatedAt = now;

        await UpsertAddressAsync(company, request.Address, actorUserId, ipAddress, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Company.ProfileUpdated", nameof(Company), company.Id.ToString(), ipAddress, cancellationToken);

        return await GetCompanyAsync(cancellationToken);
    }

    public async Task<CompanyAddressResponse?> GetCompanyAddressAsync(CancellationToken cancellationToken)
    {
        var company = await GetCompanyEntityAsync(cancellationToken);
        var address = company.Addresses
            .OrderByDescending(x => x.IsPrimary)
            .ThenBy(x => x.Id)
            .FirstOrDefault();

        return address is null ? null : MapAddress(address);
    }

    public async Task<CompanyAddressResponse> UpdateCompanyAddressAsync(
        CompanyAddressUpsertRequest request,
        Guid actorUserId,
        string ipAddress,
        CancellationToken cancellationToken)
    {
        var company = await dbContext.Companies
            .Include(x => x.Addresses)
            .SingleAsync(x => x.Id == DefaultCompanyId, cancellationToken);

        await EnsureReferenceDataAsync(new CompanyUpsertRequest { Address = request }, cancellationToken);
        await UpsertAddressAsync(company, request, actorUserId, ipAddress, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetCompanyAddressAsync(cancellationToken) ?? throw new InvalidOperationException("Company address was not found.");
    }

    public async Task<IReadOnlyList<CompanySettingResponse>> GetCompanySettingsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.CompanySettings
            .AsNoTracking()
            .Where(x => x.CompanyId == DefaultCompanyId)
            .OrderBy(x => x.SettingGroup)
            .ThenBy(x => x.SettingKey)
            .Select(x => new CompanySettingResponse
            {
                Id = x.Id,
                SettingKey = x.SettingKey,
                SettingValue = x.SettingValue,
                SettingGroup = x.SettingGroup,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CompanySettingResponse>> UpdateCompanySettingsAsync(
        CompanySettingsUpdateRequest request,
        Guid actorUserId,
        string ipAddress,
        CancellationToken cancellationToken)
    {
        if (request.Settings.Count == 0)
        {
            throw new InvalidOperationException("At least one company setting is required.");
        }

        var company = await dbContext.Companies.SingleAsync(x => x.Id == DefaultCompanyId, cancellationToken);
        var existing = await dbContext.CompanySettings
            .Where(x => x.CompanyId == company.Id)
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;

        foreach (var requestSetting in request.Settings)
        {
            if (string.IsNullOrWhiteSpace(requestSetting.SettingKey))
            {
                throw new InvalidOperationException("Setting key is required.");
            }

            var key = requestSetting.SettingKey.Trim();
            var group = string.IsNullOrWhiteSpace(requestSetting.SettingGroup) ? "General" : requestSetting.SettingGroup.Trim();
            var setting = existing.SingleOrDefault(x => x.SettingKey == key);

            if (setting is null)
            {
                setting = new CompanySetting
                {
                    CompanyId = company.Id,
                    SettingKey = key,
                    SettingValue = requestSetting.SettingValue.Trim(),
                    SettingGroup = group,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                dbContext.CompanySettings.Add(setting);
                existing.Add(setting);
            }
            else
            {
                setting.SettingValue = requestSetting.SettingValue.Trim();
                setting.SettingGroup = group;
                setting.UpdatedAt = now;
            }

            await WriteAuditLogAsync(actorUserId, "Company.SettingUpdated", nameof(CompanySetting), key, ipAddress, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetCompanySettingsAsync(cancellationToken);
    }

    public async Task<string?> GetApplicationSettingAsync(string settingKey, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(settingKey))
        {
            return null;
        }

        return await dbContext.CompanySettings
            .AsNoTracking()
            .Where(x => x.CompanyId == DefaultCompanyId && x.SettingKey == settingKey.Trim())
            .Select(x => x.SettingValue)
            .SingleOrDefaultAsync(cancellationToken);
    }

    private async Task<CompanyAggregate> GetCompanyEntityAsync(CancellationToken cancellationToken)
    {
        var company = await dbContext.Companies
            .AsNoTracking()
            .Include(x => x.Currency)
            .Include(x => x.LogoMedia)
            .Include(x => x.FaviconMedia)
            .Include(x => x.Addresses).ThenInclude(x => x.Country)
            .Include(x => x.Addresses).ThenInclude(x => x.State)
            .Include(x => x.Addresses).ThenInclude(x => x.City)
            .Include(x => x.Addresses).ThenInclude(x => x.Pincode)
            .Include(x => x.Settings)
            .SingleOrDefaultAsync(x => x.Id == DefaultCompanyId, cancellationToken);

        if (company is not null)
        {
            return company;
        }

        var now = DateTimeOffset.UtcNow;
        dbContext.Companies.Add(new CompanyAggregate
        {
            Id = DefaultCompanyId,
            DisplayName = "CXStore",
            LegalName = "CXStore Platform Private Limited",
            BillingName = "CXStore Platform Private Limited",
            CompanyCode = "CXSTORE",
            Email = "hello@cxstore.local",
            Phone = "+91 00000 00000",
            Website = "https://cxstore.local",
            SupportEmail = "support@cxstore.local",
            CurrencyId = 2,
            Timezone = "Asia/Calcutta",
            CreatedAt = now,
            UpdatedAt = now,
            Addresses =
            [
                new CompanyAddress
                {
                    AddressLine1 = string.Empty,
                    AddressLine2 = string.Empty,
                    CountryId = 1,
                    StateId = 1,
                    CityId = 1,
                    PincodeId = 1,
                    IsPrimary = true,
                    CreatedAt = now,
                    UpdatedAt = now
                }
            ]
        });
        await dbContext.SaveChangesAsync(cancellationToken);

        return await dbContext.Companies
            .AsNoTracking()
            .Include(x => x.Currency)
            .Include(x => x.LogoMedia)
            .Include(x => x.FaviconMedia)
            .Include(x => x.Addresses).ThenInclude(x => x.Country)
            .Include(x => x.Addresses).ThenInclude(x => x.State)
            .Include(x => x.Addresses).ThenInclude(x => x.City)
            .Include(x => x.Addresses).ThenInclude(x => x.Pincode)
            .Include(x => x.Settings)
            .SingleAsync(x => x.Id == DefaultCompanyId, cancellationToken);
    }

    private async Task UpsertAddressAsync(
        CompanyAggregate company,
        CompanyAddressUpsertRequest request,
        Guid actorUserId,
        string ipAddress,
        CancellationToken cancellationToken)
    {
        var address = company.Addresses.SingleOrDefault(x => x.IsPrimary) ?? company.Addresses.OrderBy(x => x.Id).FirstOrDefault();
        var now = DateTimeOffset.UtcNow;

        if (address is null)
        {
            address = new CompanyAddress
            {
                CompanyId = company.Id,
                CreatedAt = now
            };
            company.Addresses.Add(address);
        }

        address.AddressLine1 = request.AddressLine1.Trim();
        address.AddressLine2 = request.AddressLine2.Trim();
        address.CountryId = request.CountryId;
        address.StateId = request.StateId;
        address.CityId = request.CityId;
        address.PincodeId = request.PincodeId;
        address.IsPrimary = request.IsPrimary;
        address.UpdatedAt = now;

        foreach (var item in company.Addresses.Where(x => x != address))
        {
            item.IsPrimary = false;
            item.UpdatedAt = now;
        }

        await WriteAuditLogAsync(actorUserId, "Company.AddressUpdated", nameof(CompanyAddress), address.Id == 0 ? "primary" : address.Id.ToString(), ipAddress, cancellationToken);
    }

    private async Task EnsureReferenceDataAsync(CompanyUpsertRequest request, CancellationToken cancellationToken)
    {
        if (request.CurrencyId.HasValue && !await dbContext.Currencies.AnyAsync(x => x.Id == request.CurrencyId.Value, cancellationToken))
        {
            throw new InvalidOperationException("Currency was not found.");
        }

        if (request.LogoMediaId.HasValue && !await dbContext.MediaFiles.AnyAsync(x => x.Id == request.LogoMediaId.Value && !x.IsDeleted, cancellationToken))
        {
            throw new InvalidOperationException("Logo media file was not found.");
        }

        if (request.FaviconMediaId.HasValue && !await dbContext.MediaFiles.AnyAsync(x => x.Id == request.FaviconMediaId.Value && !x.IsDeleted, cancellationToken))
        {
            throw new InvalidOperationException("Favicon media file was not found.");
        }

        if (request.Address.CountryId.HasValue && !await dbContext.Countries.AnyAsync(x => x.Id == request.Address.CountryId.Value, cancellationToken))
        {
            throw new InvalidOperationException("Country was not found.");
        }

        if (request.Address.StateId.HasValue && !await dbContext.States.AnyAsync(x => x.Id == request.Address.StateId.Value, cancellationToken))
        {
            throw new InvalidOperationException("State was not found.");
        }

        if (request.Address.CityId.HasValue && !await dbContext.Cities.AnyAsync(x => x.Id == request.Address.CityId.Value, cancellationToken))
        {
            throw new InvalidOperationException("City was not found.");
        }

        if (request.Address.PincodeId.HasValue && !await dbContext.Pincodes.AnyAsync(x => x.Id == request.Address.PincodeId.Value, cancellationToken))
        {
            throw new InvalidOperationException("Pincode was not found.");
        }
    }

    private static void ValidateCompanyRequest(CompanyUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DisplayName))
        {
            throw new InvalidOperationException("Display name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.CompanyCode))
        {
            throw new InvalidOperationException("Company code is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Timezone))
        {
            throw new InvalidOperationException("Timezone is required.");
        }
    }

    private static CompanyResponse MapCompany(CompanyAggregate company)
        => new()
        {
            Id = company.Id,
            DisplayName = company.DisplayName,
            LegalName = company.LegalName,
            BillingName = company.BillingName,
            CompanyCode = company.CompanyCode,
            Email = company.Email,
            Phone = company.Phone,
            Website = company.Website,
            SupportEmail = company.SupportEmail,
            GstNumber = company.GstNumber,
            PanNumber = company.PanNumber,
            LogoMediaId = company.LogoMediaId,
            LogoUrl = company.LogoMedia?.FileUrl ?? string.Empty,
            FaviconMediaId = company.FaviconMediaId,
            FaviconUrl = company.FaviconMedia?.FileUrl ?? string.Empty,
            CurrencyId = company.CurrencyId,
            CurrencyName = company.Currency?.Name ?? string.Empty,
            CurrencyCode = company.Currency?.Code ?? string.Empty,
            Timezone = company.Timezone,
            Address = company.Addresses.OrderByDescending(x => x.IsPrimary).ThenBy(x => x.Id).Select(MapAddress).FirstOrDefault(),
            Settings = company.Settings
                .OrderBy(x => x.SettingGroup)
                .ThenBy(x => x.SettingKey)
                .Select(x => new CompanySettingResponse
                {
                    Id = x.Id,
                    SettingKey = x.SettingKey,
                    SettingValue = x.SettingValue,
                    SettingGroup = x.SettingGroup,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt
                })
                .ToList(),
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt
        };

    private static CompanyAddressResponse MapAddress(CompanyAddress address)
        => new()
        {
            Id = address.Id,
            AddressLine1 = address.AddressLine1,
            AddressLine2 = address.AddressLine2,
            CountryId = address.CountryId,
            CountryName = address.Country?.Name ?? string.Empty,
            StateId = address.StateId,
            StateName = address.State?.Name ?? string.Empty,
            CityId = address.CityId,
            CityName = address.City?.Name ?? string.Empty,
            PincodeId = address.PincodeId,
            PincodeValue = address.Pincode?.Code ?? string.Empty,
            IsPrimary = address.IsPrimary,
            CreatedAt = address.CreatedAt
        };

    private async Task WriteAuditLogAsync(Guid userId, string action, string entityType, string entityId, string ipAddress, CancellationToken cancellationToken)
    {
        dbContext.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Module = "Company",
            OldValues = string.Empty,
            NewValues = string.Empty,
            IpAddress = ipAddress,
            UserAgent = string.Empty,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
