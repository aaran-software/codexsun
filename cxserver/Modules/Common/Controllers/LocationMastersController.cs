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
public sealed class LocationMastersController(CommonMasterDataService service) : CommonControllerBase
{
    [HttpGet("countries")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetCountries(CancellationToken cancellationToken)
        => Ok(await service.ListCountriesAsync(cancellationToken));

    [HttpGet("countries/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchCountries([FromQuery] string? q, CancellationToken cancellationToken)
        => Ok(await service.SearchCountriesAsync(q, cancellationToken));

    [HttpPost("countries")]
    public async Task<IActionResult> CreateCountry(NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken)
    {
        var validation = await ValidateRequestAsync(request, validator, cancellationToken);
        if (validation is not null) return validation;
        try { return Ok(await service.CreateCountryAsync(request, cancellationToken)); }
        catch (InvalidOperationException exception) { return ConflictResult(exception); }
    }

    [HttpPut("countries/{id:int}")]
    public async Task<IActionResult> UpdateCountry(int id, NameMasterUpsertRequest request, IValidator<NameMasterUpsertRequest> validator, CancellationToken cancellationToken)
    {
        var validation = await ValidateRequestAsync(request, validator, cancellationToken);
        if (validation is not null) return validation;
        try
        {
            var response = await service.UpdateCountryAsync(id, request, cancellationToken);
            return response is null ? NotFound() : Ok(response);
        }
        catch (InvalidOperationException exception) { return ConflictResult(exception); }
    }

    [HttpPost("countries/{id:int}/activate")]
    public async Task<IActionResult> ActivateCountry(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetCountryActiveAsync(id, true, cancellationToken));
    [HttpPost("countries/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateCountry(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetCountryActiveAsync(id, false, cancellationToken));

    [HttpGet("states")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetStates([FromQuery] int? countryId, CancellationToken cancellationToken)
        => Ok(await service.ListStatesAsync(countryId, cancellationToken));

    [HttpGet("states/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchStates([FromQuery] string? q, [FromQuery] int? countryId, CancellationToken cancellationToken)
        => Ok(await service.SearchStatesAsync(q, countryId, cancellationToken));

    [HttpPost("states")]
    public async Task<IActionResult> CreateState(StateUpsertRequest request, IValidator<StateUpsertRequest> validator, CancellationToken cancellationToken)
        => await UpsertAsync(request, validator, () => service.CreateStateAsync(request, cancellationToken));

    [HttpPut("states/{id:int}")]
    public async Task<IActionResult> UpdateState(int id, StateUpsertRequest request, IValidator<StateUpsertRequest> validator, CancellationToken cancellationToken)
        => await UpdateAsync(request, validator, () => service.UpdateStateAsync(id, request, cancellationToken));

    [HttpPost("states/{id:int}/activate")]
    public async Task<IActionResult> ActivateState(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetStateActiveAsync(id, true, cancellationToken));
    [HttpPost("states/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateState(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetStateActiveAsync(id, false, cancellationToken));

    [HttpGet("districts")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetDistricts([FromQuery] int? stateId, CancellationToken cancellationToken)
        => Ok(await service.ListDistrictsAsync(stateId, cancellationToken));

    [HttpGet("districts/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchDistricts([FromQuery] string? q, [FromQuery] int? stateId, CancellationToken cancellationToken)
        => Ok(await service.SearchDistrictsAsync(q, stateId, cancellationToken));

    [HttpPost("districts")]
    public async Task<IActionResult> CreateDistrict(DistrictUpsertRequest request, IValidator<DistrictUpsertRequest> validator, CancellationToken cancellationToken)
        => await UpsertAsync(request, validator, () => service.CreateDistrictAsync(request, cancellationToken));

    [HttpPut("districts/{id:int}")]
    public async Task<IActionResult> UpdateDistrict(int id, DistrictUpsertRequest request, IValidator<DistrictUpsertRequest> validator, CancellationToken cancellationToken)
        => await UpdateAsync(request, validator, () => service.UpdateDistrictAsync(id, request, cancellationToken));

    [HttpPost("districts/{id:int}/activate")]
    public async Task<IActionResult> ActivateDistrict(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetDistrictActiveAsync(id, true, cancellationToken));
    [HttpPost("districts/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateDistrict(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetDistrictActiveAsync(id, false, cancellationToken));

    [HttpGet("cities")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetCities([FromQuery] int? districtId, CancellationToken cancellationToken)
        => Ok(await service.ListCitiesAsync(districtId, cancellationToken));

    [HttpGet("cities/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchCities([FromQuery] string? q, [FromQuery] int? districtId, CancellationToken cancellationToken)
        => Ok(await service.SearchCitiesAsync(q, districtId, cancellationToken));

    [HttpPost("cities")]
    public async Task<IActionResult> CreateCity(CityUpsertRequest request, IValidator<CityUpsertRequest> validator, CancellationToken cancellationToken)
        => await UpsertAsync(request, validator, () => service.CreateCityAsync(request, cancellationToken));

    [HttpPut("cities/{id:int}")]
    public async Task<IActionResult> UpdateCity(int id, CityUpsertRequest request, IValidator<CityUpsertRequest> validator, CancellationToken cancellationToken)
        => await UpdateAsync(request, validator, () => service.UpdateCityAsync(id, request, cancellationToken));

    [HttpPost("cities/{id:int}/activate")]
    public async Task<IActionResult> ActivateCity(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetCityActiveAsync(id, true, cancellationToken));
    [HttpPost("cities/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateCity(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetCityActiveAsync(id, false, cancellationToken));

    [HttpGet("pincodes")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetPincodes([FromQuery] int? cityId, CancellationToken cancellationToken)
        => Ok(await service.ListPincodesAsync(cityId, cancellationToken));

    [HttpGet("pincodes/search")]
    public async Task<ActionResult<IReadOnlyList<CommonSearchItemResponse>>> SearchPincodes([FromQuery] string? q, [FromQuery] int? cityId, CancellationToken cancellationToken)
        => Ok(await service.SearchPincodesAsync(q, cityId, cancellationToken));

    [HttpPost("pincodes")]
    public async Task<IActionResult> CreatePincode(PincodeUpsertRequest request, IValidator<PincodeUpsertRequest> validator, CancellationToken cancellationToken)
        => await UpsertAsync(request, validator, () => service.CreatePincodeAsync(request, cancellationToken));

    [HttpPut("pincodes/{id:int}")]
    public async Task<IActionResult> UpdatePincode(int id, PincodeUpsertRequest request, IValidator<PincodeUpsertRequest> validator, CancellationToken cancellationToken)
        => await UpdateAsync(request, validator, () => service.UpdatePincodeAsync(id, request, cancellationToken));

    [HttpPost("pincodes/{id:int}/activate")]
    public async Task<IActionResult> ActivatePincode(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetPincodeActiveAsync(id, true, cancellationToken));
    [HttpPost("pincodes/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivatePincode(int id, CancellationToken cancellationToken) => await ToggleAsync(service.SetPincodeActiveAsync(id, false, cancellationToken));

    private async Task<IActionResult> UpsertAsync<TRequest>(TRequest request, IValidator<TRequest> validator, Func<Task<CommonMasterDataResponse>> action)
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
