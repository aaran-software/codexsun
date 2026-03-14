using Microsoft.EntityFrameworkCore;
using cxserver.Modules.Common.DTOs;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Services;

public sealed partial class CommonMasterDataService
{
    public Task<IReadOnlyList<CommonMasterDataResponse>> ListContactTypesAsync(CancellationToken cancellationToken) => ListNamedAsync<ContactType>(cancellationToken);
    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchContactTypesAsync(string? query, CancellationToken cancellationToken) => SearchNamedAsync<ContactType>(query, cancellationToken);
    public Task<CommonMasterDataResponse> CreateContactTypeAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken) => CreateNamedAsync<ContactType>(request, cancellationToken);
    public Task<CommonMasterDataResponse?> UpdateContactTypeAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken) => UpdateNamedAsync<ContactType>(id, request, cancellationToken);
    public Task<bool> SetContactTypeActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<ContactType>(id, isActive, cancellationToken);

    public Task<IReadOnlyList<CommonMasterDataResponse>> ListProductTypesAsync(CancellationToken cancellationToken) => ListNamedAsync<ProductType>(cancellationToken);
    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchProductTypesAsync(string? query, CancellationToken cancellationToken) => SearchNamedAsync<ProductType>(query, cancellationToken);
    public Task<CommonMasterDataResponse> CreateProductTypeAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken) => CreateNamedAsync<ProductType>(request, cancellationToken);
    public Task<CommonMasterDataResponse?> UpdateProductTypeAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken) => UpdateNamedAsync<ProductType>(id, request, cancellationToken);
    public Task<bool> SetProductTypeActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<ProductType>(id, isActive, cancellationToken);

    public Task<IReadOnlyList<CommonMasterDataResponse>> ListProductGroupsAsync(CancellationToken cancellationToken) => ListNamedAsync<ProductGroup>(cancellationToken);
    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchProductGroupsAsync(string? query, CancellationToken cancellationToken) => SearchNamedAsync<ProductGroup>(query, cancellationToken);
    public Task<CommonMasterDataResponse> CreateProductGroupAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken) => CreateNamedAsync<ProductGroup>(request, cancellationToken);
    public Task<CommonMasterDataResponse?> UpdateProductGroupAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken) => UpdateNamedAsync<ProductGroup>(id, request, cancellationToken);
    public Task<bool> SetProductGroupActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<ProductGroup>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListHsnCodesAsync(CancellationToken cancellationToken)
    {
        return await dbContext.HsnCodes.AsNoTracking().OrderBy(x => x.Code)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Code,
                Code = x.Code,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchHsnCodesAsync(string? query, CancellationToken cancellationToken)
    {
        var codes = dbContext.HsnCodes.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            codes = codes.Where(x => x.Code.ToLower().Contains(normalized));
        }

        return await codes.OrderBy(x => x.Code).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Code))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreateHsnCodeAsync(HsnCodeUpsertRequest request, CancellationToken cancellationToken)
    {
        var normalized = Normalize(request.Code);
        var exists = await dbContext.HsnCodes.AnyAsync(x => x.Code.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("An HSN code with the same code already exists.");
        }

        var entity = new HsnCode
        {
            Code = request.Code.Trim(),
            Description = request.Description.Trim(),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.HsnCodes.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListHsnCodesAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdateHsnCodeAsync(int id, HsnCodeUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.HsnCodes.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;

        var normalized = Normalize(request.Code);
        var exists = await dbContext.HsnCodes.AnyAsync(x => x.Id != id && x.Code.ToLower() == normalized, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("An HSN code with the same code already exists.");
        }

        entity.Code = request.Code.Trim();
        entity.Description = request.Description.Trim();
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListHsnCodesAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetHsnCodeActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<HsnCode>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListUnitsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Units.AsNoTracking().OrderBy(x => x.Name)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Name,
                ShortName = x.ShortName,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchUnitsAsync(string? query, CancellationToken cancellationToken)
    {
        var units = dbContext.Units.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = Normalize(query);
            units = units.Where(x => x.Name.ToLower().Contains(normalized) || x.ShortName.ToLower().Contains(normalized));
        }

        return await units.OrderBy(x => x.Name).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreateUnitAsync(UnitUpsertRequest request, CancellationToken cancellationToken)
    {
        var normalizedName = Normalize(request.Name);
        var normalizedShortName = Normalize(request.ShortName);
        var exists = await dbContext.Units.AnyAsync(x => x.Name.ToLower() == normalizedName || x.ShortName.ToLower() == normalizedShortName, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A unit with the same name or short name already exists.");
        }

        var entity = new Unit
        {
            Name = request.Name.Trim(),
            ShortName = request.ShortName.Trim(),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Units.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListUnitsAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdateUnitAsync(int id, UnitUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.Units.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;

        var normalizedName = Normalize(request.Name);
        var normalizedShortName = Normalize(request.ShortName);
        var exists = await dbContext.Units.AnyAsync(x => x.Id != id && (x.Name.ToLower() == normalizedName || x.ShortName.ToLower() == normalizedShortName), cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A unit with the same name or short name already exists.");
        }

        entity.Name = request.Name.Trim();
        entity.ShortName = request.ShortName.Trim();
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListUnitsAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetUnitActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<Unit>(id, isActive, cancellationToken);

    public async Task<IReadOnlyList<CommonMasterDataResponse>> ListGstPercentsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.GstPercents.AsNoTracking().OrderBy(x => x.Percentage)
            .Select(x => new CommonMasterDataResponse
            {
                Id = x.Id,
                Name = x.Percentage.ToString(),
                Percentage = x.Percentage,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CommonSearchItemResponse>> SearchGstPercentsAsync(string? query, CancellationToken cancellationToken)
    {
        var gstPercents = dbContext.GstPercents.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            gstPercents = gstPercents.Where(x => x.Percentage.ToString().Contains(query.Trim()));
        }

        return await gstPercents.OrderBy(x => x.Percentage).Take(SearchLimit)
            .Select(x => ToSearchItem(x.Id, x.Percentage.ToString()))
            .ToListAsync(cancellationToken);
    }

    public async Task<CommonMasterDataResponse> CreateGstPercentAsync(GstPercentUpsertRequest request, CancellationToken cancellationToken)
    {
        var percentage = decimal.Round(request.Percentage, 2);
        var exists = await dbContext.GstPercents.AnyAsync(x => x.Percentage == percentage, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A GST percent with the same value already exists.");
        }

        var entity = new GstPercent
        {
            Percentage = percentage,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.GstPercents.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListGstPercentsAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<CommonMasterDataResponse?> UpdateGstPercentAsync(int id, GstPercentUpsertRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.GstPercents.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return null;

        var percentage = decimal.Round(request.Percentage, 2);
        var exists = await dbContext.GstPercents.AnyAsync(x => x.Id != id && x.Percentage == percentage, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A GST percent with the same value already exists.");
        }

        entity.Percentage = percentage;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await ListGstPercentsAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public Task<bool> SetGstPercentActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<GstPercent>(id, isActive, cancellationToken);

    public Task<IReadOnlyList<CommonMasterDataResponse>> ListColoursAsync(CancellationToken cancellationToken) => ListNamedAsync<Colour>(cancellationToken);
    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchColoursAsync(string? query, CancellationToken cancellationToken) => SearchNamedAsync<Colour>(query, cancellationToken);
    public Task<CommonMasterDataResponse> CreateColourAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken) => CreateNamedAsync<Colour>(request, cancellationToken);
    public Task<CommonMasterDataResponse?> UpdateColourAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken) => UpdateNamedAsync<Colour>(id, request, cancellationToken);
    public Task<bool> SetColourActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<Colour>(id, isActive, cancellationToken);

    public Task<IReadOnlyList<CommonMasterDataResponse>> ListSizesAsync(CancellationToken cancellationToken) => ListNamedAsync<Size>(cancellationToken);
    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchSizesAsync(string? query, CancellationToken cancellationToken) => SearchNamedAsync<Size>(query, cancellationToken);
    public Task<CommonMasterDataResponse> CreateSizeAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken) => CreateNamedAsync<Size>(request, cancellationToken);
    public Task<CommonMasterDataResponse?> UpdateSizeAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken) => UpdateNamedAsync<Size>(id, request, cancellationToken);
    public Task<bool> SetSizeActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<Size>(id, isActive, cancellationToken);

    public Task<IReadOnlyList<CommonMasterDataResponse>> ListOrderTypesAsync(CancellationToken cancellationToken) => ListNamedAsync<OrderType>(cancellationToken);
    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchOrderTypesAsync(string? query, CancellationToken cancellationToken) => SearchNamedAsync<OrderType>(query, cancellationToken);
    public Task<CommonMasterDataResponse> CreateOrderTypeAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken) => CreateNamedAsync<OrderType>(request, cancellationToken);
    public Task<CommonMasterDataResponse?> UpdateOrderTypeAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken) => UpdateNamedAsync<OrderType>(id, request, cancellationToken);
    public Task<bool> SetOrderTypeActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<OrderType>(id, isActive, cancellationToken);

    public Task<IReadOnlyList<CommonMasterDataResponse>> ListStylesAsync(CancellationToken cancellationToken) => ListNamedAsync<Style>(cancellationToken);
    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchStylesAsync(string? query, CancellationToken cancellationToken) => SearchNamedAsync<Style>(query, cancellationToken);
    public Task<CommonMasterDataResponse> CreateStyleAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken) => CreateNamedAsync<Style>(request, cancellationToken);
    public Task<CommonMasterDataResponse?> UpdateStyleAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken) => UpdateNamedAsync<Style>(id, request, cancellationToken);
    public Task<bool> SetStyleActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<Style>(id, isActive, cancellationToken);

    public Task<IReadOnlyList<CommonMasterDataResponse>> ListBrandsAsync(CancellationToken cancellationToken) => ListNamedAsync<Brand>(cancellationToken);
    public Task<IReadOnlyList<CommonSearchItemResponse>> SearchBrandsAsync(string? query, CancellationToken cancellationToken) => SearchNamedAsync<Brand>(query, cancellationToken);
    public Task<CommonMasterDataResponse> CreateBrandAsync(NameMasterUpsertRequest request, CancellationToken cancellationToken) => CreateNamedAsync<Brand>(request, cancellationToken);
    public Task<CommonMasterDataResponse?> UpdateBrandAsync(int id, NameMasterUpsertRequest request, CancellationToken cancellationToken) => UpdateNamedAsync<Brand>(id, request, cancellationToken);
    public Task<bool> SetBrandActiveAsync(int id, bool isActive, CancellationToken cancellationToken) => SetActiveAsync<Brand>(id, isActive, cancellationToken);
}
