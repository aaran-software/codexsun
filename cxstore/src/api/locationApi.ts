import { activateCommonItem, createCommonItem, deactivateCommonItem, getCommonItemById, listCommonItems, searchCommonItems, updateCommonItem } from "@/api/commonApi"
import type {
  CityUpsertRequest,
  DistrictUpsertRequest,
  NameMasterUpsertRequest,
  PincodeUpsertRequest,
  StateUpsertRequest,
} from "@/types/common"

export const countriesApi = {
  list: () => listCommonItems("/common/countries"),
  search: (q?: string) => searchCommonItems("/common/countries", { q }),
  getById: (id: number) => getCommonItemById("/common/countries", id),
  create: (request: NameMasterUpsertRequest) => createCommonItem("/common/countries", request),
  update: (id: number, request: NameMasterUpsertRequest) => updateCommonItem("/common/countries", id, request),
  delete: (id: number) => deactivateCommonItem("/common/countries", id),
  restore: (id: number) => activateCommonItem("/common/countries", id),
}

export const statesApi = {
  list: (countryId?: number) => listCommonItems("/common/states", { countryId }),
  search: (q?: string, countryId?: number) => searchCommonItems("/common/states", { q, countryId }),
  getById: (id: number) => getCommonItemById("/common/states", id),
  create: (request: StateUpsertRequest) => createCommonItem("/common/states", request),
  update: (id: number, request: StateUpsertRequest) => updateCommonItem("/common/states", id, request),
  delete: (id: number) => deactivateCommonItem("/common/states", id),
  restore: (id: number) => activateCommonItem("/common/states", id),
}

export const districtsApi = {
  list: (stateId?: number) => listCommonItems("/common/districts", { stateId }),
  search: (q?: string, stateId?: number) => searchCommonItems("/common/districts", { q, stateId }),
  getById: (id: number) => getCommonItemById("/common/districts", id),
  create: (request: DistrictUpsertRequest) => createCommonItem("/common/districts", request),
  update: (id: number, request: DistrictUpsertRequest) => updateCommonItem("/common/districts", id, request),
  delete: (id: number) => deactivateCommonItem("/common/districts", id),
  restore: (id: number) => activateCommonItem("/common/districts", id),
}

export const citiesApi = {
  list: (districtId?: number) => listCommonItems("/common/cities", { districtId }),
  search: (q?: string, districtId?: number) => searchCommonItems("/common/cities", { q, districtId }),
  getById: (id: number) => getCommonItemById("/common/cities", id),
  create: (request: CityUpsertRequest) => createCommonItem("/common/cities", request),
  update: (id: number, request: CityUpsertRequest) => updateCommonItem("/common/cities", id, request),
  delete: (id: number) => deactivateCommonItem("/common/cities", id),
  restore: (id: number) => activateCommonItem("/common/cities", id),
}

export const pincodesApi = {
  list: (cityId?: number) => listCommonItems("/common/pincodes", { cityId }),
  search: (q?: string, cityId?: number) => searchCommonItems("/common/pincodes", { q, cityId }),
  getById: (id: number) => getCommonItemById("/common/pincodes", id),
  create: (request: PincodeUpsertRequest) => createCommonItem("/common/pincodes", request),
  update: (id: number, request: PincodeUpsertRequest) => updateCommonItem("/common/pincodes", id, request),
  delete: (id: number) => deactivateCommonItem("/common/pincodes", id),
  restore: (id: number) => activateCommonItem("/common/pincodes", id),
}
