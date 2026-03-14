using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Contacts.DTOs;
using cxserver.Modules.Contacts.Entities;

namespace cxserver.Modules.Contacts.Services;

public sealed class ContactService(CodexsunDbContext dbContext)
{
    public async Task<IReadOnlyList<ContactLookupResponse>> GetContactGroupsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.ContactGroups
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new ContactLookupResponse
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ContactLookupResponse> CreateContactGroupAsync(ContactGroupUpsertRequest request, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("Contact group name is required.");
        }

        var exists = await dbContext.ContactGroups.AnyAsync(x => x.Name == name, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A contact group with the same name already exists.");
        }

        var group = new ContactGroup
        {
            Name = name,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        dbContext.ContactGroups.Add(group);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ContactLookupResponse
        {
            Id = group.Id,
            Name = group.Name
        };
    }

    public async Task<IReadOnlyList<ContactListItemResponse>> GetContactsAsync(Guid actorUserId, string role, bool includeInactive, CancellationToken cancellationToken)
    {
        return await BuildVisibleContactsQuery(actorUserId, role, includeInactive)
            .OrderBy(x => x.DisplayName)
            .Select(MapListItem())
            .ToListAsync(cancellationToken);
    }

    public async Task<ContactDetailResponse?> GetContactByIdAsync(int contactId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        return await BuildVisibleContactsQuery(actorUserId, role, includeInactive: true)
            .Where(x => x.Id == contactId)
            .Select(x => new ContactDetailResponse
            {
                Id = x.Id,
                OwnerUserId = x.OwnerUserId,
                VendorUserId = x.VendorUserId,
                VendorName = x.VendorUser != null ? x.VendorUser.Username : string.Empty,
                FirstName = x.FirstName,
                LastName = x.LastName,
                DisplayName = x.DisplayName,
                ContactTypeId = x.ContactTypeId,
                ContactTypeName = x.ContactType != null ? x.ContactType.Name : string.Empty,
                GroupId = x.GroupId,
                GroupName = x.Group != null ? x.Group.Name : string.Empty,
                TaxNumber = x.TaxNumber,
                IsBusiness = x.IsBusiness,
                IsCustomer = x.IsCustomer,
                IsSupplier = x.IsSupplier,
                IsVendorContact = x.IsVendorContact,
                IsActive = x.IsActive,
                PrimaryEmail = x.Emails.Where(email => email.IsPrimary).Select(email => email.Email).FirstOrDefault()
                    ?? x.Emails.Select(email => email.Email).FirstOrDefault()
                    ?? string.Empty,
                PrimaryPhone = x.Phones.Where(phone => phone.IsPrimary).Select(phone => phone.PhoneNumber).FirstOrDefault()
                    ?? x.Phones.Select(phone => phone.PhoneNumber).FirstOrDefault()
                    ?? string.Empty,
                PrimaryCity = x.Addresses.Where(address => address.IsPrimary).Select(address => address.City != null ? address.City.Name : string.Empty).FirstOrDefault()
                    ?? string.Empty,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                Addresses = x.Addresses
                    .OrderByDescending(address => address.IsPrimary)
                    .ThenBy(address => address.Id)
                    .Select(address => new ContactAddressResponse
                    {
                        Id = address.Id,
                        AddressType = address.AddressType,
                        CountryId = address.CountryId,
                        CountryName = address.Country != null ? address.Country.Name : null,
                        StateId = address.StateId,
                        StateName = address.State != null ? address.State.Name : null,
                        DistrictId = address.DistrictId,
                        DistrictName = address.District != null ? address.District.Name : null,
                        CityId = address.CityId,
                        CityName = address.City != null ? address.City.Name : null,
                        AddressLine1 = address.AddressLine1,
                        AddressLine2 = address.AddressLine2,
                        PostalCode = address.PostalCode,
                        IsPrimary = address.IsPrimary
                    })
                    .ToList(),
                Emails = x.Emails
                    .OrderByDescending(email => email.IsPrimary)
                    .ThenBy(email => email.Id)
                    .Select(email => new ContactEmailResponse
                    {
                        Id = email.Id,
                        Label = email.Label,
                        Email = email.Email,
                        IsPrimary = email.IsPrimary
                    })
                    .ToList(),
                Phones = x.Phones
                    .OrderByDescending(phone => phone.IsPrimary)
                    .ThenBy(phone => phone.Id)
                    .Select(phone => new ContactPhoneResponse
                    {
                        Id = phone.Id,
                        Label = phone.Label,
                        PhoneNumber = phone.PhoneNumber,
                        IsPrimary = phone.IsPrimary
                    })
                    .ToList(),
                Notes = x.Notes
                    .OrderBy(note => note.Id)
                    .Select(note => new ContactNoteResponse
                    {
                        Id = note.Id,
                        Note = note.Note
                    })
                    .ToList()
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<ContactDetailResponse> CreateContactAsync(ContactUpsertRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        await EnsureContactReferencesAsync(request, cancellationToken);
        await EnsureVendorAccessAsync(request.VendorUserId, actorUserId, role, cancellationToken);
        ValidateRequest(request);

        var now = DateTimeOffset.UtcNow;
        var contact = new Contact
        {
            OwnerUserId = actorUserId,
            VendorUserId = ResolveVendorUserId(request.VendorUserId, actorUserId, role),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            DisplayName = BuildDisplayName(request),
            ContactTypeId = request.ContactTypeId,
            GroupId = request.GroupId,
            TaxNumber = request.TaxNumber.Trim(),
            IsBusiness = request.IsBusiness,
            IsCustomer = request.IsCustomer,
            IsSupplier = request.IsSupplier,
            IsVendorContact = request.IsVendorContact,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        ApplyContactCollections(contact, request, now);

        dbContext.Contacts.Add(contact);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Contact.Create", nameof(Contact), contact.Id.ToString(), ipAddress, cancellationToken);
        return (await GetContactByIdAsync(contact.Id, actorUserId, role, cancellationToken))!;
    }

    public async Task<ContactDetailResponse?> UpdateContactAsync(int contactId, ContactUpsertRequest request, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        var contact = await dbContext.Contacts
            .Include(x => x.Addresses)
            .Include(x => x.Emails)
            .Include(x => x.Phones)
            .Include(x => x.Notes)
            .SingleOrDefaultAsync(x => x.Id == contactId, cancellationToken);

        if (contact is null || !CanAccess(contact, actorUserId, role))
        {
            return null;
        }

        await EnsureContactReferencesAsync(request, cancellationToken);
        await EnsureVendorAccessAsync(request.VendorUserId, actorUserId, role, cancellationToken);
        ValidateRequest(request);

        var now = DateTimeOffset.UtcNow;
        contact.VendorUserId = ResolveVendorUserId(request.VendorUserId, actorUserId, role);
        contact.FirstName = request.FirstName.Trim();
        contact.LastName = request.LastName.Trim();
        contact.DisplayName = BuildDisplayName(request);
        contact.ContactTypeId = request.ContactTypeId;
        contact.GroupId = request.GroupId;
        contact.TaxNumber = request.TaxNumber.Trim();
        contact.IsBusiness = request.IsBusiness;
        contact.IsCustomer = request.IsCustomer;
        contact.IsSupplier = request.IsSupplier;
        contact.IsVendorContact = request.IsVendorContact;
        contact.IsActive = request.IsActive;
        contact.UpdatedAt = now;

        dbContext.ContactAddresses.RemoveRange(contact.Addresses);
        dbContext.ContactEmails.RemoveRange(contact.Emails);
        dbContext.ContactPhones.RemoveRange(contact.Phones);
        dbContext.ContactNotes.RemoveRange(contact.Notes);

        ApplyContactCollections(contact, request, now);

        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Contact.Update", nameof(Contact), contact.Id.ToString(), ipAddress, cancellationToken);
        return await GetContactByIdAsync(contact.Id, actorUserId, role, cancellationToken);
    }

    public async Task<bool> DeleteContactAsync(int contactId, Guid actorUserId, string role, string ipAddress, CancellationToken cancellationToken)
    {
        var contact = await dbContext.Contacts.SingleOrDefaultAsync(x => x.Id == contactId, cancellationToken);
        if (contact is null || !CanAccess(contact, actorUserId, role))
        {
            return false;
        }

        contact.IsActive = false;
        contact.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Contact.Delete", nameof(Contact), contact.Id.ToString(), ipAddress, cancellationToken);
        return true;
    }

    private IQueryable<Contact> BuildVisibleContactsQuery(Guid actorUserId, string role, bool includeInactive)
    {
        var query = dbContext.Contacts
            .AsNoTracking()
            .Include(x => x.ContactType)
            .Include(x => x.Group)
            .Include(x => x.VendorUser)
            .Include(x => x.Emails)
            .Include(x => x.Phones)
            .Include(x => x.Addresses).ThenInclude(address => address.City)
            .Include(x => x.Addresses).ThenInclude(address => address.State)
            .Include(x => x.Addresses).ThenInclude(address => address.District)
            .Include(x => x.Addresses).ThenInclude(address => address.Country)
            .Include(x => x.Notes)
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        return role == "Admin"
            ? query
            : query.Where(x => x.OwnerUserId == actorUserId || x.VendorUserId == actorUserId);
    }

    private static Expression<Func<Contact, ContactListItemResponse>> MapListItem()
    {
        return x => new ContactListItemResponse
        {
            Id = x.Id,
            OwnerUserId = x.OwnerUserId,
            VendorUserId = x.VendorUserId,
            VendorName = x.VendorUser != null ? x.VendorUser.Username : string.Empty,
            FirstName = x.FirstName,
            LastName = x.LastName,
            DisplayName = x.DisplayName,
            ContactTypeId = x.ContactTypeId,
            ContactTypeName = x.ContactType != null ? x.ContactType.Name : string.Empty,
            GroupId = x.GroupId,
            GroupName = x.Group != null ? x.Group.Name : string.Empty,
            TaxNumber = x.TaxNumber,
            IsBusiness = x.IsBusiness,
            IsCustomer = x.IsCustomer,
            IsSupplier = x.IsSupplier,
            IsVendorContact = x.IsVendorContact,
            IsActive = x.IsActive,
            PrimaryEmail = x.Emails.Where(email => email.IsPrimary).Select(email => email.Email).FirstOrDefault()
                ?? x.Emails.Select(email => email.Email).FirstOrDefault()
                ?? string.Empty,
            PrimaryPhone = x.Phones.Where(phone => phone.IsPrimary).Select(phone => phone.PhoneNumber).FirstOrDefault()
                ?? x.Phones.Select(phone => phone.PhoneNumber).FirstOrDefault()
                ?? string.Empty,
            PrimaryCity = x.Addresses.Where(address => address.IsPrimary).Select(address => address.City != null ? address.City.Name : string.Empty).FirstOrDefault()
                ?? string.Empty,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };
    }

    private async Task EnsureContactReferencesAsync(ContactUpsertRequest request, CancellationToken cancellationToken)
    {
        if (request.ContactTypeId.HasValue && !await dbContext.ContactTypes.AnyAsync(x => x.Id == request.ContactTypeId.Value, cancellationToken))
        {
            throw new InvalidOperationException("Contact type not found.");
        }

        if (request.GroupId.HasValue && !await dbContext.ContactGroups.AnyAsync(x => x.Id == request.GroupId.Value, cancellationToken))
        {
            throw new InvalidOperationException("Contact group not found.");
        }
    }

    private async Task EnsureVendorAccessAsync(Guid? vendorUserId, Guid actorUserId, string role, CancellationToken cancellationToken)
    {
        if (!vendorUserId.HasValue)
        {
            return;
        }

        if (role != "Admin" && vendorUserId.Value != actorUserId)
        {
            throw new InvalidOperationException("Vendors can only assign their own vendor scope.");
        }

        var exists = await dbContext.Users.AnyAsync(
            x => x.Id == vendorUserId.Value && !x.IsDeleted && x.Role.Name == "Vendor",
            cancellationToken);

        if (!exists)
        {
            throw new InvalidOperationException("Selected vendor user was not found.");
        }
    }

    private static Guid? ResolveVendorUserId(Guid? vendorUserId, Guid actorUserId, string role)
        => role == "Vendor" ? actorUserId : vendorUserId;

    private static string BuildDisplayName(ContactUpsertRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.DisplayName))
        {
            return request.DisplayName.Trim();
        }

        var fullName = $"{request.FirstName} {request.LastName}".Trim();
        return string.IsNullOrWhiteSpace(fullName) ? request.FirstName.Trim() : fullName;
    }

    private static void ValidateRequest(ContactUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            throw new InvalidOperationException("First name is required.");
        }

        if (request.Emails.Count == 0 && request.Phones.Count == 0)
        {
            throw new InvalidOperationException("At least one email or phone number is required.");
        }
    }

    private static bool CanAccess(Contact contact, Guid actorUserId, string role)
        => role == "Admin" || contact.OwnerUserId == actorUserId || contact.VendorUserId == actorUserId;

    private static void ApplyContactCollections(Contact contact, ContactUpsertRequest request, DateTimeOffset now)
    {
        contact.Addresses = request.Addresses
            .Where(address => !string.IsNullOrWhiteSpace(address.AddressLine1))
            .Select(address => new ContactAddress
            {
                AddressType = string.IsNullOrWhiteSpace(address.AddressType) ? "primary" : address.AddressType.Trim(),
                CountryId = address.CountryId,
                StateId = address.StateId,
                DistrictId = address.DistrictId,
                CityId = address.CityId,
                AddressLine1 = address.AddressLine1.Trim(),
                AddressLine2 = address.AddressLine2.Trim(),
                PostalCode = address.PostalCode.Trim(),
                IsPrimary = address.IsPrimary,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();
        contact.Emails = request.Emails
            .Where(email => !string.IsNullOrWhiteSpace(email.Email))
            .Select(email => new ContactEmail
            {
                Label = string.IsNullOrWhiteSpace(email.Label) ? "Primary" : email.Label.Trim(),
                Email = email.Email.Trim().ToLowerInvariant(),
                IsPrimary = email.IsPrimary,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();
        contact.Phones = request.Phones
            .Where(phone => !string.IsNullOrWhiteSpace(phone.PhoneNumber))
            .Select(phone => new ContactPhone
            {
                Label = string.IsNullOrWhiteSpace(phone.Label) ? "Primary" : phone.Label.Trim(),
                PhoneNumber = phone.PhoneNumber.Trim(),
                IsPrimary = phone.IsPrimary,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();
        contact.Notes = request.Notes
            .Where(note => !string.IsNullOrWhiteSpace(note.Note))
            .Select(note => new ContactNote
            {
                Note = note.Note.Trim(),
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToList();

        if (contact.Emails.Count > 0 && contact.Emails.All(x => !x.IsPrimary))
        {
            contact.Emails.First().IsPrimary = true;
        }

        if (contact.Phones.Count > 0 && contact.Phones.All(x => !x.IsPrimary))
        {
            contact.Phones.First().IsPrimary = true;
        }

        if (contact.Addresses.Count > 0 && contact.Addresses.All(x => !x.IsPrimary))
        {
            contact.Addresses.First().IsPrimary = true;
        }
    }

    private async Task WriteAuditLogAsync(Guid? userId, string action, string entityType, string? entityId, string ipAddress, CancellationToken cancellationToken)
    {
        dbContext.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            IpAddress = ipAddress,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
