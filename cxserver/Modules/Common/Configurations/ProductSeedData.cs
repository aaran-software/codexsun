using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Configurations;

internal static class ProductSeedData
{
    internal static readonly ContactType[] ContactTypes =
    [
        new ContactType { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ContactType { Id = 2, Name = "Customer", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ContactType { Id = 3, Name = "Vendor", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ContactType { Id = 4, Name = "Supplier", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ContactType { Id = 5, Name = "Employee", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ContactType { Id = 6, Name = "Distributor", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ContactType { Id = 7, Name = "Retailer", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly ProductType[] ProductTypes =
    [
        new ProductType { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ProductType { Id = 2, Name = "T-Shirt", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ProductType { Id = 3, Name = "Shirt", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ProductType { Id = 4, Name = "Hoodie", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ProductType { Id = 5, Name = "Polo", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly ProductGroup[] ProductGroups =
    [
        new ProductGroup { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ProductGroup { Id = 2, Name = "Apparel", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new ProductGroup { Id = 3, Name = "Accessories", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly HsnCode[] HsnCodes =
    [
        new HsnCode { Id = 1, Code = "-", Description = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new HsnCode { Id = 2, Code = "61091000", Description = "T-shirts, singlets and other vests, knitted or crocheted, of cotton", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new HsnCode { Id = 3, Code = "61099090", Description = "Other T-shirts, singlets and vests, knitted or crocheted", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new HsnCode { Id = 4, Code = "62052000", Description = "Men's or boys' shirts of cotton", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly Unit[] Units =
    [
        new Unit { Id = 1, Name = "-", ShortName = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Unit { Id = 2, Name = "Pieces", ShortName = "PCS", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Unit { Id = 3, Name = "Kilogram", ShortName = "KG", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Unit { Id = 4, Name = "Meter", ShortName = "MTR", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Unit { Id = 5, Name = "Litre", ShortName = "LTR", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Unit { Id = 6, Name = "Box", ShortName = "BOX", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Unit { Id = 7, Name = "Pair", ShortName = "PAIR", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly GstPercent[] GstPercents =
    [
        new GstPercent { Id = 1, Percentage = 0m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new GstPercent { Id = 2, Percentage = 5m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new GstPercent { Id = 3, Percentage = 12m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new GstPercent { Id = 4, Percentage = 18m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new GstPercent { Id = 5, Percentage = 28m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly Colour[] Colours =
    [
        new Colour { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 2, Name = "Black", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 3, Name = "White", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 4, Name = "Blue", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 5, Name = "Navy", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 6, Name = "Grey", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 7, Name = "Red", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 8, Name = "Maroon", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 9, Name = "Olive", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 10, Name = "Green", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Colour { Id = 11, Name = "Yellow", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly Size[] Sizes =
    [
        new Size { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Size { Id = 2, Name = "Free Size", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Size { Id = 3, Name = "XS", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Size { Id = 4, Name = "S", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Size { Id = 5, Name = "M", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Size { Id = 6, Name = "L", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Size { Id = 7, Name = "XL", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Size { Id = 8, Name = "XXL", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Size { Id = 9, Name = "3XL", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly OrderType[] OrderTypes =
    [
        new OrderType { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new OrderType { Id = 2, Name = "Online", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new OrderType { Id = 3, Name = "Wholesale", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new OrderType { Id = 4, Name = "Retail", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly Style[] Styles =
    [
        new Style { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Style { Id = 2, Name = "Crew Neck", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Style { Id = 3, Name = "V Neck", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Style { Id = 4, Name = "Polo", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Style { Id = 5, Name = "Oversized", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly Brand[] Brands =
    [
        new Brand { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Brand { Id = 2, Name = "Codexsun", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Brand { Id = 3, Name = "Nike", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Brand { Id = 4, Name = "Adidas", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Brand { Id = 5, Name = "Puma", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];
}
