using cxserver.Infrastructure;
using cxserver.Modules.Common.Configurations;
using cxserver.Modules.Products.Entities;

namespace cxserver.Modules.Products.Configurations;

internal static class ProductCatalogSeedData
{
    internal static readonly ProductCategory[] Categories;
    internal static readonly Product[] Products;
    internal static readonly ProductPrice[] Prices;
    internal static readonly ProductImage[] Images;
    internal static readonly ProductInventory[] Inventory;
    internal static readonly ProductAttribute[] Attributes;
    internal static readonly ProductAttributeValue[] AttributeValues;

    static ProductCatalogSeedData()
    {
        var categories = new List<ProductCategory>();
        var products = new List<Product>();
        var prices = new List<ProductPrice>();
        var images = new List<ProductImage>();
        var inventory = new List<ProductInventory>();
        var attributes = new List<ProductAttribute>();
        var attributeValues = new List<ProductAttributeValue>();

        var productId = 2001;
        var priceId = 3001;
        var imageId = 4001;
        var inventoryId = 5001;
        var attributeId = 6001;
        var attributeValueId = 7001;

        foreach (var category in GetCategories())
        {
            categories.Add(new ProductCategory
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                IsActive = true,
                CreatedAt = Seed.Utc,
                UpdatedAt = Seed.Utc
            });

            for (var index = 0; index < category.ProductNames.Length; index++)
            {
                var createdAt = Seed.Utc.AddMinutes(((category.Id - 1001) * 20) + index);
                var basePrice = category.BasePrice + (index * category.PriceStep);
                var product = new Product
                {
                    Id = productId,
                    OwnerUserId = AuthSeedData.SuperAdminUserId,
                    CategoryId = category.Id,
                    UnitId = 2,
                    CurrencyId = 2,
                    GstPercentId = category.GstPercentId,
                    Sku = $"{category.SkuPrefix}-{index + 1:000}",
                    Name = category.ProductNames[index],
                    Slug = $"{category.Slug}-{ToSlug(category.ProductNames[index])}",
                    ShortDescription = $"{category.Name.TrimEnd('s')} for storefront demo catalog with live remote image URLs.",
                    Description = BuildDescription(category.Name, category.ProductNames[index]),
                    BasePrice = basePrice,
                    CostPrice = decimal.Round(basePrice * 0.82m, 2),
                    IsPublished = true,
                    IsActive = true,
                    CreatedAt = createdAt,
                    UpdatedAt = createdAt
                };

                products.Add(product);

                prices.Add(new ProductPrice
                {
                    Id = priceId++,
                    ProductId = product.Id,
                    PriceType = "Retail",
                    SalesChannel = "Online",
                    MinQuantity = 1,
                    Price = basePrice,
                    CurrencyId = 2,
                    IsActive = true,
                    CreatedAt = createdAt,
                    UpdatedAt = createdAt
                });

                if (index % 4 == 0)
                {
                    prices.Add(new ProductPrice
                    {
                        Id = priceId++,
                        ProductId = product.Id,
                        PriceType = "Offer",
                        SalesChannel = "Online",
                        MinQuantity = 1,
                        Price = decimal.Round(basePrice * 0.93m, 2),
                        CurrencyId = 2,
                        StartDate = Seed.Utc,
                        EndDate = Seed.Utc.AddYears(2),
                        IsActive = true,
                        CreatedAt = createdAt,
                        UpdatedAt = createdAt
                    });
                }

                images.Add(new ProductImage
                {
                    Id = imageId++,
                    ProductId = product.Id,
                    ImageUrl = category.PrimaryImageUrl,
                    AltText = $"{product.Name} primary image",
                    IsPrimary = true,
                    SortOrder = 1,
                    IsActive = true,
                    CreatedAt = createdAt,
                    UpdatedAt = createdAt
                });

                images.Add(new ProductImage
                {
                    Id = imageId++,
                    ProductId = product.Id,
                    ImageUrl = category.SecondaryImageUrl,
                    AltText = $"{product.Name} gallery image",
                    IsPrimary = false,
                    SortOrder = 2,
                    IsActive = true,
                    CreatedAt = createdAt,
                    UpdatedAt = createdAt
                });

                inventory.Add(new ProductInventory
                {
                    Id = inventoryId++,
                    ProductId = product.Id,
                    WarehouseId = 2 + (index % 3),
                    Quantity = category.BaseInventory + (index * 3),
                    ReservedQuantity = index % 5,
                    ReorderLevel = Math.Max(4, category.BaseInventory / 3),
                    IsActive = true,
                    CreatedAt = createdAt,
                    UpdatedAt = createdAt
                });

                foreach (var spec in BuildSpecs(category.SpecLabels, index))
                {
                    var attribute = new ProductAttribute
                    {
                        Id = attributeId++,
                        ProductId = product.Id,
                        Name = spec.Name,
                        IsActive = true,
                        CreatedAt = createdAt,
                        UpdatedAt = createdAt
                    };

                    attributes.Add(attribute);
                    attributeValues.Add(new ProductAttributeValue
                    {
                        Id = attributeValueId++,
                        ProductAttributeId = attribute.Id,
                        Value = spec.Value,
                        IsActive = true,
                        CreatedAt = createdAt,
                        UpdatedAt = createdAt
                    });
                }

                productId++;
            }
        }

