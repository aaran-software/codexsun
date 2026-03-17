using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Products.DTOs;
using cxserver.Modules.Products.Services;

namespace cxserver.Modules.Products.Controllers;

[ApiController]
[Route("storefront")]
[AllowAnonymous]
public sealed class StorefrontCatalogController(ProductService productService) : ControllerBase
{
    [HttpGet("products")]
    public async Task<ActionResult<IReadOnlyList<ProductListItemResponse>>> GetProducts(
        [FromQuery] string? q,
        [FromQuery] string? categorySlug,
        [FromQuery] string? vendorSlug,
        [FromQuery] int? limit,
        CancellationToken cancellationToken = default)
        => Ok(await productService.GetStorefrontProductsAsync(q, categorySlug, vendorSlug, limit, cancellationToken));

    [HttpGet("products/{slug}")]
    public async Task<IActionResult> GetProduct(string slug, CancellationToken cancellationToken)
    {
        var product = await productService.GetStorefrontProductBySlugAsync(slug, cancellationToken);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<ProductCategoryResponse>>> GetCategories(CancellationToken cancellationToken = default)
        => Ok(await productService.GetStorefrontCategoriesAsync(cancellationToken));
}
