using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Common.DTOs;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Services;

public sealed partial class CommonMasterDataService(CodexsunDbContext dbContext)
{
    private const int SearchLimit = 20;

    private static string Normalize(string value) => value.Trim().ToLowerInvariant();

    private static CommonMasterDataResponse ToNamedResponse(NamedCommonMasterEntity entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        IsActive = entity.IsActive,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };

    private static CommonSearchItemResponse ToSearchItem(int id, string name) => new()
    {
        Id = id,
        Name = name
    };

    private async Task<IReadOnlyList<CommonMasterDataResponse>> ListNamedAsync<TEntity>(CancellationToken cancellationToken)
        where TEntity : NamedCommonMasterEntity
    {
        return await dbContext.Set<TEntity>()
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyList<CommonSearchItemResponse>> SearchNamedAsync<TEntity>(string? query, CancellationToken cancellationToken)
        where TEntity : NamedCommonMasterEntity
    {
        var items = dbContext.Set<TEntity>().AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            items = items.Where(x => x.Name.ToLower().Contains(normalized));
        }

        return await items
            .OrderBy(x => x.Name)
            .Take(SearchLimit)
            .Select(x => new CommonSearchItemResponse { Id = x.Id, Name = x.Name })
            .ToListAsync(cancellationToken);
    }

    private async Task<CommonMasterDataResponse> CreateNamedAsync<TEntity>(NameMasterUpsertRequest request, CancellationToken cancellationToken)
        where TEntity : NamedCommonMasterEntity, new()
    {
        var normalized = Normalize(request.Name);
        var exists = await dbContext.Set<TEntity>().AnyAsync(x => x.Name.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A record with the same name already exists.");
        }

        var entity = new TEntity
        {
            Name = request.Name.Trim(),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Set<TEntity>().Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToNamedResponse(entity);
    }

    private async Task<CommonMasterDataResponse?> UpdateNamedAsync<TEntity>(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken)
        where TEntity : NamedCommonMasterEntity
    {
        var entity = await dbContext.Set<TEntity>().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var normalized = Normalize(request.Name);
        var exists = await dbContext.Set<TEntity>().AnyAsync(x => x.Id != id && x.Name.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A record with the same name already exists.");
        }

        entity.Name = request.Name.Trim();
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToNamedResponse(entity);
    }

    private async Task<bool> SetActiveAsync<TEntity>(int id, bool isActive, CancellationToken cancellationToken)
        where TEntity : CommonMasterEntity
    {
        var entity = await dbContext.Set<TEntity>().SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        entity.IsActive = isActive;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task EnsureCountryExistsAsync(int countryId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Countries.AnyAsync(x => x.Id == countryId, cancellationToken))
        {
            throw new InvalidOperationException("Country not found.");
        }
    }

    private async Task EnsureStateExistsAsync(int stateId, CancellationToken cancellationToken)
    {
        if (!await dbContext.States.AnyAsync(x => x.Id == stateId, cancellationToken))
        {
            throw new InvalidOperationException("State not found.");
        }
    }

    private async Task EnsureDistrictExistsAsync(int districtId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Districts.AnyAsync(x => x.Id == districtId, cancellationToken))
        {
            throw new InvalidOperationException("District not found.");
        }
    }

    private async Task EnsureCityExistsAsync(int cityId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Cities.AnyAsync(x => x.Id == cityId, cancellationToken))
        {
            throw new InvalidOperationException("City not found.");
        }
    }

    private async Task ValidateDestinationReferencesAsync(int? countryId, int? cityId, CancellationToken cancellationToken)
    {
        if (countryId.HasValue)
        {
            await EnsureCountryExistsAsync(countryId.Value, cancellationToken);
        }

        if (cityId.HasValue)
        {
            await EnsureCityExistsAsync(cityId.Value, cancellationToken);
        }
    }
}
