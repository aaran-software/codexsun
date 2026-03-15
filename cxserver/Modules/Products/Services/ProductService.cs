using System.Linq.Expressions;
using System.Text;
using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Products.DTOs;
using cxserver.Modules.Products.Entities;

namespace cxserver.Modules.Products.Services;

public sealed class ProductService(CodexsunDbContext dbContext)
{
    private static readonly HashSet<string> AllowedPriceTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Retail",
        "Wholesale",
        "Vendor",
        "Offer"
    };

    private static readonly HashSet<string> AllowedSalesChannels = new(StringComparer.OrdinalIgnoreCase)
    {
        "Online",
        "Wholesale",
        "Vendor",
        "Marketplace"
    };

    public async Task<IReadOnlyList<ProductCategoryResponse>> GetCategoriesAsync(bool includeInactive, CancellationToken cancellationToken)
    {
        return await dbContext.ProductCategories
            .AsNoTracking()
            .Where(x => includeInactive || x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new ProductCategoryResponse
            {
                Id = x.Id,
                Name = x.Name,
                Slug = x.Slug,
                IsActive = x.IsActive
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductCategoryResponse> CreateCategoryAsync(string name, CancellationToken cancellationToken)
    {
        var normalizedName = name.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            throw new InvalidOperationException("Category name is required.");
        }

        var slug = ToSlug(normalizedName);
        var exists = await dbContext.ProductCategories.AnyAsync(x => x.Name == normalizedName || x.Slug == slug, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A product category with the same name already exists.");
        }

        var now = DateTimeOffset.UtcNow;
        var category = new ProductCategory
        {
            Name = normalizedName,
            Slug = slug,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.ProductCategories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ProductCategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            IsActive = category.IsActive
        };
    }

    public async Task<IReadOnlyList<ProductListItemResponse>> GetProductsAsync(Guid actorUserId, string role, bool includeInactive, CancellationToken cancellationToken)
    {
        return await BuildVisibleProductsQuery(actorUserId, role, includeInactive)
            .OrderBy(x => x.Name)
            .Select(MapListItem())
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductListItemResponse>> GetProductsByVendorAsync(Guid vendorUserId, Guid actorUserId, string role, bool includeInactive, CancellationToken cancellationToken)
    {
        if (role != "Admin" && vendorUserId != actorUserId)
        {
            return [];
        }

        return await BuildVisibleProductsQuery(actorUserId, role, includeInactive)
            .Where(x => x.VendorUserId == vendorUserId || x.VendorLinks.Any(link => link.VendorUserId == vendorUserId))
            .OrderBy(x => x.Name)
            .Select(MapListItem())
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductListItemResponse>> GetProductsByCategoryAsync(int categoryId, Guid actorUserId, string role, bool includeInactive, CancellationToken cancellationToken)
    {
        return await BuildVisibleProductsQuery(actorUserId, role, includeInactive)
            .Where(x => x.CategoryId == categoryId)
            .OrderBy(x => x.Name)
            .Select(MapListItem())
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductDetailResponse?> GetProductByIdAsync(int productId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        return await BuildVisibleProductsQuery(actorUserId, role, includeInactive: true)
            .Where(x => x.Id == productId)
            .Select(x => new ProductDetailResponse
            {
                Id = x.Id,
                OwnerUserId = x.OwnerUserId,
                VendorUserId = x.VendorUserId,
                VendorId = x.VendorId,
                VendorCompanyName = x.Vendor != null ? x.Vendor.CompanyName : string.Empty,
                VendorName = x.VendorUser != null ? x.VendorUser.Username : string.Empty,
                GroupId = x.GroupId,
                GroupName = x.Group != null ? x.Group.Name : string.Empty,
                TypeId = x.TypeId,
                TypeName = x.Type != null ? x.Type.Name : string.Empty,
                CategoryId = x.CategoryId,
                CategoryName = x.Category != null ? x.Category.Name : string.Empty,
                UnitId = x.UnitId,
                UnitName = x.Unit != null ? x.Unit.Name : string.Empty,
                CurrencyId = x.CurrencyId,
                CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
                GstPercentId = x.GstPercentId,
                GstPercent = x.GstPercent != null ? x.GstPercent.Percentage : null,
                Sku = x.Sku,
                Name = x.Name,
                Slug = x.Slug,
                BasePrice = x.BasePrice,
                CostPrice = x.CostPrice,
                IsPublished = x.IsPublished,
                IsActive = x.IsActive,
                TotalInventory = x.Inventory.Sum(inventory => inventory.Quantity - inventory.ReservedQuantity) + x.VendorLinks.Sum(link => link.VendorInventory),
                ShortDescription = x.ShortDescription,
                Description = x.Description,
                BrandId = x.BrandId,
                BrandName = x.Brand != null ? x.Brand.Name : string.Empty,
                HsnCodeId = x.HsnCodeId,
                HsnCode = x.HsnCode != null ? x.HsnCode.Code : string.Empty,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                Variants = x.Variants
                    .OrderBy(variant => variant.VariantName)
                    .Select(variant => new ProductVariantResponse
                    {
                        Id = variant.Id,
                        Sku = variant.Sku,
                        VariantName = variant.VariantName,
                        Price = variant.Price,
                        CostPrice = variant.CostPrice,
                        InventoryQuantity = variant.InventoryQuantity,
                        IsActive = variant.IsActive
                    })
                    .ToList(),
                Prices = x.Prices
                    .OrderBy(price => price.PriceType)
                    .ThenBy(price => price.SalesChannel)
                    .ThenBy(price => price.MinQuantity)
                    .Select(price => new ProductPriceResponse
                    {
                        Id = price.Id,
                        ProductVariantId = price.ProductVariantId,
                        PriceType = price.PriceType,
                        SalesChannel = price.SalesChannel,
                        MinQuantity = price.MinQuantity,
                        Price = price.Price,
                        CurrencyId = price.CurrencyId,
                        CurrencyName = price.Currency != null ? price.Currency.Name : string.Empty,
                        StartDate = price.StartDate,
                        EndDate = price.EndDate
                    })
                    .ToList(),
                Images = x.Images
                    .OrderByDescending(image => image.IsPrimary)
                    .ThenBy(image => image.SortOrder)
                    .Select(image => new ProductImageResponse
                    {
                        Id = image.Id,
                        ImageUrl = image.ImageUrl,
                        AltText = image.AltText,
                        IsPrimary = image.IsPrimary,
                        SortOrder = image.SortOrder
                    })
                    .ToList(),
                Inventory = x.Inventory
                    .OrderBy(inventory => inventory.Id)
                    .Select(inventory => new ProductInventoryResponse
                    {
                        Id = inventory.Id,
                        WarehouseId = inventory.WarehouseId,
                        WarehouseName = inventory.Warehouse != null ? inventory.Warehouse.Name : string.Empty,
                        Quantity = inventory.Quantity,
                        ReservedQuantity = inventory.ReservedQuantity,
                        ReorderLevel = inventory.ReorderLevel
                    })
                    .ToList(),
                VendorLinks = x.VendorLinks
                    .OrderBy(link => link.VendorUser.Username)
                    .Select(link => new ProductVendorLinkResponse
                    {
                        Id = link.Id,
                        VendorUserId = link.VendorUserId,
                        VendorId = link.VendorId,
                        VendorCompanyName = link.Vendor != null ? link.Vendor.CompanyName : string.Empty,
                        VendorName = link.VendorUser.Username,
                        VendorSku = link.VendorSku,
                        VendorSpecificPrice = link.VendorSpecificPrice,
                        VendorInventory = link.VendorInventory
                    })
                    .ToList(),
                Attributes = x.Attributes
                    .OrderBy(attribute => attribute.Name)
                    .Select(attribute => new ProductAttributeResponse
                    {
                        Id = attribute.Id,
                        Name = attribute.Name,
                        Values = attribute.Values
                            .OrderBy(value => value.Id)
                            .Select(value => new ProductAttributeValueResponse
                            {
                                Id = value.Id,
                                Value = value.Value,
                                ProductVariantId = value.ProductVariantId
                            })
                            .ToList()
                    })
                    .ToList()
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductDetailResponse> CreateProductAsync(ProductUpsertRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        await EnsureProductReferencesAsync(request, cancellationToken);
        await EnsureVendorAssignmentsAsync(request, actorUserId, role, cancellationToken);
        ValidateRequest(request);
        var primaryRetailPrice = GetPrimaryRetailPrice(request);
        var resolvedVendorUserId = ResolveVendorUserId(request.VendorUserId, actorUserId, role);
        var resolvedVendorId = await ResolveVendorIdAsync(resolvedVendorUserId, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? ToSlug(request.Name) : ToSlug(request.Slug);
        await EnsureUniqueProductAsync(request.Sku.Trim(), slug, null, cancellationToken);

        var product = new Product
        {
            OwnerUserId = actorUserId,
            VendorUserId = resolvedVendorUserId,
            VendorId = resolvedVendorId,
            GroupId = request.GroupId,
            TypeId = request.TypeId,
            CategoryId = request.CategoryId,
            UnitId = request.UnitId,
            CurrencyId = request.CurrencyId,
            GstPercentId = request.GstPercentId,
            BrandId = request.BrandId,
            HsnCodeId = request.HsnCodeId,
            Sku = request.Sku.Trim(),
            Name = request.Name.Trim(),
            Slug = slug,
            ShortDescription = request.ShortDescription.Trim(),
            Description = request.Description.Trim(),
            BasePrice = primaryRetailPrice.Price,
            CostPrice = request.CostPrice,
            IsPublished = request.IsPublished,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await ApplyProductCollectionsAsync(product, request, now, cancellationToken);

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Product.Create", nameof(Product), product.Id.ToString(), ipAddress, cancellationToken);
        return (await GetProductByIdAsync(product.Id, actorUserId, role, cancellationToken))!;
    }

    public async Task<ProductDetailResponse?> UpdateProductAsync(int productId, ProductUpsertRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        var product = await dbContext.Products
            .Include(x => x.Variants)
            .Include(x => x.Prices)
            .Include(x => x.Images)
            .Include(x => x.Inventory)
            .Include(x => x.VendorLinks)
            .Include(x => x.Attributes).ThenInclude(attribute => attribute.Values)
            .SingleOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null || !await CanAccessAsync(product, actorUserId, role, cancellationToken))
        {
            return null;
        }

        await EnsureProductReferencesAsync(request, cancellationToken);
        await EnsureVendorAssignmentsAsync(request, actorUserId, role, cancellationToken);
        ValidateRequest(request);
        var primaryRetailPrice = GetPrimaryRetailPrice(request);
        var resolvedVendorUserId = ResolveVendorUserId(request.VendorUserId, actorUserId, role);
        var resolvedVendorId = await ResolveVendorIdAsync(resolvedVendorUserId, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? ToSlug(request.Name) : ToSlug(request.Slug);
        await EnsureUniqueProductAsync(request.Sku.Trim(), slug, productId, cancellationToken);

        product.VendorUserId = resolvedVendorUserId;
        product.VendorId = resolvedVendorId;
        product.GroupId = request.GroupId;
        product.TypeId = request.TypeId;
        product.CategoryId = request.CategoryId;
        product.UnitId = request.UnitId;
        product.CurrencyId = request.CurrencyId;
        product.GstPercentId = request.GstPercentId;
        product.BrandId = request.BrandId;
        product.HsnCodeId = request.HsnCodeId;
        product.Sku = request.Sku.Trim();
        product.Name = request.Name.Trim();
        product.Slug = slug;
        product.ShortDescription = request.ShortDescription.Trim();
        product.Description = request.Description.Trim();
        product.BasePrice = primaryRetailPrice.Price;
        product.CostPrice = request.CostPrice;
        product.IsPublished = request.IsPublished;
        product.IsActive = request.IsActive;
        product.UpdatedAt = now;

        dbContext.ProductVariants.RemoveRange(product.Variants);
        dbContext.ProductPrices.RemoveRange(product.Prices);
        dbContext.ProductImages.RemoveRange(product.Images);
        dbContext.ProductInventory.RemoveRange(product.Inventory);
        dbContext.ProductVendorLinks.RemoveRange(product.VendorLinks);
        dbContext.ProductAttributeValues.RemoveRange(product.Attributes.SelectMany(attribute => attribute.Values));
        dbContext.ProductAttributes.RemoveRange(product.Attributes);

        await ApplyProductCollectionsAsync(product, request, now, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Product.Update", nameof(Product), product.Id.ToString(), ipAddress, cancellationToken);
        return await GetProductByIdAsync(product.Id, actorUserId, role, cancellationToken);
    }

    public async Task<bool> DeleteProductAsync(int productId, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        var product = await dbContext.Products.SingleOrDefaultAsync(x => x.Id == productId, cancellationToken);
        if (product is null || !await CanAccessAsync(product, actorUserId, role, cancellationToken))
        {
            return false;
        }

        product.IsActive = false;
        product.IsPublished = false;
        product.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Product.Delete", nameof(Product), product.Id.ToString(), ipAddress, cancellationToken);
        return true;
    }

    private IQueryable<Product> BuildVisibleProductsQuery(Guid actorUserId, string role, bool includeInactive)
    {
        var query = dbContext.Products
            .AsNoTracking()
            .Include(x => x.VendorUser)
            .Include(x => x.Vendor)
            .Include(x => x.Group)
            .Include(x => x.Type)
            .Include(x => x.Category)
            .Include(x => x.Unit)
            .Include(x => x.Currency)
            .Include(x => x.GstPercent)
            .Include(x => x.Brand)
            .Include(x => x.HsnCode)
            .Include(x => x.Variants)
            .Include(x => x.Prices).ThenInclude(price => price.Currency)
            .Include(x => x.Images)
            .Include(x => x.Inventory).ThenInclude(inventory => inventory.Warehouse)
            .Include(x => x.VendorLinks).ThenInclude(link => link.VendorUser)
            .Include(x => x.VendorLinks).ThenInclude(link => link.Vendor)
            .Include(x => x.Attributes).ThenInclude(attribute => attribute.Values)
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        if (role == "Admin")
        {
            return query;
        }

        var actorVendorIds = dbContext.VendorUsers
            .Where(x => x.UserId == actorUserId)
            .Select(x => x.VendorId);

        return query.Where(x =>
            x.OwnerUserId == actorUserId
            || x.VendorUserId == actorUserId
            || (x.VendorId.HasValue && actorVendorIds.Contains(x.VendorId.Value))
            || x.VendorLinks.Any(link => link.VendorUserId == actorUserId)
            || x.VendorLinks.Any(link => link.VendorId.HasValue && actorVendorIds.Contains(link.VendorId.Value)));
    }

    private static Expression<Func<Product, ProductListItemResponse>> MapListItem()
    {
        return x => new ProductListItemResponse
        {
            Id = x.Id,
            OwnerUserId = x.OwnerUserId,
            VendorUserId = x.VendorUserId,
            VendorId = x.VendorId,
            VendorCompanyName = x.Vendor != null ? x.Vendor.CompanyName : string.Empty,
            VendorName = x.VendorUser != null ? x.VendorUser.Username : string.Empty,
            GroupId = x.GroupId,
            GroupName = x.Group != null ? x.Group.Name : string.Empty,
            TypeId = x.TypeId,
            TypeName = x.Type != null ? x.Type.Name : string.Empty,
            CategoryId = x.CategoryId,
            CategoryName = x.Category != null ? x.Category.Name : string.Empty,
            UnitId = x.UnitId,
            UnitName = x.Unit != null ? x.Unit.Name : string.Empty,
            CurrencyId = x.CurrencyId,
            CurrencyName = x.Currency != null ? x.Currency.Name : string.Empty,
            GstPercentId = x.GstPercentId,
            GstPercent = x.GstPercent != null ? x.GstPercent.Percentage : null,
            Sku = x.Sku,
            Name = x.Name,
            Slug = x.Slug,
            BasePrice = x.BasePrice,
            CostPrice = x.CostPrice,
            IsPublished = x.IsPublished,
            IsActive = x.IsActive,
            TotalInventory = x.Inventory.Sum(inventory => inventory.Quantity - inventory.ReservedQuantity) + x.VendorLinks.Sum(link => link.VendorInventory),
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };
    }

    private async Task EnsureProductReferencesAsync(ProductUpsertRequest request, CancellationToken cancellationToken)
    {
        await EnsureExistsAsync(request.GroupId, dbContext.ProductGroups, "Product group", cancellationToken);
        await EnsureExistsAsync(request.TypeId, dbContext.ProductTypes, "Product type", cancellationToken);
        await EnsureExistsAsync(request.CategoryId, dbContext.ProductCategories, "Product category", cancellationToken);
        await EnsureExistsAsync(request.UnitId, dbContext.Units, "Unit", cancellationToken);
        await EnsureExistsAsync(request.CurrencyId, dbContext.Currencies, "Currency", cancellationToken);
        await EnsureExistsAsync(request.GstPercentId, dbContext.GstPercents, "GST percent", cancellationToken);
        await EnsureExistsAsync(request.BrandId, dbContext.Brands, "Brand", cancellationToken);
        await EnsureExistsAsync(request.HsnCodeId, dbContext.HsnCodes, "HSN code", cancellationToken);
        foreach (var price in request.Prices.Where(item => item.CurrencyId.HasValue))
        {
            await EnsureExistsAsync(price.CurrencyId, dbContext.Currencies, "Price currency", cancellationToken);
        }

        foreach (var inventory in request.Inventory.Where(item => item.WarehouseId.HasValue))
        {
            await EnsureExistsAsync(inventory.WarehouseId, dbContext.Warehouses, "Warehouse", cancellationToken);
        }
    }

    private async Task EnsureVendorAssignmentsAsync(ProductUpsertRequest request, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (request.VendorUserId.HasValue)
        {
            await EnsureVendorUserAsync(request.VendorUserId.Value, actorUserId, role, cancellationToken);
        }

        foreach (var vendorLink in request.VendorLinks)
        {
            await EnsureVendorUserAsync(vendorLink.VendorUserId, actorUserId, role, cancellationToken);
        }
    }

    private async Task EnsureVendorUserAsync(Guid vendorUserId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (role != "Admin" && vendorUserId != actorUserId)
        {
            throw new InvalidOperationException("Vendors can only assign their own vendor scope.");
        }

        var exists = await dbContext.Users.AnyAsync(
            x => x.Id == vendorUserId && !x.IsDeleted && x.Role.Name == "Vendor",
            cancellationToken);

        if (!exists)
        {
            throw new InvalidOperationException("Selected vendor user was not found.");
        }
    }

    private static async Task EnsureExistsAsync<TEntity>(int? id, IQueryable<TEntity> query, string label, CancellationToken cancellationToken)
        where TEntity : class
    {
        if (!id.HasValue)
        {
            return;
        }

        var parameter = Expression.Parameter(typeof(TEntity), "x");
        var property = Expression.PropertyOrField(parameter, "Id");
        var body = Expression.Equal(property, Expression.Constant(id.Value));
        var predicate = Expression.Lambda<Func<TEntity, bool>>(body, parameter);
        var exists = await query.AnyAsync(predicate, cancellationToken);

        if (!exists)
        {
            throw new InvalidOperationException($"{label} was not found.");
        }
    }

    private async Task EnsureUniqueProductAsync(string sku, string slug, int? productId, CancellationToken cancellationToken)
    {
        var duplicateExists = await dbContext.Products.AnyAsync(
            x => x.Id != productId && (x.Sku == sku || x.Slug == slug),
            cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException("A product with the same SKU or slug already exists.");
        }
    }

    private static Guid? ResolveVendorUserId(Guid? vendorUserId, Guid actorUserId, string role)
        => role == "Vendor" ? actorUserId : vendorUserId;

    private static void ValidateRequest(ProductUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Sku))
        {
            throw new InvalidOperationException("SKU is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("Product name is required.");
        }

        if (request.Prices.Count == 0)
        {
            throw new InvalidOperationException("At least one product price row is required.");
        }

        foreach (var price in request.Prices)
        {
            if (string.IsNullOrWhiteSpace(price.PriceType) || !AllowedPriceTypes.Contains(price.PriceType.Trim()))
            {
                throw new InvalidOperationException("Price type must be Retail, Wholesale, Vendor, or Offer.");
            }

            if (string.IsNullOrWhiteSpace(price.SalesChannel) || !AllowedSalesChannels.Contains(price.SalesChannel.Trim()))
            {
                throw new InvalidOperationException("Sales channel must be Online, Wholesale, Vendor, or Marketplace.");
            }

            if (price.MinQuantity < 1)
            {
                throw new InvalidOperationException("Minimum quantity must be at least 1.");
            }

            if (price.StartDate.HasValue && price.EndDate.HasValue && price.EndDate.Value < price.StartDate.Value)
            {
                throw new InvalidOperationException("Price end date must be on or after the start date.");
            }
        }

        if (!request.Prices.Any(price => string.Equals(price.PriceType.Trim(), "Retail", StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException("A retail price row is required.");
        }
    }

    private async Task<bool> CanAccessAsync(Product product, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (role == "Admin" || product.OwnerUserId == actorUserId || product.VendorUserId == actorUserId)
        {
            return true;
        }

        if (!product.VendorId.HasValue)
        {
            return false;
        }

        return await dbContext.VendorUsers.AnyAsync(
            x => x.UserId == actorUserId && x.VendorId == product.VendorId.Value,
            cancellationToken);
    }

    private static string ToSlug(string value)
    {
        var builder = new StringBuilder();
        var previousDash = false;

        foreach (var character in value.Trim().ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(character))
            {
                builder.Append(character);
                previousDash = false;
                continue;
            }

            if (previousDash)
            {
                continue;
            }

            builder.Append('-');
            previousDash = true;
        }

        return builder.ToString().Trim('-');
    }

    private async Task ApplyProductCollectionsAsync(Product product, ProductUpsertRequest request, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var variants = request.Variants
            .Where(variant => !string.IsNullOrWhiteSpace(variant.Sku) && !string.IsNullOrWhiteSpace(variant.VariantName))
            .Select(variant => new ProductVariant
            {
                Sku = variant.Sku.Trim(),
                VariantName = variant.VariantName.Trim(),
                Price = variant.Price,
                CostPrice = variant.CostPrice,
                InventoryQuantity = variant.InventoryQuantity,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();

        var vendorLinkVendorIds = await ResolveVendorIdsAsync(request.VendorLinks.Select(link => link.VendorUserId), cancellationToken);

        product.Variants = variants;
        product.Prices = request.Prices
            .Where(price => !string.IsNullOrWhiteSpace(price.PriceType) && !string.IsNullOrWhiteSpace(price.SalesChannel))
            .Select(price => new ProductPrice
            {
                ProductVariantId = price.ProductVariantId,
                PriceType = NormalizePriceType(price.PriceType),
                SalesChannel = NormalizeSalesChannel(price.SalesChannel),
                MinQuantity = price.MinQuantity,
                Price = price.Price,
                CurrencyId = price.CurrencyId,
                StartDate = price.StartDate,
                EndDate = price.EndDate,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();
        product.Images = request.Images
            .Where(image => !string.IsNullOrWhiteSpace(image.ImageUrl))
            .Select(image => new ProductImage
            {
                ImageUrl = image.ImageUrl.Trim(),
                AltText = image.AltText.Trim(),
                IsPrimary = image.IsPrimary,
                SortOrder = image.SortOrder,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();
        product.Inventory = request.Inventory
            .Select(inventory => new ProductInventory
            {
                WarehouseId = inventory.WarehouseId,
                Quantity = inventory.Quantity,
                ReservedQuantity = inventory.ReservedQuantity,
                ReorderLevel = inventory.ReorderLevel,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();
        product.VendorLinks = request.VendorLinks
            .Select(link => new ProductVendorLink
            {
                VendorUserId = link.VendorUserId,
                VendorId = vendorLinkVendorIds.TryGetValue(link.VendorUserId, out var vendorId) ? vendorId : null,
                VendorSku = link.VendorSku.Trim(),
                VendorSpecificPrice = link.VendorSpecificPrice,
                VendorInventory = link.VendorInventory,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();
        product.Attributes = request.Attributes
            .Where(attribute => !string.IsNullOrWhiteSpace(attribute.Name))
            .Select(attribute => new ProductAttribute
            {
                Name = attribute.Name.Trim(),
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
                Values = attribute.Values
                    .Where(value => !string.IsNullOrWhiteSpace(value.Value))
                    .Select(value => new ProductAttributeValue
                    {
                        Value = value.Value.Trim(),
                        ProductVariant = value.VariantIndex.HasValue && value.VariantIndex.Value >= 0 && value.VariantIndex.Value < variants.Count
                            ? variants[value.VariantIndex.Value]
                            : null,
                        IsActive = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    })
                    .ToList()
            })
            .ToList();

        if (product.Images.Count > 0 && product.Images.All(image => !image.IsPrimary))
        {
            product.Images.First().IsPrimary = true;
        }
    }

    private async Task<int?> ResolveVendorIdAsync(Guid? vendorUserId, CancellationToken cancellationToken)
    {
        if (!vendorUserId.HasValue)
        {
            return null;
        }

        return await dbContext.VendorUsers
            .Where(x => x.UserId == vendorUserId.Value)
            .Select(x => (int?)x.VendorId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<Dictionary<Guid, int?>> ResolveVendorIdsAsync(IEnumerable<Guid> vendorUserIds, CancellationToken cancellationToken)
    {
        var ids = vendorUserIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return [];
        }

        return await dbContext.VendorUsers
            .Where(x => ids.Contains(x.UserId))
            .GroupBy(x => x.UserId)
            .Select(x => new { x.Key, VendorId = (int?)x.Select(item => item.VendorId).FirstOrDefault() })
            .ToDictionaryAsync(x => x.Key, x => x.VendorId, cancellationToken);
    }

    private static ProductPriceRequest GetPrimaryRetailPrice(ProductUpsertRequest request)
    {
        var retailPrice = request.Prices
            .Where(price => string.Equals(price.PriceType.Trim(), "Retail", StringComparison.OrdinalIgnoreCase))
            .OrderBy(price => string.Equals(price.SalesChannel.Trim(), "Online", StringComparison.OrdinalIgnoreCase) ? 0 : 1)
            .ThenBy(price => price.MinQuantity)
            .FirstOrDefault();

        return retailPrice ?? throw new InvalidOperationException("A retail price row is required.");
    }

    private static string NormalizePriceType(string value)
        => value.Trim().ToLowerInvariant() switch
        {
            "retail" => "Retail",
            "wholesale" => "Wholesale",
            "vendor" => "Vendor",
            "offer" => "Offer",
            _ => value.Trim()
        };

    private static string NormalizeSalesChannel(string value)
        => value.Trim().ToLowerInvariant() switch
        {
            "online" => "Online",
            "wholesale" => "Wholesale",
            "vendor" => "Vendor",
            "marketplace" => "Marketplace",
            _ => value.Trim()
        };

    private async Task WriteAuditLogAsync(Guid? userId, string action, string entityType, string? entityId, string ipAddress, CancellationToken cancellationToken)
    {
        dbContext.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            IpAddress = ipAddress,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
