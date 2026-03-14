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
public sealed class OrderMastersController(CommonMasterDataService service) : CommonControllerBase
{
    [HttpGet("order-types")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetOrderTypes(CancellationToken cancellationToken) => Ok(await service.ListOrderTypesAsync(cancellationToken));
    [HttpGet("order-types/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchOrderTypes([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchOrderTypesAsync(q, cancellationToken));
    [HttpPost("order-types")]
    public async Task<IActionResult> CreateOrderType(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateOrderTypeAsync(request, cancellationToken));
    [HttpPut("order-types/{id:int}")]
    public async Task<IActionResult> UpdateOrderType(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateOrderTypeAsync(id, request, cancellationToken));
    [HttpPost("order-types/{id:int}/activate")]
    public async Task<IActionResult> ActivateOrderType(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetOrderTypeActiveAsync(id, true, cancellationToken));
    [HttpPost("order-types/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateOrderType(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetOrderTypeActiveAsync(id, false, cancellationToken));

    [HttpGet("styles")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetStyles(CancellationToken cancellationToken) => Ok(await service.ListStylesAsync(cancellationToken));
    [HttpGet("styles/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchStyles([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchStylesAsync(q, cancellationToken));
    [HttpPost("styles")]
    public async Task<IActionResult> CreateStyle(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateStyleAsync(request, cancellationToken));
    [HttpPut("styles/{id:int}")]
    public async Task<IActionResult> UpdateStyle(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateStyleAsync(id, request, cancellationToken));
    [HttpPost("styles/{id:int}/activate")]
    public async Task<IActionResult> ActivateStyle(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetStyleActiveAsync(id, true, cancellationToken));
    [HttpPost("styles/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateStyle(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetStyleActiveAsync(id, false, cancellationToken));

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetBrands(CancellationToken cancellationToken) => Ok(await service.ListBrandsAsync(cancellationToken));
    [HttpGet("brands/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchBrands([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchBrandsAsync(q, cancellationToken));
    [HttpPost("brands")]
    public async Task<IActionResult> CreateBrand(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateBrandAsync(request, cancellationToken));
    [HttpPut("brands/{id:int}")]
    public async Task<IActionResult> UpdateBrand(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateBrandAsync(id, request, cancellationToken));
    [HttpPost("brands/{id:int}/activate")]
    public async Task<IActionResult> ActivateBrand(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetBrandActiveAsync(id, true, cancellationToken));
    [HttpPost("brands/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateBrand(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetBrandActiveAsync(id, false, cancellationToken));

    private async Task<IActionResult> CreateAsync(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, Func<Task<CommonMasterDataResponse>> action)
    {
        var validation = await ValidateRequestAsync(request, validator, HttpContext.RequestAborted);
        if (validation is not null) return validation;
        try { return Ok(await action()); }
        catch (InvalidOperationException exception) { return ConflictResult(exception); }
    }

    private async Task<IActionResult> UpdateAsync(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, Func<Task<CommonMasterDataResponse?>> action)
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
