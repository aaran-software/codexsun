export interface VendorUserSummary {
  id: number
  vendorId: number
  userId: string
  username: string
  email: string
  role: string
  createdAt: string
}

export interface VendorAddress {
  id: number
  addressLine1: string
  addressLine2: string
  countryId?: number | null
  countryName: string
  stateId?: number | null
  stateName: string
  districtId?: number | null
  districtName: string
  cityId?: number | null
  cityName: string
  pincodeId?: number | null
  pincodeValue: string
}

export interface VendorBankAccount {
  id: number
  bankId?: number | null
  bankName: string
  accountName: string
  accountNumber: string
  ifscCode: string
  isPrimary: boolean
}

export interface VendorSummary {
  id: number
  companyName: string
  legalName: string
  gstNumber: string
  panNumber: string
  email: string
  phone: string
  website: string
  logoUrl: string
  status: string
  userCount: number
  createdAt: string
}

export interface VendorDetail extends VendorSummary {
  users: VendorUserSummary[]
  addresses: VendorAddress[]
  bankAccounts: VendorBankAccount[]
}

export interface VendorAddressInput {
  addressLine1: string
  addressLine2: string
  countryId?: number | null
  stateId?: number | null
  districtId?: number | null
  cityId?: number | null
  pincodeId?: number | null
}

export interface VendorBankAccountInput {
  bankId?: number | null
  accountName: string
  accountNumber: string
  ifscCode: string
  isPrimary: boolean
}

export interface VendorUpsertRequest {
  companyName: string
  legalName: string
  gstNumber: string
  panNumber: string
  email: string
  phone: string
  website: string
  logoUrl: string
  status: string
  addresses: VendorAddressInput[]
  bankAccounts: VendorBankAccountInput[]
}

export interface AssignVendorUserRequest {
  userId: string
  role: string
}
