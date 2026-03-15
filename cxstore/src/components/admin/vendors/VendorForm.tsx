import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react"
import { PlusIcon } from "lucide-react"

import { citiesApi, countriesApi, districtsApi, statesApi } from "@/api/locationApi"
import { AutocompleteLookup, mergeLookupOptions, type LookupOption } from "@/components/lookups/AutocompleteLookup"
import {
  CityLookup,
  CountryLookup,
  DistrictLookup,
  StateLookup,
  mapCommonItemToLookupOption,
} from "@/components/lookups/commonLookups"
import { MediaPicker } from "@/components/media/MediaPicker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { VendorDetail, VendorUpsertRequest } from "@/types/vendor"

type VendorFormProps = {
  title: string
  description: string
  submitLabel: string
  initialValue?: VendorDetail | null
  onSubmit: (request: VendorUpsertRequest) => Promise<void>
}

type VendorFormState = VendorUpsertRequest

function createEmptyState(): VendorFormState {
  return {
    companyName: "",
    legalName: "",
    gstNumber: "",
    panNumber: "",
    email: "",
    phone: "",
    website: "",
    logoUrl: "",
    status: "Active",
    addresses: [
      {
        addressLine1: "",
        addressLine2: "",
        countryId: null,
        stateId: null,
        districtId: null,
        cityId: null,
        pincodeId: null,
      },
    ],
    bankAccounts: [
      {
        bankId: null,
        accountName: "",
        accountNumber: "",
        ifscCode: "",
        isPrimary: true,
      },
    ],
  }
}

function fromDetail(detail: VendorDetail): VendorFormState {
  return {
    companyName: detail.companyName,
    legalName: detail.legalName,
    gstNumber: detail.gstNumber,
    panNumber: detail.panNumber,
    email: detail.email,
    phone: detail.phone,
    website: detail.website,
    logoUrl: detail.logoUrl,
    status: detail.status,
    addresses: detail.addresses.length > 0
      ? detail.addresses.map((address) => ({
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          countryId: address.countryId ?? null,
          stateId: address.stateId ?? null,
          districtId: address.districtId ?? null,
          cityId: address.cityId ?? null,
          pincodeId: address.pincodeId ?? null,
        }))
      : createEmptyState().addresses,
    bankAccounts: detail.bankAccounts.length > 0
      ? detail.bankAccounts.map((account) => ({
          bankId: account.bankId ?? null,
          accountName: account.accountName,
          accountNumber: account.accountNumber,
          ifscCode: account.ifscCode,
          isPrimary: account.isPrimary,
        }))
      : createEmptyState().bankAccounts,
  }
}

