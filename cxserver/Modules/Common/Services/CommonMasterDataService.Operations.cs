using Microsoft.EntityFrameworkCore;
using cxserver.Modules.Common.DTOs;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Services;

public sealed partial class CommonMasterDataService
{
    public Task<IReadOnlyList<CommonMasterDataResponse>> ListTransportsAsync(CancellationToken cancellationToken) => ListNamedAsync<Transport>(cancellationToken);
    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchTransportsAsync(string? query, CancellationToken cancellationToken) => SearchNamedAsync<Transport>(query, cancellationToken);
    public Task<CommonMasterDataResponse> CreateTransportAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken) => CreateNamedAsync<Transport>(request, cancellationToken);
    public Task<CommonMasterDataResponse?> UpdateTransportAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken) => UpdateNamedAsync<Transport>(id, request, cancellationToken);
    public Task<bool> SetTransportActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<Transport>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListDestinationsAsync(int? countryId, int? cityId, CancellationToken cancellationToken)
    {
        var destinations = dbContext.Destinations.AsNoTracking()
            .Include(x => x.Country)
            .Include(x => x.City)
            .AsQueryable();

        if (countryId.HasValue)
        {
            destinations = destinations.Where(x => x.CountryId == countryId.Value);
        }

        if (cityId.HasValue)
        {
            destinations = destinations.Where(x => x.CityId == cityId.Value);
        }

        return await destinations.OrderBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                CountryId = x.CountryId,
                CountryName = x.Country != null ? x.Country.Name : null,
                CityId = x.CityId,
                CityName = x.City != null ? x.City.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchDestinationsAsync(string? query, int? countryId, int? cityId, CancellationToken cancellationToken)
    {
        var destinations = dbContext.Destinations.AsNoTracking().AsQueryable();
        if (countryId.HasValue)
        {
            destinations = destinations.Where(x => x.CountryId == countryId.Value);
        }

        if (cityId.HasValue)
        {
            destinations = destinations.Where(x => x.CityId == cityId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            destinations = destinations.Where(x => x.Name.ToLower().Contains(normalized));
        }

        return await destinations.OrderBy(x => x.Name).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreateDestinationAsync(DestinationUpsertRequest request, CancellationToken cancellationToken)
    {
        await ValidateDestinationReferencesAsync(request.CountryId, request.CityId, cancellationToken);
        var normalized = Normalize(request.Name);
        var exists = await dbContext.Destinations.AnyAsync(
            x => x.Name.ToLower() == normalized && x.CountryId == request.CountryId && x.CityId == request.CityId,
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A destination with the same name already exists for the selected location.");
        }

        var entity = new Destination
        {
            Name = request.Name.Trim(),
            CountryId = request.CountryId,
            CityId = request.CityId,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Destinations.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListDestinationsAsync(entity.CountryId, entity.CityId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdateDestinationAsync(int id, DestinationUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Destinations.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;

        await ValidateDestinationReferencesAsync(request.CountryId, request.CityId, cancellationToken);
        var normalized = Normalize(request.Name);
        var exists = await dbContext.Destinations.AnyAsync(
            x => x.Id != id && x.Name.ToLower() == normalized && x.CountryId == request.CountryId && x.CityId == request.CityId,
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A destination with the same name already exists for the selected location.");
        }

        entity.Name = request.Name.Trim();
        entity.CountryId = request.CountryId;
        entity.CityId = request.CityId;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListDestinationsAsync(entity.CountryId, entity.CityId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetDestinationActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<Destination>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListCurrenciesAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Currencies.AsNoTracking().OrderBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                Code = x.Code,
                Symbol = x.Symbol,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchCurrenciesAsync(string? query, CancellationToken cancellationToken)
    {
        var currencies = dbContext.Currencies.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            currencies = currencies.Where(x => x.Name.ToLower().Contains(normalized) || x.Code.ToLower().Contains(normalized));
        }

        return await currencies.OrderBy(x => x.Name).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreateCurrencyAsync(CurrencyUpsertRequest request, CancellationToken cancellationToken)
    {
        var normalizedName = Normalize(request.Name);
        var normalizedCode = Normalize(request.Code);
        var exists = await dbContext.Currencies.AnyAsync(x => x.Name.ToLower() == normalizedName || x.Code.ToLower() == normalizedCode, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A currency with the same name or code already exists.");
        }

        var entity = new Currency
        {
            Name = request.Name.Trim(),
            Code = request.Code.Trim().ToUpperInvariant(),
            Symbol = request.Symbol.Trim(),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Currencies.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListCurrenciesAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdateCurrencyAsync(int id, CurrencyUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Currencies.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;

        var normalizedName = Normalize(request.Name);
        var normalizedCode = Normalize(request.Code);
        var exists = await dbContext.Currencies.AnyAsync(x => x.Id != id && (x.Name.ToLower() == normalizedName || x.Code.ToLower() == normalizedCode), cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A currency with the same name or code already exists.");
        }

        entity.Name = request.Name.Trim();
        entity.Code = request.Code.Trim().ToUpperInvariant();
        entity.Symbol = request.Symbol.Trim();
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListCurrenciesAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetCurrencyActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<Currency>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListWarehousesAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Warehouses.AsNoTracking().OrderBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                Location = x.Location,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchWarehousesAsync(string? query, CancellationToken cancellationToken)
    {
        var warehouses = dbContext.Warehouses.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            warehouses = warehouses.Where(x => x.Name.ToLower().Contains(normalized) || x.Location.ToLower().Contains(normalized));
        }

        return await warehouses.OrderBy(x => x.Name).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreateWarehouseAsync(WarehouseUpsertRequest request, CancellationToken cancellationToken)
    {
        var normalized = Normalize(request.Name);
        var exists = await dbContext.Warehouses.AnyAsync(x => x.Name.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A warehouse with the same name already exists.");
        }

        var entity = new Warehouse
        {
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Warehouses.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListWarehousesAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdateWarehouseAsync(int id, WarehouseUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Warehouses.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;

        var normalized = Normalize(request.Name);
        var exists = await dbContext.Warehouses.AnyAsync(x => x.Id != id && x.Name.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A warehouse with the same name already exists.");
        }

        entity.Name = request.Name.Trim();
        entity.Location = request.Location.Trim();
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListWarehousesAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetWarehouseActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<Warehouse>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListPaymentTermsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.PaymentTerms.AsNoTracking().OrderBy(x => x.Days).ThenBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                Days = x.Days,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchPaymentTermsAsync(string? query, CancellationToken cancellationToken)
    {
        var paymentTerms = dbContext.PaymentTerms.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            paymentTerms = paymentTerms.Where(x => x.Name.ToLower().Contains(normalized));
        }

        return await paymentTerms.OrderBy(x => x.Days).ThenBy(x => x.Name).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreatePaymentTermAsync(PaymentTermUpsertRequest request, CancellationToken cancellationToken)
    {
        var normalized = Normalize(request.Name);
        var exists = await dbContext.PaymentTerms.AnyAsync(x => x.Name.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A payment term with the same name already exists.");
        }

        var entity = new PaymentTerm
        {
            Name = request.Name.Trim(),
            Days = request.Days,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.PaymentTerms.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListPaymentTermsAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdatePaymentTermAsync(int id, PaymentTermUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.PaymentTerms.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;

        var normalized = Normalize(request.Name);
        var exists = await dbContext.PaymentTerms.AnyAsync(x => x.Id != id && x.Name.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A payment term with the same name already exists.");
        }

        entity.Name = request.Name.Trim();
        entity.Days = request.Days;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListPaymentTermsAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetPaymentTermActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<PaymentTerm>(id, isActive, cancellationToken);
}