        Categories = categories.ToArray();
        Products = products.ToArray();
        Prices = prices.ToArray();
        Images = images.ToArray();
        Inventory = inventory.ToArray();
        Attributes = attributes.ToArray();
        AttributeValues = attributeValues.ToArray();
    }

    private static string BuildDescription(string categoryName, string productName)
        => $"{productName} is seeded dummy data for the storefront catalog. It represents the {categoryName.ToLowerInvariant()} segment with pricing, stock, specifications, and remote internet-hosted images so listing cards and product pages render realistic content.";

    private static (string Name, string Value)[] BuildSpecs(string[] labels, int index)
        => labels.Select((label, itemIndex) => (label, GetSpecValue(label, index, itemIndex))).ToArray();

    private static string GetSpecValue(string label, int index, int itemIndex)
        => label switch
        {
            "Processor" => new[] { "Intel Core i5", "Intel Core i7", "AMD Ryzen 5", "AMD Ryzen 7", "Intel Core i9" }[(index + itemIndex) % 5],
            "Memory" => new[] { "8 GB", "16 GB", "16 GB", "32 GB", "64 GB" }[(index + itemIndex) % 5],
            "Storage" => new[] { "256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD", "4 TB HDD" }[(index + itemIndex) % 5],
            "Display" => new[] { "14-inch FHD", "15.6-inch FHD", "16-inch QHD", "24-inch FHD", "27-inch QHD" }[(index + itemIndex) % 5],
            "Panel" => new[] { "IPS", "IPS", "VA", "Fast IPS", "OLED" }[(index + itemIndex) % 5],
            "Refresh Rate" => new[] { "60 Hz", "75 Hz", "100 Hz", "144 Hz", "165 Hz" }[(index + itemIndex) % 5],
            "Connection" => new[] { "USB wired", "Bluetooth", "2.4 GHz wireless", "USB-C wired", "Multi-device" }[(index + itemIndex) % 5],
            "Switch Type" => new[] { "Membrane", "Silent membrane", "Blue mechanical", "Red mechanical", "Low-profile mechanical" }[(index + itemIndex) % 5],
            "Capacity" => new[] { "256 GB", "500 GB", "1 TB", "2 TB", "8 TB" }[(index + itemIndex) % 5],
            "Interface" => new[] { "SATA III", "PCIe Gen4 x4", "USB 3.2", "USB-C 10 Gbps", "DDR5" }[(index + itemIndex) % 5],
            "Type" => new[] { "DDR4", "DDR4 SO-DIMM", "DDR5", "DDR5 kit", "ECC" }[(index + itemIndex) % 5],
            "Speed" => new[] { "3200 MT/s", "3600 MT/s", "5600 MT/s", "6000 MT/s", "7000 MB/s" }[(index + itemIndex) % 5],
            "Graphics" => new[] { "GTX 1650", "RTX 3050", "RTX 4060", "RTX 4070", "RX 7700 XT" }[(index + itemIndex) % 5],
            "Boost Clock" => new[] { "1590 MHz", "1777 MHz", "2460 MHz", "2550 MHz", "2655 MHz" }[(index + itemIndex) % 5],
            "Socket" => new[] { "AM4", "AM5", "LGA1700", "LGA1200", "W680" }[(index + itemIndex) % 5],
            "Chipset" => new[] { "B550", "B650", "B760", "Z790", "X670E" }[(index + itemIndex) % 5],
            "Wireless" => new[] { "Wi-Fi 5", "Wi-Fi 6", "Wi-Fi 6E", "Dual-band AX", "PoE capable" }[(index + itemIndex) % 5],
            "Ports" => new[] { "4 LAN", "8 Gigabit", "24 Gigabit", "HDMI + DP", "USB-C + DP" }[(index + itemIndex) % 5],
            _ => new[] { "Standard", "Pro", "Advanced", "Performance", "Enterprise" }[(index + itemIndex) % 5]
        };

    private static string ToSlug(string value)
        => string.Join("-", value.ToLowerInvariant().Split([' ', '/', ',', '.'], StringSplitOptions.RemoveEmptyEntries).Select(part => new string(part.Where(char.IsLetterOrDigit).ToArray())).Where(part => part.Length > 0));

    private static CategorySeed[] GetCategories()
        =>
        [
            new(1001, "Laptops", "laptops", "LAP", 45990m, 3200m, 4, 18, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=1200&h=1200&fit=crop&q=80", ["Processor", "Memory", "Storage", "Display"], ["AstraBook 14 Ryzen Laptop", "NovaSlim 15 Creator Laptop", "Vertex Pro 16 Performance Laptop", "Orbit Air 13 Ultrabook", "Titan G15 Gaming Laptop", "CoreLite Student Laptop", "ZenEdge Business Notebook", "PixelForge Studio Laptop", "CloudMate Everyday Laptop", "FusionBook 14 Touch Laptop"]),
            new(1002, "Desktop PCs", "desktop-pcs", "DTP", 38990m, 4100m, 4, 15, "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&h=1200&fit=crop&q=80", ["Processor", "Memory", "Storage", "Graphics"], ["Apex Mini Tower PC", "Forge X Gaming Desktop", "OfficeMate SFF Desktop", "RenderCore Workstation", "Nimbus Home Desktop", "Vector Pro Tower", "Atlas Creator Desktop", "Pulse Entry Desktop", "Chronos Gaming Cube PC", "PrimeStation Enterprise PC"]),
            new(1003, "Monitors", "monitors", "MON", 8990m, 1200m, 4, 26, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1200&h=1200&fit=crop&q=80", ["Panel", "Display", "Refresh Rate", "Ports"], ["ViewEdge 24 IPS Monitor", "ColorPro 27 QHD Monitor", "SwiftFrame 24 Gaming Monitor", "UltraWide 34 Curved Monitor", "DeskView 22 Office Monitor", "StudioVision 27 4K Monitor", "Arena 32 Curved Gaming Monitor", "EcoDisplay 24 Business Monitor", "TravelDock 16 Portable Monitor", "SignageView 27 Commercial Display"]),
            new(1004, "Keyboards", "keyboards", "KBD", 1290m, 260m, 4, 40, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&h=1200&fit=crop&q=80", ["Connection", "Switch Type", "Ports", "Type"], ["TypeCraft Wired Keyboard", "TypeCraft Wireless Combo Keyboard", "ClackPro Mechanical Keyboard", "SilentTouch Office Keyboard", "Compact 75 Wireless Keyboard", "MacroDeck Gaming Keyboard", "BudgetBoard Essential Keyboard", "Creator Dial Keyboard", "TravelKey Foldable Keyboard", "SecureDesk Smart Card Keyboard"]),
            new(1005, "Mice", "mice", "MSE", 690m, 180m, 4, 55, "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&h=1200&fit=crop&q=80", ["Connection", "Ports", "Speed", "Type"], ["ClickPoint Wired Mouse", "ClickPoint Wireless Mouse", "Precision Pro Ergonomic Mouse", "RapidFire Gaming Mouse", "SilentTap Office Mouse", "TravelMini Wireless Mouse", "Creator Vertical Mouse", "Arena RGB Gaming Mouse", "LabPack Basic Mouse", "MultiDevice Business Mouse"]),
            new(1006, "Storage", "storage", "SSD", 2490m, 850m, 4, 34, "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=1200&h=1200&fit=crop&q=80", ["Capacity", "Interface", "Speed", "Type"], ["FlashCore 500GB SATA SSD", "FlashCore 1TB SATA SSD", "NitroNV 500GB Gen4 NVMe SSD", "NitroNV 1TB Gen4 NVMe SSD", "VaultDrive 2TB Portable SSD", "ArchiveMax 4TB HDD", "ArchiveMax 8TB NAS HDD", "SwiftStick 256GB USB Drive", "ProCache 2TB Gen4 NVMe SSD", "RestoreKit 1TB External HDD"]),
            new(1007, "Memory", "memory", "RAM", 1890m, 720m, 4, 42, "https://images.unsplash.com/photo-1562976540-1502c2145186?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=1200&fit=crop&q=80", ["Capacity", "Type", "Speed", "Memory"], ["QuickRAM 8GB DDR4 3200", "QuickRAM 16GB DDR4 3200", "QuickRAM 32GB DDR4 Kit", "Velocity 16GB DDR5 5600", "Velocity 32GB DDR5 Kit", "NoteRAM 8GB Laptop Memory", "NoteRAM 16GB Laptop Memory", "ECCCore 32GB Server Memory", "Velocity RGB 32GB DDR5 Kit", "QuickRAM 64GB Pro Kit"]),
            new(1008, "Graphics Cards", "graphics-cards", "GPU", 18990m, 4500m, 5, 12, "https://images.unsplash.com/photo-1591799265444-d66432b91588?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&h=1200&fit=crop&q=80", ["Graphics", "Boost Clock", "Ports", "Memory"], ["SkyRender GTX 1650 4GB", "SkyRender RTX 3050 8GB", "VoltFrame RTX 4060 8GB", "VoltFrame RTX 4070 12GB", "Radeon Pulse RX 7600 8GB", "Radeon Pulse RX 7700 XT 12GB", "RenderMax RTX 4080 Super 16GB", "Compact RTX 4060 ITX 8GB", "StudioPro RTX A2000 12GB", "ValueRender RX 6500 XT 4GB"]),
            new(1009, "Motherboards", "motherboards", "MB", 6990m, 1800m, 4, 16, "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1562976540-1502c2145186?w=1200&h=1200&fit=crop&q=80", ["Socket", "Chipset", "Type", "Ports"], ["Prime B550M Motherboard", "Prime X670 Gaming Board", "Core H610 Office Board", "Core B760 Creator Board", "Edge ITX WiFi Board", "Forge Z790 Performance Board", "Stable CSM Business Board", "Creator Pro X670E Board", "Entry H510 Legacy Board", "Workstation W680 Board"]),
            new(1010, "Networking", "networking", "NET", 1490m, 900m, 4, 38, "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=1200&fit=crop&q=80", "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=1200&fit=crop&q=80", ["Wireless", "Ports", "Speed", "Type"], ["AirLink Wi-Fi 6 Router", "AirLink Mesh Node Pack", "SwitchBase 8-Port Gigabit Switch", "SwitchBase 24-Port Smart Switch", "SignalBoost USB Wi-Fi Adapter", "EtherPro PCIe Network Card", "FiberEdge SFP Module Pair", "SecureOffice VPN Router", "PoE 8-Port Access Switch", "Campus AX Access Point"])
        ];

    private sealed record CategorySeed(
        int Id,
        string Name,
        string Slug,
        string SkuPrefix,
        decimal BasePrice,
        decimal PriceStep,
        int GstPercentId,
        int BaseInventory,
        string PrimaryImageUrl,
        string SecondaryImageUrl,
        string[] SpecLabels,
        string[] ProductNames);
}
