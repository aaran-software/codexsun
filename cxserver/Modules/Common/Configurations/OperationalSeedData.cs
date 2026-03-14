using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Configurations;

internal static class OperationalSeedData
{
    internal static readonly Transport[] Transports =
    [
        new Transport { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Transport { Id = 2, Name = "Road Transport", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Transport { Id = 3, Name = "Air Cargo", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Transport { Id = 4, Name = "Courier", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Transport { Id = 5, Name = "Self Pickup", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly Destination[] Destinations =
    [
        new Destination { Id = 1, Name = "-", CountryId = 1, CityId = 1, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Destination { Id = 2, Name = "Chennai Hub", CountryId = 2, CityId = 2, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Destination { Id = 3, Name = "Coimbatore Hub", CountryId = 2, CityId = 3, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Destination { Id = 4, Name = "Bengaluru Hub", CountryId = 2, CityId = 19, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Destination { Id = 5, Name = "Mumbai Hub", CountryId = 2, CityId = 22, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Destination { Id = 6, Name = "Delhi Hub", CountryId = 2, CityId = 23, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly Currency[] Currencies =
    [
        new Currency { Id = 1, Name = "-", Code = "-", Symbol = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Currency { Id = 2, Name = "Indian Rupee", Code = "INR", Symbol = "Rs", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Currency { Id = 3, Name = "United States Dollar", Code = "USD", Symbol = "$", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly Warehouse[] Warehouses =
    [
        new Warehouse { Id = 1, Name = "-", Location = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Warehouse { Id = 2, Name = "Chennai Central Warehouse", Location = "Chennai", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Warehouse { Id = 3, Name = "Coimbatore Dispatch Center", Location = "Coimbatore", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new Warehouse { Id = 4, Name = "Bengaluru Fulfilment Center", Location = "Bengaluru", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];

    internal static readonly PaymentTerm[] PaymentTerms =
    [
        new PaymentTerm { Id = 1, Name = "-", Days = 0, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new PaymentTerm { Id = 2, Name = "Advance", Days = 0, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new PaymentTerm { Id = 3, Name = "Net 15", Days = 15, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new PaymentTerm { Id = 4, Name = "Net 30", Days = 30, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
        new PaymentTerm { Id = 5, Name = "Net 45", Days = 45, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc }
    ];
}
