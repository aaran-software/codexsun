using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Promotions.DTOs;
using cxserver.Modules.Promotions.Services;

namespace cxserver.Modules.Promotions.Controllers;

[ApiController]
[Route("promotions")]
[Authorize]
public sealed class PromotionsController(PromotionService promotionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PromotionResponse>>> GetPromotions(CancellationToken cancellationToken)
        => Ok(await promotionService.GetPromotionsAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> CreatePromotion(PromotionUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await promotionService.CreatePromotionAsync(request, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }
}
