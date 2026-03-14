import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react"
import { PlusIcon } from "lucide-react"

import { getContactGroups } from "@/api/contactApi"
import { citiesApi, countriesApi, districtsApi, statesApi } from "@/api/locationApi"
import { listCommonItems } from "@/api/commonApi"
import { getUsers } from "@/api/userApi"
import { AutocompleteLookup, mergeLookupOptions, type LookupOption } from "@/components/lookups/AutocompleteLookup"
import {
  CityLookup,
  CommonMasterLookup,
  CountryLookup,
  DistrictLookup,
  StateLookup,
  mapCommonItemToLookupOption,
} from "@/components/lookups/commonLookups"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/state/authStore"
import type { AdminUserSummary } from "@/types/admin"
import type { ContactDetail, ContactUpsertRequest } from "@/types/contact"
import { cn } from "@/lib/utils"

type ContactFormProps = {
  title: string
  description: string
  submitLabel: string
  initialValue?: ContactDetail | null
  onSubmit: (request: ContactUpsertRequest) => Promise<void>
}

type ContactFormState = ContactUpsertRequest

function createEmptyState(): ContactFormState {
  return {
    vendorUserId: null,
    firstName: "",
    lastName: "",
    displayName: "",
    contactTypeId: null,
    groupId: null,
    taxNumber: "",
    isBusiness: false,
    isCustomer: true,
    isSupplier: false,
    isVendorContact: false,
    isActive: true,
    emails: [{ label: "Primary", email: "", isPrimary: true }],
    phones: [{ label: "Primary", phoneNumber: "", isPrimary: true }],
    addresses: [{
      addressType: "billing",
      countryId: null,
      stateId: null,
      districtId: null,
      cityId: null,
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      isPrimary: true,
    }],
    notes: [{ note: "" }],
  }
}

function fromDetail(detail: ContactDetail): ContactFormState {
  return {
    vendorUserId: detail.vendorUserId ?? null,
    firstName: detail.firstName,
    lastName: detail.lastName,
    displayName: detail.displayName,
    contactTypeId: detail.contactTypeId ?? null,
    groupId: detail.groupId ?? null,
    taxNumber: detail.taxNumber,
    isBusiness: detail.isBusiness,
    isCustomer: detail.isCustomer,
    isSupplier: detail.isSupplier,
    isVendorContact: detail.isVendorContact,
    isActive: detail.isActive,
    emails: detail.emails.length > 0 ? detail.emails.map((email) => ({ label: email.label, email: email.email, isPrimary: email.isPrimary })) : createEmptyState().emails,
    phones: detail.phones.length > 0 ? detail.phones.map((phone) => ({ label: phone.label, phoneNumber: phone.phoneNumber, isPrimary: phone.isPrimary })) : createEmptyState().phones,
    addresses: detail.addresses.length > 0 ? detail.addresses.map((address) => ({
      addressType: address.addressType,
      countryId: address.countryId ?? null,
      stateId: address.stateId ?? null,
      districtId: address.districtId ?? null,
      cityId: address.cityId ?? null,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      postalCode: address.postalCode,
      isPrimary: address.isPrimary,
    })) : createEmptyState().addresses,
    notes: detail.notes.length > 0 ? detail.notes.map((note) => ({ note: note.note })) : [{ note: "" }],
  }
}

