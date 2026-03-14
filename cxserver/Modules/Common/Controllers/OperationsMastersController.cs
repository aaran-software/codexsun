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
public sealed class OperationsMastersController(CommonMasterDataService service) : CommonControllerBase
{
    [HttpGet("transports")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetTransports(CancellationToken cancellationToken) => Ok(await service.ListTransportsAsync(cancellationToken));
    [HttpGet("transports/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchTransports([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchTransportsAsync(q, cancellationToken));
    [HttpPost("transports")]
    public async Task<IActionResult> CreateTransport(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateTransportAsync(request, cancellationToken));
    [HttpPut("transports/{id:int}")]
    public async Task<IActionResult> UpdateTransport(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateTransportAsync(id, request, cancellationToken));
    [HttpPost("transports/{id:int}/activate")]
    public async Task<IActionResult> ActivateTransport(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetTransportActiveAsync(id, true, cancellationToken));
    [HttpPost("transports/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateTransport(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetTransportActiveAsync(id, false, cancellationToken));

    [HttpGet("destinations")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetDestinations([FromQuery] int? countryId, [FromQuery] int? cityId, CancellationToken cancellationToken) => Ok(await service.ListDestinationsAsync(countryId, cityId, cancellationToken));
    [HttpGet("destinations/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchDestinations([FromQuery] string? q, [FromQuery] int? countryId, [FromQuery] int? cityId, CancellationToken cancellationToken) => Ok(await service.SearchDestinationsAsync(q, countryId, cityId, cancellationToken));
    [HttpPost("destinations")]
    public async Task<IActionResult> CreateDestination(DestinationUpsertRequest request, IValidator<DestinationUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateDestinationAsync(request, cancellationToken));
    [HttpPut("destinations/{id:int}")]
    public async Task<IActionResult> UpdateDestination(int id, DestinationUpsertRequest request, IValidator<DestinationUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateDestinationAsync(id, request, cancellationToken));
    [HttpPost("destinations/{id:int}/activate")]
    public async Task<IActionResult> ActivateDestination(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetDestinationActiveAsync(id, true, cancellationToken));
    [HttpPost("destinations/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateDestination(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetDestinationActiveAsync(id, false, cancellationToken));

    [HttpGet("currencies")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetCurrencies(CancellationToken cancellationToken) => Ok(await service.ListCurrenciesAsync(cancellationToken));
    [HttpGet("currencies/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchCurrencies([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchCurrenciesAsync(q, cancellationToken));
    [HttpPost("currencies")]
    public async Task<IActionResult> CreateCurrency(CurrencyUpsertRequest request, IValidator<CurrencyUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateCurrencyAsync(request, cancellationToken));
    [HttpPut("currencies/{id:int}")]
    public async Task<IActionResult> UpdateCurrency(int id, CurrencyUpsertRequest request, IValidator<CurrencyUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateCurrencyAsync(id, request, cancellationToken));
    [HttpPost("currencies/{id:int}/activate")]
    public async Task<IActionResult> ActivateCurrency(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetCurrencyActiveAsync(id, true, cancellationToken));
    [HttpPost("currencies/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateCurrency(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetCurrencyActiveAsync(id, false, cancellationToken));

    [HttpGet("warehouses")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetWarehouses(CancellationToken cancellationToken) => Ok(await service.ListWarehousesAsync(cancellationToken));
    [HttpGet("warehouses/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchWarehouses([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchWarehousesAsync(q, cancellationToken));
    [HttpPost("warehouses")]
    public async Task<IActionResult> CreateWarehouse(WarehouseUpsertRequest request, IValidator<WarehouseUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreateWarehouseAsync(request, cancellationToken));
    [HttpPut("warehouses/{id:int}")]
    public async Task<IActionResult> UpdateWarehouse(int id, WarehouseUpsertRequest request, IValidator<WarehouseUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdateWarehouseAsync(id, request, cancellationToken));
    [HttpPost("warehouses/{id:int}/activate")]
    public async Task<IActionResult> ActivateWarehouse(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetWarehouseActiveAsync(id, true, cancellationToken));
    [HttpPost("warehouses/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateWarehouse(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetWarehouseActiveAsync(id, false, cancellationToken));

    [HttpGet("payment-terms")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetPaymentTerms(CancellationToken cancellationToken) => Ok(await service.ListPaymentTermsAsync(cancellationToken));
    [HttpGet("payment-terms/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchPaymentTerms([FromQuery] string? q, CancellationToken cancellationToken) => Ok(await service.SearchPaymentTermsAsync(q, cancellationToken));
    [HttpPost("payment-terms")]
    public async Task<IActionResult> CreatePaymentTerm(PaymentTermUpsertRequest request, IValidator<PaymentTermUpsertRequest> validator, CancellationToken cancellationToken) => await CreateAsync(request, validator, () => service.CreatePaymentTermAsync(request, cancellationToken));
    [HttpPut("payment-terms/{id:int}")]
    public async Task<IActionResult> UpdatePaymentTerm(int id, PaymentTermUpsertRequest request, IValidator<PaymentTermUpsertRequest> validator, CancellationToken cancellationToken) => await UpdateAsync(request, validator, () => service.UpdatePaymentTermAsync(id, request, cancellationToken));
    [HttpPost("payment-terms/{id:int}/activate")]
    public async Task<IActionResult> ActivatePaymentTerm(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetPaymentTermActiveAsync(id, true, cancellationToken));
    [HttpPost("payment-terms/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivatePaymentTerm(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetPaymentTermActiveAsync(id, false, cancellationToken));

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
