export interface CompanyAddress {
  id: number
  addressLine1: string
  addressLine2: string
  countryId?: number | null
  countryName: string
  stateId?: number | null
  stateName: string
  cityId?: number | null
  cityName: string
  pincodeId?: number | null
  pincodeValue: string
  isPrimary: boolean
  createdAt: string
}

export interface CompanySetting {
  id: number
  settingKey: string
  settingValue: string
  settingGroup: string
  createdAt: string
  updatedAt: string
}

export interface CompanyProfile {
  id: number
  displayName: string
  legalName: string
  billingName: string
  companyCode: string
  email: string
  phone: string
  website: string
  supportEmail: string
  gstNumber: string
  panNumber: string
  logoMediaId?: number | null
  logoUrl: string
  faviconMediaId?: number | null
  faviconUrl: string
  currencyId?: number | null
  currencyName: string
  currencyCode: string
  timezone: string
  address?: CompanyAddress | null
  settings: CompanySetting[]
  createdAt: string
  updatedAt: string
}

export interface CompanyAddressRequest {
  addressLine1: string
  addressLine2: string
  countryId?: number | null
  stateId?: number | null
  cityId?: number | null
  pincodeId?: number | null
  isPrimary: boolean
}

export interface CompanyUpdateRequest {
  displayName: string
  legalName: string
  billingName: string
  companyCode: string
  email: string
  phone: string
  website: string
  supportEmail: string
  gstNumber: string
  panNumber: string
  logoMediaId?: number | null
  faviconMediaId?: number | null
  currencyId?: number | null
  timezone: string
  address: CompanyAddressRequest
}

export interface CompanySettingUpdate {
  settingKey: string
  settingValue: string
  settingGroup: string
}

export interface CompanySettingsUpdateRequest {
  settings: CompanySettingUpdate[]
}
