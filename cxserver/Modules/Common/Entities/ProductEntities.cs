namespace cxserver.Modules.Common.Entities;

public sealed class ContactType : NamedCommonMasterEntity;

public sealed class ProductType : NamedCommonMasterEntity;

public sealed class ProductGroup : NamedCommonMasterEntity;

public sealed class HsnCode : CommonMasterEntity
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public sealed class Unit : NamedCommonMasterEntity
{
    public string ShortName { get; set; } = string.Empty;
}

public sealed class GstPercent : CommonMasterEntity
{
    public decimal Percentage { get; set; }
}

public sealed class Colour : NamedCommonMasterEntity;

public sealed class Size : NamedCommonMasterEntity;

public sealed class OrderType : NamedCommonMasterEntity;

public sealed class Style : NamedCommonMasterEntity;

public sealed class Brand : NamedCommonMasterEntity;