export function VendorForm({ title, description, submitLabel, initialValue, onSubmit }: VendorFormProps) {
  const [form, setForm] = useState<VendorFormState>(initialValue ? fromDetail(initialValue) : createEmptyState())
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
      countriesApi.list(),
      statesApi.list(),
      districtsApi.list(),
      citiesApi.list(),
    ]).then(([countryItems, stateItems, districtItems, cityItems]) => {
      setCountries(countryItems.map((item) => mapCommonItemToLookupOption("countries", item)))
      setStates(stateItems.map((item) => mapCommonItemToLookupOption("states", item)))
      setDistricts(districtItems.map((item) => mapCommonItemToLookupOption("districts", item)))
      setCities(cityItems.map((item) => mapCommonItemToLookupOption("cities", item)))
    }).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to load vendor form data.")
    })
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await onSubmit(form)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save vendor.")
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
          <FormSection title="Business Profile" description="Core business identity used across onboarding, payouts, branding, and reporting.">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Company Name" required>
                <Input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} required />
              </Field>
              <Field label="Legal Name">
                <Input value={form.legalName} onChange={(event) => setForm((current) => ({ ...current, legalName: event.target.value }))} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </Field>
              <Field label="Website" className="xl:col-span-2">
                <Input value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} placeholder="https://vendor.example.com" />
              </Field>
              <Field label="Status">
                <AutocompleteLookup
                  value={form.status}
                  onChange={(value) => setForm((current) => ({ ...current, status: value || "Active" }))}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                    { value: "Pending", label: "Pending" },
                  ]}
                  placeholder="Select status"
                />
              </Field>
              <Field label="Logo" className="xl:col-span-4">
                <MediaPicker
                  value={form.logoUrl}
                  onChange={(value) => setForm((current) => ({ ...current, logoUrl: value }))}
                  module="vendors"
                  preferredFolderId={2}
                  imagesOnly
                  label="Vendor logo"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Tax and Compliance" description="Business registration fields used in invoicing, vendor onboarding, and finance workflows.">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="GST Number">
                <Input value={form.gstNumber} onChange={(event) => setForm((current) => ({ ...current, gstNumber: event.target.value }))} />
              </Field>
              <Field label="PAN Number">
                <Input value={form.panNumber} onChange={(event) => setForm((current) => ({ ...current, panNumber: event.target.value }))} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Addresses" description="Store, billing, or warehouse-linked addresses for the vendor business.">
            <SectionHeader title="Addresses" onAdd={() => setForm((current) => ({
              ...current,
              addresses: [
                ...current.addresses,
                {
                  addressLine1: "",
                  addressLine2: "",
                  countryId: null,
                  stateId: null,
                  districtId: null,
                  cityId: null,
                  pincodeId: null,
                },
              ],
            }))} />
            <div className="space-y-5">
              {form.addresses.map((address, index) => (
                <InlinePanel key={`address-${index}`} className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">Address {index + 1}</div>
                    <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "addresses", index)}>Remove</Button>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
                    <Field label="Address Line 1" className="xl:col-span-2">
                      <Input value={address.addressLine1} onChange={(event) => updateArray(setForm, "addresses", index, { ...address, addressLine1: event.target.value })} placeholder="Street, building, door number" />
                    </Field>
                    <Field label="Address Line 2" className="xl:col-span-2">
                      <Input value={address.addressLine2} onChange={(event) => updateArray(setForm, "addresses", index, { ...address, addressLine2: event.target.value })} placeholder="Area, landmark, floor" />
                    </Field>
                    <Field label="Pincode Id">
                      <Input value={address.pincodeId ?? ""} onChange={(event) => updateArray(setForm, "addresses", index, { ...address, pincodeId: toNumberOrNull(event.target.value) })} placeholder="Optional master id" />
                    </Field>
                  </div>
                </InlinePanel>
              ))}
            </div>
          </FormSection>

          <FormSection title="Bank Accounts" description="Payout-ready account details used by finance and settlement workflows.">
            <SectionHeader title="Bank Accounts" onAdd={() => setForm((current) => ({
              ...current,
              bankAccounts: [
                ...current.bankAccounts,
                {
                  bankId: null,
                  accountName: "",
                  accountNumber: "",
                  ifscCode: "",
                  isPrimary: false,
                },
              ],
            }))} />
            <div className="space-y-4">
              {form.bankAccounts.map((account, index) => (
                <InlinePanel key={`bank-${index}`}>
                  <div className="grid gap-3 md:grid-cols-[140px_1fr_1fr_180px_120px_auto]">
                    <Input value={account.bankId ?? ""} onChange={(event) => updateArray(setForm, "bankAccounts", index, { ...account, bankId: toNumberOrNull(event.target.value) })} placeholder="Bank Id" />
                    <Input value={account.accountName} onChange={(event) => updateArray(setForm, "bankAccounts", index, { ...account, accountName: event.target.value })} placeholder="Account name" />
                    <Input value={account.accountNumber} onChange={(event) => updateArray(setForm, "bankAccounts", index, { ...account, accountNumber: event.target.value })} placeholder="Account number" />
                    <Input value={account.ifscCode} onChange={(event) => updateArray(setForm, "bankAccounts", index, { ...account, ifscCode: event.target.value })} placeholder="IFSC code" />
                    <Toggle compact label="Primary" checked={account.isPrimary} onChange={(checked) => setForm((current) => ({
                      ...current,
                      bankAccounts: current.bankAccounts.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index ? checked : checked ? false : item.isPrimary })),
                    }))} />
                    <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "bankAccounts", index)}>Remove</Button>
                  </div>
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

function updateArray<T extends keyof VendorFormState>(
  setForm: Dispatch<SetStateAction<VendorFormState>>,
  key: T,
  index: number,
  value: VendorFormState[T] extends Array<infer TItem> ? TItem : never,
) {
  setForm((current) => ({
    ...current,
    [key]: (current[key] as unknown[]).map((item, itemIndex) => itemIndex === index ? value : item),
  }))
}

function removeArrayItem<T extends keyof VendorFormState>(setForm: Dispatch<SetStateAction<VendorFormState>>, key: T, index: number) {
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
