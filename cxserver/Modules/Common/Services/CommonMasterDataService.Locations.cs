using Microsoft.EntityFrameworkCore;
using cxserver.Modules.Common.DTOs;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Services;

public sealed partial class CommonMasterDataService
{
    public Task<IReadOnlyList<CommonMasterDataResponse>> ListCountriesAsync(CancellationToken cancellationToken)
        => ListNamedAsync<Country>(cancellationToken);

    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchCountriesAsync(string? query, CancellationToken cancellationToken)
        => SearchNamedAsync<Country>(query, cancellationToken);

    public Task<CommonMasterDataResponse> CreateCountryAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken)
        => CreateNamedAsync<Country>(request, cancellationToken);

    public Task<CommonMasterDataResponse?> UpdateCountryAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken)
        => UpdateNamedAsync<Country>(id, request, cancellationToken);

    public Task<bool> SetCountryActiveAsync(int id, bool isActive, CancellationToken cancellationToken)
        => SetActiveAsync<Country>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListStatesAsync(int? countryId, CancellationToken cancellationToken)
    {
        var states = dbContext.States.AsNoTracking().Include(x => x.Country).AsQueryable();
        if (countryId.HasValue)
        {
            states = states.Where(x => x.CountryId == countryId.Value);
        }

        return await states
            .OrderBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                Code = x.StateCode,
                CountryId = x.CountryId,
                CountryName = x.Country.Name,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchStatesAsync(string? query, int? countryId, CancellationToken cancellationToken)
    {
        var states = dbContext.States.AsNoTracking().AsQueryable();
        if (countryId.HasValue)
        {
            states = states.Where(x => x.CountryId == countryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            states = states.Where(x => x.Name.ToLower().Contains(normalized) || x.StateCode.ToLower().Contains(normalized));
        }

        return await states.OrderBy(x => x.Name).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreateStateAsync(StateUpsertRequest request, CancellationToken cancellationToken)
    {
        await EnsureCountryExistsAsync(request.CountryId, cancellationToken);
        var normalizedName = Normalize(request.Name);
        var normalizedCode = Normalize(request.StateCode);
        var exists = await dbContext.States.AnyAsync(
            x => x.CountryId == request.CountryId && (x.Name.ToLower() == normalizedName || x.StateCode.ToLower() == normalizedCode),
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A state with the same name or code already exists for the selected country.");
        }

        var entity = new State
        {
            Name = request.Name.Trim(),
            StateCode = request.StateCode.Trim().ToUpperInvariant(),
            CountryId = request.CountryId,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.States.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return (await ListStatesAsync(entity.CountryId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdateStateAsync(int id, StateUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.States.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await EnsureCountryExistsAsync(request.CountryId, cancellationToken);
        var normalizedName = Normalize(request.Name);
        var normalizedCode = Normalize(request.StateCode);
        var exists = await dbContext.States.AnyAsync(
            x => x.Id != id && x.CountryId == request.CountryId &&
                 (x.Name.ToLower() == normalizedName || x.StateCode.ToLower() == normalizedCode),
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A state with the same name or code already exists for the selected country.");
        }

        entity.Name = request.Name.Trim();
        entity.StateCode = request.StateCode.Trim().ToUpperInvariant();
        entity.CountryId = request.CountryId;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return (await ListStatesAsync(entity.CountryId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetStateActiveAsync(int id, bool isActive, CancellationToken cancellationToken)
        => SetActiveAsync<State>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListDistrictsAsync(int? stateId, CancellationToken cancellationToken)
    {
        var districts = dbContext.Districts.AsNoTracking().Include(x => x.State).AsQueryable();
        if (stateId.HasValue)
        {
            districts = districts.Where(x => x.StateId == stateId.Value);
        }

        return await districts.OrderBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                StateId = x.StateId,
                StateName = x.State.Name,
                CountryId = x.State.CountryId,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchDistrictsAsync(string? query, int? stateId, CancellationToken cancellationToken)
    {
        var districts = dbContext.Districts.AsNoTracking().AsQueryable();
        if (stateId.HasValue)
        {
            districts = districts.Where(x => x.StateId == stateId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            districts = districts.Where(x => x.Name.ToLower().Contains(normalized));
        }

        return await districts.OrderBy(x => x.Name).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreateDistrictAsync(DistrictUpsertRequest request, CancellationToken cancellationToken)
    {
        await EnsureStateExistsAsync(request.StateId, cancellationToken);
        var normalized = Normalize(request.Name);
        var exists = await dbContext.Districts.AnyAsync(
            x => x.StateId == request.StateId && x.Name.ToLower() == normalized,
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A district with the same name already exists for the selected state.");
        }

        var entity = new District
        {
            Name = request.Name.Trim(),
            StateId = request.StateId,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Districts.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListDistrictsAsync(entity.StateId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdateDistrictAsync(int id, DistrictUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Districts.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await EnsureStateExistsAsync(request.StateId, cancellationToken);
        var normalized = Normalize(request.Name);
        var exists = await dbContext.Districts.AnyAsync(
            x => x.Id != id && x.StateId == request.StateId && x.Name.ToLower() == normalized,
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A district with the same name already exists for the selected state.");
        }

        entity.Name = request.Name.Trim();
        entity.StateId = request.StateId;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListDistrictsAsync(entity.StateId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetDistrictActiveAsync(int id, bool isActive, CancellationToken cancellationToken)
        => SetActiveAsync<District>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListCitiesAsync(int? districtId, CancellationToken cancellationToken)
    {
        var cities = dbContext.Cities.AsNoTracking()
            .Include(x => x.District)
            .ThenInclude(x => x.State)
            .AsQueryable();

        if (districtId.HasValue)
        {
            cities = cities.Where(x => x.DistrictId == districtId.Value);
        }

        return await cities.OrderBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                DistrictId = x.DistrictId,
                DistrictName = x.District.Name,
                StateId = x.District.StateId,
                StateName = x.District.State.Name,
                CountryId = x.District.State.CountryId,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchCitiesAsync(string? query, int? districtId, CancellationToken cancellationToken)
    {
        var cities = dbContext.Cities.AsNoTracking().AsQueryable();
        if (districtId.HasValue)
        {
            cities = cities.Where(x => x.DistrictId == districtId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            cities = cities.Where(x => x.Name.ToLower().Contains(normalized));
        }

        return await cities.OrderBy(x => x.Name).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreateCityAsync(CityUpsertRequest request, CancellationToken cancellationToken)
    {
        await EnsureDistrictExistsAsync(request.DistrictId, cancellationToken);
        var normalized = Normalize(request.Name);
        var exists = await dbContext.Cities.AnyAsync(
            x => x.DistrictId == request.DistrictId && x.Name.ToLower() == normalized,
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A city with the same name already exists for the selected district.");
        }

        var entity = new City
        {
            Name = request.Name.Trim(),
            DistrictId = request.DistrictId,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Cities.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListCitiesAsync(entity.DistrictId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdateCityAsync(int id, CityUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Cities.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await EnsureDistrictExistsAsync(request.DistrictId, cancellationToken);
        var normalized = Normalize(request.Name);
        var exists = await dbContext.Cities.AnyAsync(
            x => x.Id != id && x.DistrictId == request.DistrictId && x.Name.ToLower() == normalized,
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A city with the same name already exists for the selected district.");
        }

        entity.Name = request.Name.Trim();
        entity.DistrictId = request.DistrictId;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListCitiesAsync(entity.DistrictId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetCityActiveAsync(int id, bool isActive, CancellationToken cancellationToken)
        => SetActiveAsync<City>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListPincodesAsync(int? cityId, CancellationToken cancellationToken)
    {
        var pincodes = dbContext.Pincodes.AsNoTracking()
            .Include(x => x.City)
            .ThenInclude(x => x.District)
            .AsQueryable();

        if (cityId.HasValue)
        {
            pincodes = pincodes.Where(x => x.CityId == cityId.Value);
        }

        return await pincodes.OrderBy(x => x.Code)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Code,
                Code = x.Code,
                CityId = x.CityId,
                CityName = x.City.Name,
                DistrictId = x.City.DistrictId,
                DistrictName = x.City.District.Name,
                StateId = x.City.District.StateId,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchPincodesAsync(string? query, int? cityId, CancellationToken cancellationToken)
    {
        var pincodes = dbContext.Pincodes.AsNoTracking().AsQueryable();
        if (cityId.HasValue)
        {
            pincodes = pincodes.Where(x => x.CityId == cityId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            pincodes = pincodes.Where(x => x.Code.ToLower().Contains(normalized));
        }

        return await pincodes.OrderBy(x => x.Code).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Code))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreatePincodeAsync(PincodeUpsertRequest request, CancellationToken cancellationToken)
    {
        await EnsureCityExistsAsync(request.CityId, cancellationToken);
        var normalized = Normalize(request.Code);
        var exists = await dbContext.Pincodes.AnyAsync(x => x.Code.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A pincode with the same code already exists.");
        }

        var entity = new Pincode
        {
            Code = request.Code.Trim(),
            CityId = request.CityId,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Pincodes.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListPincodesAsync(entity.CityId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdatePincodeAsync(int id, PincodeUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Pincodes.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await EnsureCityExistsAsync(request.CityId, cancellationToken);
        var normalized = Normalize(request.Code);
        var exists = await dbContext.Pincodes.AnyAsync(x => x.Id != id && x.Code.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A pincode with the same code already exists.");
        }

        entity.Code = request.Code.Trim();
        entity.CityId = request.CityId;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListPincodesAsync(entity.CityId, cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetPincodeActiveAsync(int id, bool isActive, CancellationToken cancellationToken)
        => SetActiveAsync<Pincode>(id, isActive, cancellationToken);
}
