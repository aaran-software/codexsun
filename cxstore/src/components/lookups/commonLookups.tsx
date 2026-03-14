import type { CommonMasterItem } from "@/types/common"
import { commonMasterDefinitions, type CommonMasterKey } from "@/lib/common-master-registry"
import { AutocompleteLookup, type LookupOption } from "@/components/lookups/AutocompleteLookup"

type CommonMasterLookupProps = {
  masterKey: CommonMasterKey
  value: string
  onChange: (value: string) => void
  options: LookupOption[]
  onOptionsChange?: (options: LookupOption[]) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  createContext?: {
    countryId?: number | null
    stateId?: number | null
    districtId?: number | null
  }
}

type LocationLookupProps = Omit<CommonMasterLookupProps, "masterKey" | "createContext">

export function CommonMasterLookup({
  masterKey,
  value,
  onChange,
  options,
  onOptionsChange,
  placeholder,
  disabled,
  required,
  createContext,
}: CommonMasterLookupProps) {
  return (
    <AutocompleteLookup
      value={value}
      onChange={onChange}
      options={options}
      onOptionsChange={onOptionsChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      createOption={async (label) => {
        const created = await createCommonMasterItem(masterKey, label, createContext)
        return mapCommonItemToLookupOption(masterKey, created)
      }}
    />
  )
}

export function CountryLookup(props: LocationLookupProps) {
  return <CommonMasterLookup {...props} masterKey="countries" />
}

export function StateLookup({ options, ...props }: LocationLookupProps & { countryId?: number | null }) {
  const filteredOptions = props.countryId ? options.filter((option) => option.parentValue === String(props.countryId)) : options
  return <CommonMasterLookup {...props} masterKey="states" options={filteredOptions} createContext={{ countryId: props.countryId }} />
}

export function DistrictLookup({ options, ...props }: LocationLookupProps & { stateId?: number | null }) {
  const filteredOptions = props.stateId ? options.filter((option) => option.parentValue === String(props.stateId)) : options
  return <CommonMasterLookup {...props} masterKey="districts" options={filteredOptions} createContext={{ stateId: props.stateId }} />
}

export function CityLookup({ options, ...props }: LocationLookupProps & { districtId?: number | null }) {
  const filteredOptions = props.districtId ? options.filter((option) => option.parentValue === String(props.districtId)) : options
  return <CommonMasterLookup {...props} masterKey="cities" options={filteredOptions} createContext={{ districtId: props.districtId }} />
}

export function mapCommonItemToLookupOption(masterKey: CommonMasterKey, item: CommonMasterItem): LookupOption {
  switch (masterKey) {
    case "gst-percents":
      return { value: String(item.id), label: `${item.percentage ?? item.name}%` }
    case "hsn-codes":
      return { value: String(item.id), label: item.code ?? item.name }
    case "states":
      return { value: String(item.id), label: item.name, parentValue: String(item.countryId ?? "") }
    case "districts":
      return { value: String(item.id), label: item.name, parentValue: String(item.stateId ?? "") }
    case "cities":
      return { value: String(item.id), label: item.name, parentValue: String(item.districtId ?? "") }
    default:
      return { value: String(item.id), label: item.name }
  }
}

function createCommonMasterItem(
  masterKey: CommonMasterKey,
  label: string,
  createContext?: CommonMasterLookupProps["createContext"],
) {
  const definition = commonMasterDefinitions[masterKey]
  const trimmedLabel = label.trim()

  switch (masterKey) {
    case "states":
      if (!createContext?.countryId) {
        throw new Error("Select a country before creating a state.")
      }

      return definition.api.create({
        name: trimmedLabel,
        stateCode: buildCode(trimmedLabel, 3),
        countryId: createContext.countryId,
      })
    case "districts":
      if (!createContext?.stateId) {
        throw new Error("Select a state before creating a district.")
      }

      return definition.api.create({
        name: trimmedLabel,
        stateId: createContext.stateId,
      })
    case "cities":
      if (!createContext?.districtId) {
        throw new Error("Select a district before creating a city.")
      }

      return definition.api.create({
        name: trimmedLabel,
        districtId: createContext.districtId,
      })
    case "units":
      return definition.api.create({
        name: trimmedLabel,
        shortName: buildCode(trimmedLabel, 4),
      })
    case "hsn-codes":
      return definition.api.create({
        code: buildCode(trimmedLabel, 8),
        description: trimmedLabel,
      })
    case "currencies":
      return definition.api.create({
        name: trimmedLabel,
        code: buildCode(trimmedLabel, 3),
        symbol: trimmedLabel.slice(0, 1).toUpperCase() || buildCode(trimmedLabel, 1),
      })
    case "warehouses":
      return definition.api.create({
        name: trimmedLabel,
        location: trimmedLabel,
      })
    case "payment-terms": {
      const days = Number.parseInt(trimmedLabel.replace(/[^\d]/g, ""), 10)
      if (!Number.isFinite(days)) {
        throw new Error("Enter a numeric value to create a payment term.")
      }

      return definition.api.create({
        name: trimmedLabel,
        days,
      })
    }
    case "gst-percents": {
      const percentage = Number.parseFloat(trimmedLabel.replace(/[^\d.]/g, ""))
      if (!Number.isFinite(percentage)) {
        throw new Error("Enter a numeric value to create a GST percent.")
      }

      return definition.api.create({
        percentage,
      })
    }
    default:
      return definition.api.create({
        name: trimmedLabel,
      })
  }
}

function buildCode(value: string, length: number) {
  const compact = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, length)

  return compact.padEnd(length, "X")
}
