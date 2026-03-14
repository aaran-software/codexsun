using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace cxserver.Modules.Common.Controllers;

public abstract class CommonControllerBase : ControllerBase
{
    protected async Task<IActionResult?> ValidateRequestAsync<TRequest>(
        TRequest request,
        IValidator<TRequest> validator,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        return validation.IsValid
            ? null
            : BadRequest(new ValidationProblemDetails(validation.ToDictionary()));
    }

    protected static IActionResult ConflictResult(Exception exception)
        => new ConflictObjectResult(new { message = exception.Message });
}
