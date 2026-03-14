using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Auth.Policies;
using cxserver.Modules.Common.DTOs;
using cxserver.Modules.Common.Services;

namespace cxserver.Modules.Common.Controllers;

[ApiController]
[Route("common")]
[Authorize(Policy = AuthorizationPolicies.AdminAccess)]
public sealed class CatalogMastersController(CommonMasterDataService service) : CommonControllerBase
{
    [HttpGet("contact-types")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetContactTypes(CancellationToken cancellationToken) => Ok(await service.ListContactTypesAsync(cancellationToken));
    [HttpGet("contact-types/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchContactTypes([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchContactTypesAsync(q, cancellationToken));
    [HttpPost("contact-types")]
    public async Task<IActionResult> CreateContactType(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateContactTypeAsync(request, cancellationToken));
    [HttpPut("contact-types/{id:int}")]
    public async Task<IActionResult> UpdateContactType(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateContactTypeAsync(id, request, cancellationToken));
    [HttpPost("contact-types/{id:int}/activate")]
    public async Task<IActionResult> ActivateContactType(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetContactTypeActiveAsync(id, true, cancellationToken));
    [HttpPost("contact-types/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateContactType(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetContactTypeActiveAsync(id, false, cancellationToken));

    [HttpGet("product-types")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetProductTypes(CancellationToken cancellationToken) => Ok(await service.ListProductTypesAsync(cancellationToken));
    [HttpGet("product-types/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchProductTypes([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchProductTypesAsync(q, cancellationToken));
    [HttpPost("product-types")]
    public async Task<IActionResult> CreateProductType(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateProductTypeAsync(request, cancellationToken));
    [HttpPut("product-types/{id:int}")]
    public async Task<IActionResult> UpdateProductType(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateProductTypeAsync(id, request, cancellationToken));
    [HttpPost("product-types/{id:int}/activate")]
    public async Task<IActionResult> ActivateProductType(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetProductTypeActiveAsync(id, true, cancellationToken));
    [HttpPost("product-types/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateProductType(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetProductTypeActiveAsync(id, false, cancellationToken));

    [HttpGet("product-groups")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetProductGroups(CancellationToken cancellationToken) => Ok(await service.ListProductGroupsAsync(cancellationToken));
    [HttpGet("product-groups/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchProductGroups([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchProductGroupsAsync(q, cancellationToken));
    [HttpPost("product-groups")]
    public async Task<IActionResult> CreateProductGroup(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateProductGroupAsync(request, cancellationToken));
    [HttpPut("product-groups/{id:int}")]
    public async Task<IActionResult> UpdateProductGroup(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateProductGroupAsync(id, request, cancellationToken));
    [HttpPost("product-groups/{id:int}/activate")]
    public async Task<IActionResult> ActivateProductGroup(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetProductGroupActiveAsync(id, true, cancellationToken));
    [HttpPost("product-groups/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateProductGroup(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetProductGroupActiveAsync(id, false, cancellationToken));

    [HttpGet("hsn-codes")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetHsnCodes(CancellationToken cancellationToken) => Ok(await service.ListHsnCodesAsync(cancellationToken));
    [HttpGet("hsn-codes/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchHsnCodes([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchHsnCodesAsync(q, cancellationToken));
    [HttpPost("hsn-codes")]
    public async Task<IActionResult> CreateHsnCode(HsnCodeUpsertRequest request, IValidator<HsnCodeUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateHsnCodeAsync(request, cancellationToken));
    [HttpPut("hsn-codes/{id:int}")]
    public async Task<IActionResult> UpdateHsnCode(int id, HsnCodeUpsertRequest request, IValidator<HsnCodeUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateHsnCodeAsync(id, request, cancellationToken));
    [HttpPost("hsn-codes/{id:int}/activate")]
    public async Task<IActionResult> ActivateHsnCode(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetHsnCodeActiveAsync(id, true, cancellationToken));
    [HttpPost("hsn-codes/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateHsnCode(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetHsnCodeActiveAsync(id, false, cancellationToken));

    [HttpGet("units")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetUnits(CancellationToken cancellationToken) => Ok(await service.ListUnitsAsync(cancellationToken));
    [HttpGet("units/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchUnits([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchUnitsAsync(q, cancellationToken));
    [HttpPost("units")]
    public async Task<IActionResult> CreateUnit(UnitUpsertRequest request, IValidator<UnitUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateUnitAsync(request, cancellationToken));
    [HttpPut("units/{id:int}")]
    public async Task<IActionResult> UpdateUnit(int id, UnitUpsertRequest request, IValidator<UnitUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateUnitAsync(id, request, cancellationToken));
    [HttpPost("units/{id:int}/activate")]
    public async Task<IActionResult> ActivateUnit(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetUnitActiveAsync(id, true, cancellationToken));
    [HttpPost("units/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateUnit(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetUnitActiveAsync(id, false, cancellationToken));

    [HttpGet("gst-percents")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetGstPercents(CancellationToken cancellationToken) => Ok(await service.ListGstPercentsAsync(cancellationToken));
    [HttpGet("gst-percents/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchGstPercents([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchGstPercentsAsync(q, cancellationToken));
    [HttpPost("gst-percents")]
    public async Task<IActionResult> CreateGstPercent(GstPercentUpsertRequest request, IValidator<GstPercentUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateGstPercentAsync(request, cancellationToken));
    [HttpPut("gst-percents/{id:int}")]
    public async Task<IActionResult> UpdateGstPercent(int id, GstPercentUpsertRequest request, IValidator<GstPercentUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateGstPercentAsync(id, request, cancellationToken));
    [HttpPost("gst-percents/{id:int}/activate")]
    public async Task<IActionResult> ActivateGstPercent(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetGstPercentActiveAsync(id, true, cancellationToken));
    [HttpPost("gst-percents/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateGstPercent(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetGstPercentActiveAsync(id, false, cancellationToken));

    [HttpGet("colours")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetColours(CancellationToken cancellationToken) => Ok(await service.ListColoursAsync(cancellationToken));
    [HttpGet("colours/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchColours([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchColoursAsync(q, cancellationToken));
    [HttpPost("colours")]
    public async Task<IActionResult> CreateColour(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateColourAsync(request, cancellationToken));
    [HttpPut("colours/{id:int}")]
    public async Task<IActionResult> UpdateColour(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateColourAsync(id, request, cancellationToken));
    [HttpPost("colours/{id:int}/activate")]
    public async Task<IActionResult> ActivateColour(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetColourActiveAsync(id, true, cancellationToken));
    [HttpPost("colours/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateColour(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetColourActiveAsync(id, false, cancellationToken));

    [HttpGet("sizes")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetSizes(CancellationToken cancellationToken) => Ok(await service.ListSizesAsync(cancellationToken));
    [HttpGet("sizes/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchSizes([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchSizesAsync(q, cancellationToken));
    [HttpPost("sizes")]
    public async Task<IActionResult> CreateSize(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateSizeAsync(request, cancellationToken));
    [HttpPut("sizes/{id:int}")]
    public async Task<IActionResult> UpdateSize(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateSizeAsync(id, request, cancellationToken));
    [HttpPost("sizes/{id:int}/activate")]
    public async Task<IActionResult> ActivateSize(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetSizeActiveAsync(id, true, cancellationToken));
    [HttpPost("sizes/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateSize(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetSizeActiveAsync(id, false, cancellationToken));

    private async Task<IActionResult> CreateAsync<TRequest>(TRequest request, IValidator<TRequest> validator, Func<Task<CommonMasterDataResponse>> action)
    {
        var validation = await ValidateRequestAsync(request, validator, HttpContext.RequestAborted);
        if (validation is not null) return validation;
        try { return Ok(await action()); }
        catch (InvalidOperationException exception) { return ConflictResult(exception); }
    }

    private async Task<IActionResult> UpdateAsync<TRequest>(TRequest request, IValidator<TRequest> validator, Func<Task<CommonMasterDataResponse?>> action)
    {
        var validation = await ValidateRequestAsync(request, validator, HttpContext.RequestAborted);
        if (validation is not null) return validation;
        try
        {
            var response = await action();
            return response is null ? NotFound() : Ok(response);
        }
        catch (InvalidOperationException exception) { return ConflictResult(exception); }
    }

    private static Task<IActionResult> ToggleAsync(Task<bool> action)
        => action.ContinueWith<IActionResult>(t => t.Result ? new NoContentResult() : new NotFoundResult());
}
