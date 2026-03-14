using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Products.DTOs;
using cxserver.Modules.Products.Services;

namespace cxserver.Modules.Products.Controllers;

[ApiController]
[Route("products")]
[Authorize]
public sealed class ProductsController(ProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductListItemResponse>>> GetProducts(
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
        => Ok(await productService.GetProductsAsync(GetActorUserId(), GetActorRole(), includeInactive, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProduct(int id, CancellationToken cancellationToken)
    {
        var product = await productService.GetProductByIdAsync(id, GetActorUserId(), GetActorRole(), cancellationToken);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("vendor/{vendorId:guid}")]
    public async Task<ActionResult<IReadOnlyList<ProductListItemResponse>>> GetProductsByVendor(
        Guid vendorId,
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
        => Ok(await productService.GetProductsByVendorAsync(vendorId, GetActorUserId(), GetActorRole(), includeInactive, cancellationToken));

    [HttpGet("category/{categoryId:int}")]
    public async Task<ActionResult<IReadOnlyList<ProductListItemResponse>>> GetProductsByCategory(
        int categoryId,
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
        => Ok(await productService.GetProductsByCategoryAsync(categoryId, GetActorUserId(), GetActorRole(), includeInactive, cancellationToken));

    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<ProductCategoryResponse>>> GetCategories(
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
        => Ok(await productService.GetCategoriesAsync(includeInactive, cancellationToken));

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory(ProductCategoryCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await productService.CreateCategoryAsync(request.Name, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct(ProductUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await productService.CreateProductAsync(
                request,
                GetActorUserId(),
                GetActorRole(),
                GetIpAddress(),
                cancellationToken);

            return CreatedAtAction(nameof(GetProduct), new { id = created.Id }, created);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, ProductUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await productService.UpdateProductAsync(
                id,
                request,
                GetActorUserId(),
                GetActorRole(),
                GetIpAddress(),
                cancellationToken);

            return updated is null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken)
    {
        var deleted = await productService.DeleteProductAsync(id, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private Guid GetActorUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var parsedUserId)
            ? parsedUserId
            : throw new UnauthorizedAccessException("User id claim is missing.");
    }

    private string GetActorRole()
        => User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    private string GetIpAddress()
    {
        if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor) &&
            !string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.ToString().Split(',')[0].Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
