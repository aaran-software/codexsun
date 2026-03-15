import { useEffect, useMemo, useState } from "react"

import { getCompany, getCompanySettings, updateCompany, updateCompanySettings } from "@/api/companyApi"
import { listCommonItems } from "@/api/commonApi"
import { citiesApi, countriesApi, pincodesApi, statesApi } from "@/api/locationApi"
import { MediaPicker } from "@/components/media/MediaPicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCompanyConfig } from "@/config/company"
import type { CommonMasterItem } from "@/types/common"
import type { CompanyProfile, CompanySetting } from "@/types/company"

type SettingsState = {
  orderPrefix: string
  invoicePrefix: string
  defaultLanguage: string
  dateFormat: string
}

const emptyProfile: CompanyProfile = {
  id: 1,
  displayName: "",
  legalName: "",
  billingName: "",
  companyCode: "",
  email: "",
  phone: "",
  website: "",
  supportEmail: "",
  gstNumber: "",
  panNumber: "",
  logoMediaId: null,
  logoUrl: "",
  faviconMediaId: null,
  faviconUrl: "",
  currencyId: null,
  currencyName: "",
  currencyCode: "",
  timezone: "Asia/Calcutta",
  address: null,
  settings: [],
  createdAt: "",
  updatedAt: "",
}

function getSettingValue(settings: CompanySetting[], key: string, fallback = "") {
  return settings.find((setting) => setting.settingKey === key)?.settingValue ?? fallback
}

