// src/types/entities.ts
export interface CityFormData {
    name: string;
    active_id: number;
    // add more fields when needed, e.g.
    // state_id?: number | null;
    // pin_code?: string | null;
}

export interface DistrictFormData {
    name: string;
    active_id: number;
}

export interface StateFormData {
    name: string;
    state_code: string;
    active_id: number;
}

export interface PincodeFormData {
    name: string;
    active_id: number;
}

export interface CountryFormData {
    name: string;
    country_code: string;
    currency_symbol: string;
    active_id: number;
}

export interface EntityFormDataMap {
    cities: CityFormData;
    districts: DistrictFormData;
    states: StateFormData;
    pincodes: PincodeFormData;
    countries: CountryFormData;
    // ... other entities
}

export type EntityKey = keyof EntityFormDataMap;

export type FormDataFor<K extends EntityKey> = EntityFormDataMap[K];