export function ContactForm({ title, description, submitLabel, initialValue, onSubmit }: ContactFormProps) {
  const auth = useAuth()
  const [form, setForm] = useState<ContactFormState>(initialValue ? fromDetail(initialValue) : createEmptyState())
  const [vendors, setVendors] = useState<LookupOption[]>([])
  const [contactTypes, setContactTypes] = useState<LookupOption[]>([])
  const [groups, setGroups] = useState<LookupOption[]>([])
  const [countries, setCountries] = useState<LookupOption[]>([])
  const [states, setStates] = useState<LookupOption[]>([])
  const [districts, setDistricts] = useState<LookupOption[]>([])
  const [cities, setCities] = useState<LookupOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(initialValue ? fromDetail(initialValue) : createEmptyState())
  }, [initialValue])

  useEffect(() => {
    void Promise.all([
      auth.user?.role === "Admin" ? getUsers() : Promise.resolve([] as AdminUserSummary[]),
      listCommonItems("/common/contact-types"),
      getContactGroups(),
      countriesApi.list(),
      statesApi.list(),
      districtsApi.list(),
      citiesApi.list(),
    ]).then(([users, contactTypeItems, groupItems, countryItems, stateItems, districtItems, cityItems]) => {
      setVendors(users.filter((user) => user.role === "Vendor" && !user.isDeleted).map((user) => ({ value: user.id, label: user.username })))
      setContactTypes(contactTypeItems.filter((item) => item.isActive).map((item) => mapCommonItemToLookupOption("contact-types", item)))
      setGroups(groupItems.map((item) => ({ value: String(item.id), label: item.name })))
      setCountries(countryItems.map((item) => mapCommonItemToLookupOption("countries", item)))
      setStates(stateItems.map((item) => mapCommonItemToLookupOption("states", item)))
      setDistricts(districtItems.map((item) => mapCommonItemToLookupOption("districts", item)))
      setCities(cityItems.map((item) => mapCommonItemToLookupOption("cities", item)))
    }).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to load form data.")
    })
  }, [auth.user?.role])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await onSubmit({
        ...form,
        vendorUserId: auth.user?.role === "Vendor" ? auth.user.id : form.vendorUserId || null,
      })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save contact.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-3 border-b bg-muted/10 px-7 py-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-7 py-7">
        {error ? <div className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <form className="space-y-8" onSubmit={handleSubmit}>
          <FormSection title="Basic Details" description="Core contact identity and business classification.">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="First Name" required>
                <Input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} required />
              </Field>
              <Field label="Last Name">
                <Input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
              </Field>
              <Field label="Display Name" className="xl:col-span-2">
                <Input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Auto derived if left empty" />
              </Field>
              <Field label="Contact Type">
                <CommonMasterLookup
                  masterKey="contact-types"
                  value={toLookupValue(form.contactTypeId)}
                  onChange={(value) => setForm((current) => ({ ...current, contactTypeId: toNumberOrNull(value) }))}
                  options={contactTypes}
                  onOptionsChange={setContactTypes}
                  placeholder="Select contact type"
                />
              </Field>
              <Field label="Contact Group">
                <AutocompleteLookup
                  value={toLookupValue(form.groupId)}
                  onChange={(value) => setForm((current) => ({ ...current, groupId: toNumberOrNull(value) }))}
                  options={groups}
                  placeholder="Select contact group"
                />
              </Field>
              {auth.user?.role === "Admin" ? (
                <Field label="Vendor">
                  <AutocompleteLookup
                    value={form.vendorUserId ?? ""}
                    onChange={(value) => setForm((current) => ({ ...current, vendorUserId: value || null }))}
                    options={vendors}
                    placeholder="Platform default"
                  />
                </Field>
              ) : null}
              <Field label="Tax Number">
                <Input value={form.taxNumber} onChange={(event) => setForm((current) => ({ ...current, taxNumber: event.target.value }))} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <ToggleCard label="Business" checked={form.isBusiness} onChange={(checked) => setForm((current) => ({ ...current, isBusiness: checked }))} />
              <ToggleCard label="Customer" checked={form.isCustomer} onChange={(checked) => setForm((current) => ({ ...current, isCustomer: checked }))} />
              <ToggleCard label="Supplier" checked={form.isSupplier} onChange={(checked) => setForm((current) => ({ ...current, isSupplier: checked }))} />
              <ToggleCard label="Vendor Contact" checked={form.isVendorContact} onChange={(checked) => setForm((current) => ({ ...current, isVendorContact: checked }))} />
              <ToggleCard label="Active" checked={form.isActive} onChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))} />
            </div>
          </FormSection>

          <FormSection title="Communication" description="Primary emails and phone numbers used in billing and operations.">
            <SectionHeader title="Emails" onAdd={() => setForm((current) => ({ ...current, emails: [...current.emails, { label: "Other", email: "", isPrimary: false }] }))} />
            <div className="space-y-4">
              {form.emails.map((email, index) => (
                <InlinePanel key={`email-${index}`}>
                  <div className="grid gap-3 md:grid-cols-[160px_1fr_120px_auto]">
                    <Input value={email.label} onChange={(event) => updateArray(setForm, "emails", index, { ...email, label: event.target.value })} placeholder="Label" />
                    <Input type="email" value={email.email} onChange={(event) => updateArray(setForm, "emails", index, { ...email, email: event.target.value })} placeholder="Email address" />
                    <Toggle compact label="Primary" checked={email.isPrimary} onChange={(checked) => setForm((current) => ({ ...current, emails: current.emails.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index ? checked : checked ? false : item.isPrimary })) }))} />
                    <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "emails", index)}>Remove</Button>
                  </div>
                </InlinePanel>
              ))}
            </div>

            <SectionHeader title="Phones" onAdd={() => setForm((current) => ({ ...current, phones: [...current.phones, { label: "Other", phoneNumber: "", isPrimary: false }] }))} />
            <div className="space-y-4">
              {form.phones.map((phone, index) => (
                <InlinePanel key={`phone-${index}`}>
                  <div className="grid gap-3 md:grid-cols-[160px_1fr_120px_auto]">
                    <Input value={phone.label} onChange={(event) => updateArray(setForm, "phones", index, { ...phone, label: event.target.value })} placeholder="Label" />
                    <Input value={phone.phoneNumber} onChange={(event) => updateArray(setForm, "phones", index, { ...phone, phoneNumber: event.target.value })} placeholder="Phone number" />
                    <Toggle compact label="Primary" checked={phone.isPrimary} onChange={(checked) => setForm((current) => ({ ...current, phones: current.phones.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index ? checked : checked ? false : item.isPrimary })) }))} />
                    <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "phones", index)}>Remove</Button>
                  </div>
                </InlinePanel>
              ))}
            </div>
          </FormSection>

          <FormSection title="Addresses" description="Billing, shipping, warehouse, or office address records.">
            <SectionHeader title="Addresses" onAdd={() => setForm((current) => ({ ...current, addresses: [...current.addresses, { addressType: "shipping", countryId: null, stateId: null, districtId: null, cityId: null, addressLine1: "", addressLine2: "", postalCode: "", isPrimary: false }] }))} />
            <div className="space-y-5">
              {form.addresses.map((address, index) => (
                <InlinePanel key={`address-${index}`} className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">Address {index + 1}</div>
                    <div className="flex items-center gap-3">
                      <Toggle compact label="Primary" checked={address.isPrimary} onChange={(checked) => setForm((current) => ({ ...current, addresses: current.addresses.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index ? checked : checked ? false : item.isPrimary })) }))} />
                      <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "addresses", index)}>Remove</Button>
                    </div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Address Type">
                      <Input value={address.addressType} onChange={(event) => updateArray(setForm, "addresses", index, { ...address, addressType: event.target.value })} placeholder="Billing, shipping, office..." />
                    </Field>
                    <Field label="Country">
                      <CountryLookup
                        value={toLookupValue(address.countryId)}
                        onChange={(value) => updateArray(setForm, "addresses", index, { ...address, countryId: toNumberOrNull(value), stateId: null, districtId: null, cityId: null })}
                        options={countries}
                        onOptionsChange={setCountries}
                        placeholder="Select country"
                      />
                    </Field>
                    <Field label="State">
                      <StateLookup
                        value={toLookupValue(address.stateId)}
                        onChange={(value) => updateArray(setForm, "addresses", index, { ...address, stateId: toNumberOrNull(value), districtId: null, cityId: null })}
                        options={states}
                        countryId={address.countryId}
                        onOptionsChange={(nextOptions) => setStates((current) => mergeLookupOptions(current, nextOptions))}
                        placeholder="Select state"
                      />
                    </Field>
                    <Field label="District">
                      <DistrictLookup
                        value={toLookupValue(address.districtId)}
                        onChange={(value) => updateArray(setForm, "addresses", index, { ...address, districtId: toNumberOrNull(value), cityId: null })}
                        options={districts}
                        stateId={address.stateId}
                        onOptionsChange={(nextOptions) => setDistricts((current) => mergeLookupOptions(current, nextOptions))}
                        placeholder="Select district"
                      />
                    </Field>
                    <Field label="City">
                      <CityLookup
                        value={toLookupValue(address.cityId)}
                        onChange={(value) => updateArray(setForm, "addresses", index, { ...address, cityId: toNumberOrNull(value) })}
                        options={cities}
                        districtId={address.districtId}
                        onOptionsChange={(nextOptions) => setCities((current) => mergeLookupOptions(current, nextOptions))}
                        placeholder="Select city"
                      />
                    </Field>
                    <Field label="Postal Code">
                      <Input value={address.postalCode} onChange={(event) => updateArray(setForm, "addresses", index, { ...address, postalCode: event.target.value })} />
                    </Field>
                    <Field label="Address Line 1" className="xl:col-span-2">
                      <Input value={address.addressLine1} onChange={(event) => updateArray(setForm, "addresses", index, { ...address, addressLine1: event.target.value })} placeholder="Street, building, door number" />
                    </Field>
                    <Field label="Address Line 2" className="xl:col-span-2">
                      <Input value={address.addressLine2} onChange={(event) => updateArray(setForm, "addresses", index, { ...address, addressLine2: event.target.value })} placeholder="Area, landmark, floor" />
                    </Field>
                  </div>
                </InlinePanel>
              ))}
            </div>
          </FormSection>

          <FormSection title="Notes" description="Internal notes for accounts, sales, and operations teams.">
            <SectionHeader title="Notes" onAdd={() => setForm((current) => ({ ...current, notes: [...current.notes, { note: "" }] }))} />
            <div className="space-y-4">
              {form.notes.map((note, index) => (
                <InlinePanel key={`note-${index}`} className="flex gap-3 p-4">
                  <Textarea value={note.note} onChange={(event) => updateArray(setForm, "notes", index, { note: event.target.value })} rows={3} placeholder="Add note" />
                  <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "notes", index)}>Remove</Button>
                </InlinePanel>
              ))}
            </div>
          </FormSection>

          <div className="flex justify-end border-t pt-6">
            <Button type="submit" className="min-w-36" disabled={submitting}>
              {submitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function toLookupValue(value: number | null | undefined) {
  return value ? String(value) : ""
}

function toNumberOrNull(value: string) {
  return value ? Number(value) : null
}

function updateArray<T extends keyof ContactFormState>(
  setForm: Dispatch<SetStateAction<ContactFormState>>,
  key: T,
  index: number,
  value: ContactFormState[T] extends Array<infer TItem> ? TItem : never,
) {
  setForm((current) => ({
    ...current,
    [key]: (current[key] as unknown[]).map((item, itemIndex) => itemIndex === index ? value : item),
  }))
}

function removeArrayItem<T extends keyof ContactFormState>(setForm: Dispatch<SetStateAction<ContactFormState>>, key: T, index: number) {
  setForm((current) => {
    const items = (current[key] as unknown[]).filter((_, itemIndex) => itemIndex !== index)
    return {
      ...current,
      [key]: items.length > 0 ? items : createEmptyState()[key],
    }
  })
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5 rounded-2xl border border-border/70 bg-muted/20 p-6 md:p-7">
      <div className="space-y-1.5 border-b border-border/60 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Section</p>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  required = false,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("grid gap-2.5 text-sm", className)}>
      <span className="font-medium text-foreground/90">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <Button type="button" variant="outline" className="gap-2" onClick={onAdd}>
        <PlusIcon className="size-4" />
        <span>Add</span>
      </Button>
    </div>
  )
}

function InlinePanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border border-border/70 bg-background p-4 shadow-sm", className)}>
      {children}
    </div>
  )
}

function ToggleCard({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors", checked ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border/70 bg-background")}>
      <span className="font-medium text-foreground">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
  compact = false,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  compact?: boolean
}) {
  return (
    <label className={cn("flex items-center gap-2 text-sm", compact ? "justify-start" : "justify-between")}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}