export default function CompanySettingsPage() {
  const { reloadCompany } = useCompanyConfig()
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile)
  const [settingsState, setSettingsState] = useState<SettingsState>({
    orderPrefix: "",
    invoicePrefix: "",
    defaultLanguage: "",
    dateFormat: "",
  })
  const [currencies, setCurrencies] = useState<CommonMasterItem[]>([])
  const [countries, setCountries] = useState<CommonMasterItem[]>([])
  const [states, setStates] = useState<CommonMasterItem[]>([])
  const [cities, setCities] = useState<CommonMasterItem[]>([])
  const [pincodes, setPincodes] = useState<CommonMasterItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const address = profile.address ?? {
    id: 0,
    addressLine1: "",
    addressLine2: "",
    countryId: null,
    countryName: "",
    stateId: null,
    stateName: "",
    cityId: null,
    cityName: "",
    pincodeId: null,
    pincodeValue: "",
    isPrimary: true,
    createdAt: "",
  }

  useEffect(() => {
    async function load() {
      try {
        const [company, settings, currencyItems, countryItems] = await Promise.all([
          getCompany(),
          getCompanySettings(),
          listCommonItems("/common/currencies"),
          countriesApi.list(),
        ])

        setProfile(company)
        setSettingsState({
          orderPrefix: getSettingValue(settings, "order_prefix"),
          invoicePrefix: getSettingValue(settings, "invoice_prefix"),
          defaultLanguage: getSettingValue(settings, "default_language"),
          dateFormat: getSettingValue(settings, "date_format"),
        })
        setCurrencies(currencyItems)
        setCountries(countryItems)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load company settings.")
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  useEffect(() => {
    if (!address.countryId) {
      setStates([])
      return
    }

    void statesApi.list(address.countryId).then(setStates).catch(() => setStates([]))
  }, [address.countryId])

  useEffect(() => {
    if (!address.stateId) {
      setCities([])
      return
    }

    void citiesApi.list().then(setCities).catch(() => setCities([]))
  }, [address.stateId])

  useEffect(() => {
    if (!address.cityId) {
      setPincodes([])
      return
    }

    void pincodesApi.list(address.cityId).then(setPincodes).catch(() => setPincodes([]))
  }, [address.cityId])

  const timezones = useMemo(() => [
    "Asia/Calcutta",
    "UTC",
    "Europe/London",
    "America/New_York",
    "Asia/Dubai",
    "Asia/Singapore",
  ], [])

  async function handleProfileSave() {
    setIsSavingProfile(true)
    setError("")
    setSuccess("")

    try {
      const updated = await updateCompany({
        displayName: profile.displayName,
        legalName: profile.legalName,
        billingName: profile.billingName,
        companyCode: profile.companyCode,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        supportEmail: profile.supportEmail,
        gstNumber: profile.gstNumber,
        panNumber: profile.panNumber,
        logoMediaId: profile.logoMediaId,
        faviconMediaId: profile.faviconMediaId,
        currencyId: profile.currencyId,
        timezone: profile.timezone,
        address: {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          countryId: address.countryId,
          stateId: address.stateId,
          cityId: address.cityId,
          pincodeId: address.pincodeId,
          isPrimary: true,
        },
      })

      setProfile(updated)
      await reloadCompany()
      setSuccess("Company profile updated.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update company profile.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleSettingsSave() {
    setIsSavingSettings(true)
    setError("")
    setSuccess("")

    try {
      const updated = await updateCompanySettings({
        settings: [
          { settingKey: "order_prefix", settingValue: settingsState.orderPrefix, settingGroup: "Documents" },
          { settingKey: "invoice_prefix", settingValue: settingsState.invoicePrefix, settingGroup: "Documents" },
          { settingKey: "default_language", settingValue: settingsState.defaultLanguage, settingGroup: "Localization" },
          { settingKey: "date_format", settingValue: settingsState.dateFormat, settingGroup: "Localization" },
        ],
      })

      setSettingsState({
        orderPrefix: getSettingValue(updated, "order_prefix"),
        invoicePrefix: getSettingValue(updated, "invoice_prefix"),
        defaultLanguage: getSettingValue(updated, "default_language"),
        dateFormat: getSettingValue(updated, "date_format"),
      })
      setSuccess("Application settings updated.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update application settings.")
    } finally {
      setIsSavingSettings(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">Loading company settings...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border bg-card p-4">
        <h1 className="text-xl font-semibold">Company & Application Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage platform branding, billing identity, contact details, and global application defaults.
        </p>
      </section>

      {error ? <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</div> : null}
      {success ? <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-emerald-700">{success}</div> : null}

      <section className="grid gap-6 rounded-md border bg-card p-4 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Company Profile</h2>
          <div className="grid gap-2">
            <Label>Display Name</Label>
            <Input value={profile.displayName} onChange={(event) => setProfile((current) => ({ ...current, displayName: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Legal Name</Label>
            <Input value={profile.legalName} onChange={(event) => setProfile((current) => ({ ...current, legalName: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Billing Name</Label>
            <Input value={profile.billingName} onChange={(event) => setProfile((current) => ({ ...current, billingName: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Company Code</Label>
            <Input value={profile.companyCode} onChange={(event) => setProfile((current) => ({ ...current, companyCode: event.target.value.toUpperCase() }))} />
          </div>
          <MediaPicker
            label="Logo"
            value={profile.logoUrl}
            module="company"
            entityId={String(profile.id || 1)}
            entityType="Company"
            usageType="company logo"
            onChange={(value) => setProfile((current) => ({ ...current, logoUrl: value }))}
            onSelect={(file) => setProfile((current) => ({ ...current, logoMediaId: file.id, logoUrl: file.fileUrl }))}
          />
          <MediaPicker
            label="Favicon"
            value={profile.faviconUrl}
            module="company"
            entityId={String(profile.id || 1)}
            entityType="Company"
            usageType="company favicon"
            onChange={(value) => setProfile((current) => ({ ...current, faviconUrl: value }))}
            onSelect={(file) => setProfile((current) => ({ ...current, faviconMediaId: file.id, faviconUrl: file.fileUrl }))}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Contact Information</h2>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Website</Label>
            <Input value={profile.website} onChange={(event) => setProfile((current) => ({ ...current, website: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Support Email</Label>
            <Input value={profile.supportEmail} onChange={(event) => setProfile((current) => ({ ...current, supportEmail: event.target.value }))} />
          </div>

          <h2 className="pt-4 text-lg font-medium">Business Details</h2>
          <div className="grid gap-2">
            <Label>GST Number</Label>
            <Input value={profile.gstNumber} onChange={(event) => setProfile((current) => ({ ...current, gstNumber: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>PAN Number</Label>
            <Input value={profile.panNumber} onChange={(event) => setProfile((current) => ({ ...current, panNumber: event.target.value }))} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-md border bg-card p-4 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Address</h2>
          <div className="grid gap-2">
            <Label>Billing Address Line 1</Label>
            <Input value={address.addressLine1} onChange={(event) => setProfile((current) => ({ ...current, address: { ...address, addressLine1: event.target.value } }))} />
          </div>
          <div className="grid gap-2">
            <Label>Billing Address Line 2</Label>
            <Input value={address.addressLine2} onChange={(event) => setProfile((current) => ({ ...current, address: { ...address, addressLine2: event.target.value } }))} />
          </div>
          <div className="grid gap-2">
            <Label>Country</Label>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={address.countryId ?? ""} onChange={(event) => setProfile((current) => ({ ...current, address: { ...address, countryId: event.target.value ? Number(event.target.value) : null, stateId: null, cityId: null, pincodeId: null } }))}>
              <option value="">Select country</option>
              {countries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>State</Label>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={address.stateId ?? ""} onChange={(event) => setProfile((current) => ({ ...current, address: { ...address, stateId: event.target.value ? Number(event.target.value) : null, cityId: null, pincodeId: null } }))}>
              <option value="">Select state</option>
              {states.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>City</Label>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={address.cityId ?? ""} onChange={(event) => setProfile((current) => ({ ...current, address: { ...address, cityId: event.target.value ? Number(event.target.value) : null, pincodeId: null } }))}>
              <option value="">Select city</option>
              {cities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Pincode</Label>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={address.pincodeId ?? ""} onChange={(event) => setProfile((current) => ({ ...current, address: { ...address, pincodeId: event.target.value ? Number(event.target.value) : null } }))}>
              <option value="">Select pincode</option>
              {pincodes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">System Settings</h2>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={profile.currencyId ?? ""} onChange={(event) => setProfile((current) => ({ ...current, currencyId: event.target.value ? Number(event.target.value) : null }))}>
              <option value="">Select currency</option>
              {currencies.map((item) => <option key={item.id} value={item.id}>{item.name}{item.code ? ` (${item.code})` : ""}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Timezone</Label>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={profile.timezone} onChange={(event) => setProfile((current) => ({ ...current, timezone: event.target.value }))}>
              {timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Order Prefix</Label>
            <Input value={settingsState.orderPrefix} onChange={(event) => setSettingsState((current) => ({ ...current, orderPrefix: event.target.value.toUpperCase() }))} />
          </div>
          <div className="grid gap-2">
            <Label>Invoice Prefix</Label>
            <Input value={settingsState.invoicePrefix} onChange={(event) => setSettingsState((current) => ({ ...current, invoicePrefix: event.target.value.toUpperCase() }))} />
          </div>
          <div className="grid gap-2">
            <Label>Default Language</Label>
            <Input value={settingsState.defaultLanguage} onChange={(event) => setSettingsState((current) => ({ ...current, defaultLanguage: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Date Format</Label>
            <Input value={settingsState.dateFormat} onChange={(event) => setSettingsState((current) => ({ ...current, dateFormat: event.target.value }))} />
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button onClick={() => void handleProfileSave()} disabled={isSavingProfile}>
          {isSavingProfile ? "Saving Profile..." : "Save Company Profile"}
        </Button>
        <Button variant="outline" onClick={() => void handleSettingsSave()} disabled={isSavingSettings}>
          {isSavingSettings ? "Saving Settings..." : "Save Application Settings"}
        </Button>
      </section>
    </div>
  )
}
