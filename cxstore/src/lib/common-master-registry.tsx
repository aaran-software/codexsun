import { createBrand, deleteBrand, getBrandById, listBrands, restoreBrand, updateBrand } from "@/api/brandApi"
import { listCommonItems, createCommonItem, updateCommonItem, deactivateCommonItem, activateCommonItem, getCommonItemById } from "@/api/commonApi"
import { createColour, deleteColour, getColourById, listColours, restoreColour, updateColour } from "@/api/colourApi"
import { createHsnCode, deleteHsnCode, getHsnCodeById, listHsnCodes, restoreHsnCode, updateHsnCode } from "@/api/hsnApi"
import { countriesApi, statesApi, districtsApi, citiesApi, pincodesApi } from "@/api/locationApi"
import { createSize, deleteSize, getSizeById, listSizes, restoreSize, updateSize } from "@/api/sizeApi"
import { createUnit, deleteUnit, getUnitById, listUnits, restoreUnit, updateUnit } from "@/api/unitApi"
import { getVendors } from "@/api/vendorApi"
import type { CommonMasterDefinition } from "@/components/forms/commonMasterTypes"
import type { CommonUpsertFormValues, CommonUpsertSelectOption } from "@/components/forms/CommonUpsertDialog"
import type {
  CityUpsertRequest,
  CurrencyUpsertRequest,
  DestinationUpsertRequest,
  DistrictUpsertRequest,
  GstPercentUpsertRequest,
  HsnCodeUpsertRequest,
  NameMasterUpsertRequest,
  PaymentTermUpsertRequest,
  PincodeUpsertRequest,
  StateUpsertRequest,
  UnitUpsertRequest,
  WarehouseUpsertRequest,
} from "@/types/common"

function asNameRequest(values: CommonUpsertFormValues): NameMasterUpsertRequest {
  return {
    name: String(values.name ?? "").trim(),
  }
}

function mapOptions(
  loader: () => Promise<{ id: number; name: string }[]>,
  labelSelector?: (item: { id: number; name: string }) => string,
) {
  return async () => {
    const items = await loader()
    return items.map<CommonUpsertSelectOption>((item) => ({
      value: item.id,
      label: labelSelector ? labelSelector(item) : item.name,
    }))
  }
}

function createNamedDefinition(
  slug: string,
  menuTitle: string,
  entityLabel: string,
  pageDescription: string,
  path: string,
  apiOverrides?: Partial<CommonMasterDefinition["api"]>,
): CommonMasterDefinition {
  return {
    slug,
    menuTitle,
    entityLabel,
    pageTitle: `${entityLabel} Management`,
    pageDescription,
    searchPlaceholder: `Search ${menuTitle.toLowerCase()}`,
    fields: [
      { key: "name", label: `${entityLabel} Name`, required: true, placeholder: `Enter ${entityLabel.toLowerCase()} name` },
    ],
    columns: [
      {
        id: "name",
        header: `${entityLabel} Name`,
        accessor: (item) => item.name,
      },
    ],
    api: {
      list: () => listCommonItems(path),
      getById: (id) => getCommonItemById(path, id),
      create: (request) => createCommonItem(path, request),
      update: (id, request) => updateCommonItem(path, id, request),
      delete: (id) => deactivateCommonItem(path, id),
      restore: (id) => activateCommonItem(path, id),
      ...apiOverrides,
    },
    toRequest: asNameRequest,
  }
}

