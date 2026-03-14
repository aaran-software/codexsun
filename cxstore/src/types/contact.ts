export interface ContactAddress {
  id: number
  addressType: string
  countryId?: number | null
  countryName?: string | null
  stateId?: number | null
  stateName?: string | null
  districtId?: number | null
  districtName?: string | null
  cityId?: number | null
  cityName?: string | null
  addressLine1: string
  addressLine2: string
  postalCode: string
  isPrimary: boolean
}

export interface ContactEmail {
  id: number
  label: string
  email: string
  isPrimary: boolean
}

export interface ContactPhone {
  id: number
  label: string
  phoneNumber: string
  isPrimary: boolean
}

export interface ContactNote {
  id: number
  note: string
}

export interface ContactSummary {
  id: number
  ownerUserId: string
  vendorUserId?: string | null
  vendorName: string
  firstName: string
  lastName: string
  displayName: string
  contactTypeId?: number | null
  contactTypeName: string
  groupId?: number | null
  groupName: string
  taxNumber: string
  isBusiness: boolean
  isCustomer: boolean
  isSupplier: boolean
  isVendorContact: boolean
  isActive: boolean
  primaryEmail: string
  primaryPhone: string
  primaryCity: string
  createdAt: string
  updatedAt: string
}

export interface ContactDetail extends ContactSummary {
  addresses: ContactAddress[]
  emails: ContactEmail[]
  phones: ContactPhone[]
  notes: ContactNote[]
}

export interface ContactGroup {
  id: number
  name: string
}

export interface ContactAddressInput {
  addressType: string
  countryId?: number | null
  stateId?: number | null
  districtId?: number | null
  cityId?: number | null
  addressLine1: string
  addressLine2: string
  postalCode: string
  isPrimary: boolean
}

export interface ContactEmailInput {
  label: string
  email: string
  isPrimary: boolean
}

export interface ContactPhoneInput {
  label: string
  phoneNumber: string
  isPrimary: boolean
}

export interface ContactNoteInput {
  note: string
}

export interface ContactUpsertRequest {
  vendorUserId?: string | null
  firstName: string
  lastName: string
  displayName: string
  contactTypeId?: number | null
  groupId?: number | null
  taxNumber: string
  isBusiness: boolean
  isCustomer: boolean
  isSupplier: boolean
  isVendorContact: boolean
  isActive: boolean
  addresses: ContactAddressInput[]
  emails: ContactEmailInput[]
  phones: ContactPhoneInput[]
  notes: ContactNoteInput[]
}
