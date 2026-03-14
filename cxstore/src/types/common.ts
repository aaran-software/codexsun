export interface CommonMasterItem {
  id: number
  name: string
  code?: string | null
  description?: string | null
  shortName?: string | null
  percentage?: number | null
  symbol?: string | null
  location?: string | null
  days?: number | null
  countryId?: number | null
  countryName?: string | null
  stateId?: number | null
  stateName?: string | null
  districtId?: number | null
  districtName?: string | null
  cityId?: number | null
  cityName?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CommonSearchItem {
  id: number
  name: string
}

export interface NameMasterUpsertRequest {
  name: string
}

export interface StateUpsertRequest {
  name: string
  stateCode: string
  countryId: number
}

export interface DistrictUpsertRequest {
  name: string
  stateId: number
}

export interface CityUpsertRequest {
  name: string
  districtId: number
}

export interface PincodeUpsertRequest {
  code: string
  cityId: number
}

export interface HsnCodeUpsertRequest {
  code: string
  description: string
}

export interface UnitUpsertRequest {
  name: string
  shortName: string
}

export interface GstPercentUpsertRequest {
  percentage: number
}

export interface DestinationUpsertRequest {
  name: string
  countryId?: number
  cityId?: number
}

export interface CurrencyUpsertRequest {
  name: string
  code: string
  symbol: string
}

export interface WarehouseUpsertRequest {
  name: string
  location: string
}

export interface PaymentTermUpsertRequest {
  name: string
  days: number
}
