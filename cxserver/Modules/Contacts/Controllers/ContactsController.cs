using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Contacts.DTOs;
using cxserver.Modules.Contacts.Services;

namespace cxserver.Modules.Contacts.Controllers;

[ApiController]
[Route("contacts")]
[Authorize]
public sealed class ContactsController(ContactService contactService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ContactListItemResponse>>> GetContacts(
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
        => Ok(await contactService.GetContactsAsync(GetActorUserId(), GetActorRole(), includeInactive, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetContact(int id, CancellationToken cancellationToken)
    {
        var contact = await contactService.GetContactByIdAsync(id, GetActorUserId(), GetActorRole(), cancellationToken);
        return contact is null ? NotFound() : Ok(contact);
    }

    [HttpGet("groups")]
    public async Task<ActionResult<IReadOnlyList<ContactLookupResponse>>> GetGroups(CancellationToken cancellationToken)
        => Ok(await contactService.GetContactGroupsAsync(cancellationToken));

    [HttpPost("groups")]
    public async Task<IActionResult> CreateGroup(ContactGroupUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await contactService.CreateContactGroupAsync(request, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateContact(ContactUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await contactService.CreateContactAsync(
                request,
                GetActorUserId(),
                GetActorRole(),
                GetIpAddress(),
                cancellationToken);

            return CreatedAtAction(nameof(GetContact), new { id = created.Id }, created);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateContact(int id, ContactUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await contactService.UpdateContactAsync(
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
    public async Task<IActionResult> DeleteContact(int id, CancellationToken cancellationToken)
    {
        var deleted = await contactService.DeleteContactAsync(id, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
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
