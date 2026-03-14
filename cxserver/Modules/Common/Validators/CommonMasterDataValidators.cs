using FluentValidation;
using cxserver.Modules.Common.DTOs;

namespace cxserver.Modules.Common.Validators;

public sealed class NameMasterUpsertRequestValidator : AbstractValidator<NameMasterUpsertRequest>
{
    public NameMasterUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
    }
}

public sealed class StateUpsertRequestValidator : AbstractValidator<StateUpsertRequest>
{
    public StateUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.StateCode).NotEmpty().MaximumLength(16);
        RuleFor(x => x.CountryId).GreaterThan(0);
    }
}

public sealed class DistrictUpsertRequestValidator : AbstractValidator<DistrictUpsertRequest>
{
    public DistrictUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.StateId).GreaterThan(0);
    }
}

public sealed class CityUpsertRequestValidator : AbstractValidator<CityUpsertRequest>
{
    public CityUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.DistrictId).GreaterThan(0);
    }
}

public sealed class PincodeUpsertRequestValidator : AbstractValidator<PincodeUpsertRequest>
{
    public PincodeUpsertRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(16);
        RuleFor(x => x.CityId).GreaterThan(0);
    }
}

public sealed class HsnCodeUpsertRequestValidator : AbstractValidator<HsnCodeUpsertRequest>
{
    public HsnCodeUpsertRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(256);
    }
}

public sealed class UnitUpsertRequestValidator : AbstractValidator<UnitUpsertRequest>
{
    public UnitUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.ShortName).NotEmpty().MaximumLength(32);
    }
}

public sealed class GstPercentUpsertRequestValidator : AbstractValidator<GstPercentUpsertRequest>
{
    public GstPercentUpsertRequestValidator()
    {
        RuleFor(x => x.Percentage).InclusiveBetween(0m, 100m);
    }
}

public sealed class DestinationUpsertRequestValidator : AbstractValidator<DestinationUpsertRequest>
{
    public DestinationUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x)
            .Must(x => x.CountryId.HasValue || x.CityId.HasValue)
            .WithMessage("Either CountryId or CityId must be provided.");
    }
}

public sealed class CurrencyUpsertRequestValidator : AbstractValidator<CurrencyUpsertRequest>
{
    public CurrencyUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(16);
        RuleFor(x => x.Symbol).NotEmpty().MaximumLength(16);
    }
}

public sealed class WarehouseUpsertRequestValidator : AbstractValidator<WarehouseUpsertRequest>
{
    public WarehouseUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Location).NotEmpty().MaximumLength(256);
    }
}

public sealed class PaymentTermUpsertRequestValidator : AbstractValidator<PaymentTermUpsertRequest>
{
    public PaymentTermUpsertRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Days).InclusiveBetween(0, 3650);
    }
}