export const commonMasterDefinitions = {
  brands: createNamedDefinition(
    "brands",
    "Brands",
    "Brand",
    "Manage reusable brand masters used across products and orders.",
    "/common/brands",
    {
      list: listBrands,
      getById: getBrandById,
      create: (request) => createBrand(request as NameMasterUpsertRequest),
      update: (id, request) => updateBrand(id, request as NameMasterUpsertRequest),
      delete: deleteBrand,
      restore: restoreBrand,
    },
  ),
  colours: createNamedDefinition(
    "colours",
    "Colours",
    "Colour",
    "Manage reusable colour masters for product catalog workflows.",
    "/common/colours",
    {
      list: listColours,
      getById: getColourById,
      create: (request) => createColour(request as NameMasterUpsertRequest),
      update: (id, request) => updateColour(id, request as NameMasterUpsertRequest),
      delete: deleteColour,
      restore: restoreColour,
    },
  ),
  sizes: createNamedDefinition(
    "sizes",
    "Sizes",
    "Size",
    "Manage reusable size masters for product variants and assortments.",
    "/common/sizes",
    {
      list: listSizes,
      getById: getSizeById,
      create: (request) => createSize(request as NameMasterUpsertRequest),
      update: (id, request) => updateSize(id, request as NameMasterUpsertRequest),
      delete: deleteSize,
      restore: restoreSize,
    },
  ),
  units: {
    slug: "units",
    menuTitle: "Units",
    entityLabel: "Unit",
    pageTitle: "Unit Management",
    pageDescription: "Manage reusable units for products, inventory, and order forms.",
    searchPlaceholder: "Search units by name or short name",
    fields: [
      { key: "name", label: "Unit Name", required: true, placeholder: "Enter unit name" },
      { key: "shortName", label: "Short Name", required: true, placeholder: "Enter short name" },
    ],
    columns: [
      { id: "name", header: "Unit Name", accessor: (item) => item.name },
      { id: "shortName", header: "Short Name", accessor: (item) => item.shortName ?? "" },
    ],
    api: {
      list: listUnits,
      getById: getUnitById,
      create: (request) => createUnit(request as UnitUpsertRequest),
      update: (id, request) => updateUnit(id, request as UnitUpsertRequest),
      delete: deleteUnit,
      restore: restoreUnit,
    },
    toRequest: (values: CommonUpsertFormValues): UnitUpsertRequest => ({
      name: String(values.name ?? "").trim(),
      shortName: String(values.shortName ?? "").trim(),
    }),
  },
  "hsn-codes": {
    slug: "hsn-codes",
    menuTitle: "HSN Codes",
    entityLabel: "HSN Code",
    pageTitle: "HSN Code Management",
    pageDescription: "Manage reusable HSN code masters for product classification and billing.",
    searchPlaceholder: "Search HSN codes by code or description",
    fields: [
      { key: "code", label: "HSN Code", required: true, placeholder: "Enter HSN code" },
      { key: "description", label: "Description", required: true, placeholder: "Enter HSN description" },
    ],
    columns: [
      { id: "code", header: "Code", accessor: (item) => item.code ?? item.name },
      { id: "description", header: "Description", accessor: (item) => item.description ?? "" },
    ],
    api: {
      list: listHsnCodes,
      getById: getHsnCodeById,
      create: (request) => createHsnCode(request as HsnCodeUpsertRequest),
      update: (id, request) => updateHsnCode(id, request as HsnCodeUpsertRequest),
      delete: deleteHsnCode,
      restore: restoreHsnCode,
    },
    toRequest: (values: CommonUpsertFormValues): HsnCodeUpsertRequest => ({
      code: String(values.code ?? "").trim(),
      description: String(values.description ?? "").trim(),
    }),
  },
  "product-groups": createNamedDefinition(
    "product-groups",
    "Product Groups",
    "Product Group",
    "Manage reusable product group masters across the catalog.",
    "/common/product-groups",
  ),
  "product-types": createNamedDefinition(
    "product-types",
    "Product Types",
    "Product Type",
    "Manage reusable product type masters across the catalog.",
    "/common/product-types",
  ),
  "contact-types": createNamedDefinition(
    "contact-types",
    "Contact Types",
    "Contact Type",
    "Manage reusable contact classification masters across the platform.",
    "/common/contact-types",
  ),
  "gst-percents": {
    slug: "gst-percents",
    menuTitle: "GST Percents",
    entityLabel: "GST Percent",
    pageTitle: "GST Percent Management",
    pageDescription: "Manage reusable GST percentage masters for catalog and order pricing.",
    searchPlaceholder: "Search GST percentages",
    fields: [
      { key: "percentage", label: "Percentage", type: "number", parseAs: "number", required: true, placeholder: "Enter GST percentage" },
    ],
    columns: [
      { id: "percentage", header: "Percentage", accessor: (item) => item.percentage ?? 0 },
    ],
    api: {
      list: () => listCommonItems("/common/gst-percents"),
      getById: (id) => getCommonItemById("/common/gst-percents", id),
      create: (request) => createCommonItem("/common/gst-percents", request),
      update: (id, request) => updateCommonItem("/common/gst-percents", id, request),
      delete: (id) => deactivateCommonItem("/common/gst-percents", id),
      restore: (id) => activateCommonItem("/common/gst-percents", id),
    },
    toRequest: (values: CommonUpsertFormValues): GstPercentUpsertRequest => ({
      percentage: Number(values.percentage ?? 0),
    }),
  },
  countries: {
    ...createNamedDefinition(
      "countries",
      "Countries",
      "Country",
      "Manage reusable country masters for address and logistics forms.",
      "/common/countries",
      {
        list: countriesApi.list,
        getById: countriesApi.getById,
        create: (request) => countriesApi.create(request as NameMasterUpsertRequest),
        update: (id, request) => countriesApi.update(id, request as NameMasterUpsertRequest),
        delete: countriesApi.delete,
        restore: countriesApi.restore,
      },
    ),
    searchPlaceholder: "Search countries by name",
  },
  states: {
    slug: "states",
    menuTitle: "States",
    entityLabel: "State",
    pageTitle: "State Management",
    pageDescription: "Manage reusable state and province masters linked to countries.",
    searchPlaceholder: "Search states by name, code, or country",
    fields: [
      { key: "name", label: "State Name", required: true, placeholder: "Enter state name" },
      { key: "stateCode", label: "State Code", required: true, placeholder: "Enter state code" },
      {
        key: "countryId",
        label: "Country",
        type: "select",
        parseAs: "number",
        required: true,
        placeholder: "Select country",
        loadOptions: mapOptions(countriesApi.list),
        createOption: async (label) => {
          const created = await countriesApi.create({ name: label.trim() })
          return {
            value: created.id,
            label: created.name,
          }
        },
      },
    ],
    columns: [
      { id: "name", header: "State Name", accessor: (item) => item.name },
      { id: "stateCode", header: "State Code", accessor: (item) => item.code ?? "" },
      { id: "country", header: "Country", accessor: (item) => item.countryName ?? "" },
    ],
    api: {
      list: () => statesApi.list(),
      getById: statesApi.getById,
      create: (request) => statesApi.create(request as StateUpsertRequest),
      update: (id, request) => statesApi.update(id, request as StateUpsertRequest),
      delete: statesApi.delete,
      restore: statesApi.restore,
    },
    toRequest: (values: CommonUpsertFormValues): StateUpsertRequest => ({
      name: String(values.name ?? "").trim(),
      stateCode: String(values.stateCode ?? "").trim(),
      countryId: Number(values.countryId ?? 0),
    }),
    toFormValues: (item) => ({
      name: item.name,
      stateCode: item.code ?? "",
      countryId: item.countryId ?? 0,
      isActive: item.isActive,
    }),
  },
  districts: {
    slug: "districts",
    menuTitle: "Districts",
    entityLabel: "District",
    pageTitle: "District Management",
    pageDescription: "Manage reusable district masters linked to states.",
    searchPlaceholder: "Search districts by name or state",
    fields: [
      { key: "name", label: "District Name", required: true, placeholder: "Enter district name" },
      {
        key: "stateId",
        label: "State",
        type: "select",
        parseAs: "number",
        required: true,
        placeholder: "Select state",
        loadOptions: mapOptions(statesApi.list, (item) => item.name),
      },
    ],
    columns: [
      { id: "name", header: "District Name", accessor: (item) => item.name },
      { id: "state", header: "State", accessor: (item) => item.stateName ?? "" },
    ],
    api: {
      list: () => districtsApi.list(),
      getById: districtsApi.getById,
      create: (request) => districtsApi.create(request as DistrictUpsertRequest),
      update: (id, request) => districtsApi.update(id, request as DistrictUpsertRequest),
      delete: districtsApi.delete,
      restore: districtsApi.restore,
    },
    toRequest: (values: CommonUpsertFormValues): DistrictUpsertRequest => ({
      name: String(values.name ?? "").trim(),
      stateId: Number(values.stateId ?? 0),
    }),
    toFormValues: (item) => ({
      name: item.name,
      stateId: item.stateId ?? 0,
      isActive: item.isActive,
    }),
  },
  cities: {
    slug: "cities",
    menuTitle: "Cities",
    entityLabel: "City",
    pageTitle: "City Management",
    pageDescription: "Manage reusable city masters linked to districts and states.",
    searchPlaceholder: "Search cities by name, district, or state",
    fields: [
      { key: "name", label: "City Name", required: true, placeholder: "Enter city name" },
      {
        key: "stateId",
        label: "State",
        type: "select",
        parseAs: "number",
        required: true,
        placeholder: "Select state",
        loadOptions: mapOptions(statesApi.list, (item) => item.name),
      },
      {
        key: "districtId",
        label: "District",
        type: "select",
        parseAs: "number",
        required: true,
        placeholder: "Select district",
        loadOptions: mapOptions(districtsApi.list),
        createOption: async (label, values) => {
          const stateId = Number(values.stateId ?? 0)

          if (!stateId) {
            throw new Error("Select a state before creating a district.")
          }

          const created = await districtsApi.create({
            name: label.trim(),
            stateId,
          })

          return {
            value: created.id,
            label: created.name,
          }
        },
      },
    ],
    columns: [
      { id: "name", header: "City Name", accessor: (item) => item.name },
      { id: "district", header: "District", accessor: (item) => item.districtName ?? "" },
      { id: "state", header: "State", accessor: (item) => item.stateName ?? "" },
    ],
    api: {
      list: () => citiesApi.list(),
      getById: citiesApi.getById,
      create: (request) => citiesApi.create(request as CityUpsertRequest),
      update: (id, request) => citiesApi.update(id, request as CityUpsertRequest),
      delete: citiesApi.delete,
      restore: citiesApi.restore,
    },
    toRequest: (values: CommonUpsertFormValues): CityUpsertRequest => ({
      name: String(values.name ?? "").trim(),
      districtId: Number(values.districtId ?? 0),
    }),
    toFormValues: (item) => ({
      name: item.name,
      stateId: item.stateId ?? 0,
      districtId: item.districtId ?? 0,
      isActive: item.isActive,
    }),
  },
  pincodes: {
    slug: "pincodes",
    menuTitle: "Pincodes",
    entityLabel: "Pincode",
    pageTitle: "Pincode Management",
    pageDescription: "Manage reusable pincode masters linked to cities.",
    searchPlaceholder: "Search pincodes by code or city",
    fields: [
      { key: "code", label: "Pincode", required: true, placeholder: "Enter pincode" },
      {
        key: "cityId",
        label: "City",
        type: "select",
        parseAs: "number",
        required: true,
        placeholder: "Select city",
        loadOptions: mapOptions(citiesApi.list),
      },
    ],
    columns: [
      { id: "code", header: "Pincode", accessor: (item) => item.code ?? item.name },
      { id: "city", header: "City", accessor: (item) => item.cityName ?? "" },
      { id: "district", header: "District", accessor: (item) => item.districtName ?? "" },
    ],
    api: {
      list: () => pincodesApi.list(),
      getById: pincodesApi.getById,
      create: (request) => pincodesApi.create(request as PincodeUpsertRequest),
      update: (id, request) => pincodesApi.update(id, request as PincodeUpsertRequest),
      delete: pincodesApi.delete,
      restore: pincodesApi.restore,
    },
    toRequest: (values: CommonUpsertFormValues): PincodeUpsertRequest => ({
      code: String(values.code ?? "").trim(),
      cityId: Number(values.cityId ?? 0),
    }),
    toFormValues: (item) => ({
      code: item.code ?? item.name,
      cityId: item.cityId ?? 0,
      isActive: item.isActive,
    }),
  },
  "order-types": createNamedDefinition(
    "order-types",
    "Order Types",
    "Order Type",
    "Manage reusable order type masters for order entry workflows.",
    "/common/order-types",
  ),
  styles: createNamedDefinition(
    "styles",
    "Styles",
    "Style",
    "Manage reusable style masters for product and order workflows.",
    "/common/styles",
  ),
  transports: createNamedDefinition(
    "transports",
    "Transports",
    "Transport",
    "Manage reusable transport masters for logistics workflows.",
    "/common/transports",
  ),
  destinations: {
    slug: "destinations",
    menuTitle: "Destinations",
    entityLabel: "Destination",
    pageTitle: "Destination Management",
    pageDescription: "Manage reusable destination masters linked to country and city references.",
    searchPlaceholder: "Search destinations by name, country, or city",
    fields: [
      { key: "name", label: "Destination Name", required: true, placeholder: "Enter destination name" },
      {
        key: "countryId",
        label: "Country",
        type: "select",
        parseAs: "number",
        placeholder: "Select country",
        loadOptions: mapOptions(countriesApi.list),
        createOption: async (label) => {
          const created = await countriesApi.create({ name: label.trim() })
          return {
            value: created.id,
            label: created.name,
          }
        },
      },
      {
        key: "cityId",
        label: "City",
        type: "select",
        parseAs: "number",
        placeholder: "Select city",
        loadOptions: mapOptions(citiesApi.list),
      },
    ],
    columns: [
      { id: "name", header: "Destination Name", accessor: (item) => item.name },
      { id: "country", header: "Country", accessor: (item) => item.countryName ?? "" },
      { id: "city", header: "City", accessor: (item) => item.cityName ?? "" },
    ],
    api: {
      list: () => listCommonItems("/common/destinations"),
      getById: (id) => getCommonItemById("/common/destinations", id),
      create: (request) => createCommonItem("/common/destinations", request),
      update: (id, request) => updateCommonItem("/common/destinations", id, request),
      delete: (id) => deactivateCommonItem("/common/destinations", id),
      restore: (id) => activateCommonItem("/common/destinations", id),
    },
    toRequest: (values: CommonUpsertFormValues): DestinationUpsertRequest => ({
      name: String(values.name ?? "").trim(),
      countryId: Number(values.countryId ?? 0) || undefined,
      cityId: Number(values.cityId ?? 0) || undefined,
    }),
    toFormValues: (item) => ({
      name: item.name,
      countryId: item.countryId ?? "",
      cityId: item.cityId ?? "",
      isActive: item.isActive,
    }),
  },
  currencies: {
    slug: "currencies",
    menuTitle: "Currencies",
    entityLabel: "Currency",
    pageTitle: "Currency Management",
    pageDescription: "Manage reusable currency masters for pricing and finance workflows.",
    searchPlaceholder: "Search currencies by name, code, or symbol",
    fields: [
      { key: "name", label: "Currency Name", required: true, placeholder: "Enter currency name" },
      { key: "code", label: "Currency Code", required: true, placeholder: "Enter currency code" },
      { key: "symbol", label: "Symbol", required: true, placeholder: "Enter currency symbol" },
    ],
    columns: [
      { id: "name", header: "Currency Name", accessor: (item) => item.name },
      { id: "code", header: "Code", accessor: (item) => item.code ?? "" },
      { id: "symbol", header: "Symbol", accessor: (item) => item.symbol ?? "" },
    ],
    api: {
      list: () => listCommonItems("/common/currencies"),
      getById: (id) => getCommonItemById("/common/currencies", id),
      create: (request) => createCommonItem("/common/currencies", request),
      update: (id, request) => updateCommonItem("/common/currencies", id, request),
      delete: (id) => deactivateCommonItem("/common/currencies", id),
      restore: (id) => activateCommonItem("/common/currencies", id),
    },
    toRequest: (values: CommonUpsertFormValues): CurrencyUpsertRequest => ({
      name: String(values.name ?? "").trim(),
      code: String(values.code ?? "").trim(),
      symbol: String(values.symbol ?? "").trim(),
    }),
  },
  warehouses: {
    slug: "warehouses",
    menuTitle: "Warehouses",
    entityLabel: "Warehouse",
    pageTitle: "Warehouse Management",
    pageDescription: "Manage reusable warehouse masters for logistics and inventory operations.",
    searchPlaceholder: "Search warehouses by name or location",
    fields: [
      { key: "name", label: "Warehouse Name", required: true, placeholder: "Enter warehouse name" },
      { key: "location", label: "Location", required: true, placeholder: "Enter warehouse location" },
      {
        key: "vendorId",
        label: "Vendor Company",
        type: "select",
        parseAs: "number",
        placeholder: "Platform warehouse",
        loadOptions: async () => {
          const vendors = await getVendors()
          return vendors.map((vendor) => ({
            value: vendor.id,
            label: vendor.companyName,
          }))
        },
      },
    ],
    columns: [
      { id: "name", header: "Warehouse Name", accessor: (item) => item.name },
      { id: "location", header: "Location", accessor: (item) => item.location ?? "" },
      { id: "vendorCompany", header: "Vendor Company", accessor: (item) => item.vendorCompanyName ?? "Platform" },
    ],
    api: {
      list: () => listCommonItems("/common/warehouses"),
      getById: (id) => getCommonItemById("/common/warehouses", id),
      create: (request) => createCommonItem("/common/warehouses", request),
      update: (id, request) => updateCommonItem("/common/warehouses", id, request),
      delete: (id) => deactivateCommonItem("/common/warehouses", id),
      restore: (id) => activateCommonItem("/common/warehouses", id),
    },
    toRequest: (values: CommonUpsertFormValues): WarehouseUpsertRequest => ({
      name: String(values.name ?? "").trim(),
      location: String(values.location ?? "").trim(),
      vendorId: Number(values.vendorId ?? 0) || undefined,
    }),
    toFormValues: (item) => ({
      name: item.name,
      location: item.location ?? "",
      vendorId: item.vendorId ?? "",
      isActive: item.isActive,
    }),
  },
  "payment-terms": {
    slug: "payment-terms",
    menuTitle: "Payment Terms",
    entityLabel: "Payment Term",
    pageTitle: "Payment Term Management",
    pageDescription: "Manage reusable payment term masters for finance and vendor workflows.",
    searchPlaceholder: "Search payment terms by name or days",
    fields: [
      { key: "name", label: "Payment Term Name", required: true, placeholder: "Enter payment term name" },
      { key: "days", label: "Days", type: "number", parseAs: "number", required: true, placeholder: "Enter number of days" },
    ],
    columns: [
      { id: "name", header: "Payment Term Name", accessor: (item) => item.name },
      { id: "days", header: "Days", accessor: (item) => item.days ?? 0 },
    ],
    api: {
      list: () => listCommonItems("/common/payment-terms"),
      getById: (id) => getCommonItemById("/common/payment-terms", id),
      create: (request) => createCommonItem("/common/payment-terms", request),
      update: (id, request) => updateCommonItem("/common/payment-terms", id, request),
      delete: (id) => deactivateCommonItem("/common/payment-terms", id),
      restore: (id) => activateCommonItem("/common/payment-terms", id),
    },
    toRequest: (values: CommonUpsertFormValues): PaymentTermUpsertRequest => ({
      name: String(values.name ?? "").trim(),
      days: Number(values.days ?? 0),
    }),
  },
} satisfies Record<string, CommonMasterDefinition>

export type CommonMasterKey = keyof typeof commonMasterDefinitions

export const commonMenuItems = [
  "brands",
  "colours",
  "sizes",
  "units",
  "hsn-codes",
  "product-groups",
  "product-types",
  "contact-types",
  "gst-percents",
  "countries",
  "states",
  "districts",
  "cities",
  "pincodes",
  "order-types",
  "styles",
  "transports",
  "destinations",
  "currencies",
  "warehouses",
  "payment-terms",
].map((key) => {
  const definition = commonMasterDefinitions[key as CommonMasterKey]
  return {
    title: definition.menuTitle,
    url: `/admin/common/${definition.slug}`,
  }
})
