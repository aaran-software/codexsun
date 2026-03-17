import type { ProductDetail, ProductPrice, ProductSummary } from "@/types/product"
import type { CatalogFilters, ProductSortOption } from "@/types/storefront"

const ADDRESS_STORAGE_KEY = "cxstore.storefront.addresses"

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function resolveCurrencyCode(currencyValue?: string | null) {
  const candidate = (currencyValue ?? "").trim().toUpperCase()
  if (/^[A-Z]{3}$/.test(candidate)) {
    return candidate
  }

  const namedCurrencyMap: Record<string, string> = {
    "INDIAN RUPEE": "INR",
    "RUPEE": "INR",
    "US DOLLAR": "USD",
    "DOLLAR": "USD",
    "EURO": "EUR",
    "POUND": "GBP",
    "POUND STERLING": "GBP",
  }

  return namedCurrencyMap[candidate] ?? "INR"
}

export function formatCurrency(amount: number, currencyValue = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: resolveCurrencyCode(currencyValue),
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

export function getPrimaryProductImage(product: Pick<ProductDetail, "images"> | Pick<ProductSummary, "id">) {
  if ("images" in product) {
    return product.images.find((image) => image.isPrimary)?.imageUrl
      ?? product.images[0]?.imageUrl
      ?? `https://placehold.co/800x800/f4f1ea/2d2418?text=Product+${product.images.length || ""}`
  }

  return `https://placehold.co/800x800/f4f1ea/2d2418?text=Product+${product.id}`
}

export function getActiveOfferPrice(prices: ProductPrice[]) {
  const now = Date.now()
  const offers = prices.filter((price) =>
    price.priceType === "Offer"
    && (!price.startDate || new Date(price.startDate).getTime() <= now)
    && (!price.endDate || new Date(price.endDate).getTime() >= now))

  return offers.sort((left, right) => left.price - right.price)[0]?.price ?? null
}

export function getDisplayPrice(product: Pick<ProductSummary, "basePrice"> | Pick<ProductDetail, "prices" | "basePrice">) {
  if ("prices" in product) {
    return getActiveOfferPrice(product.prices) ?? product.basePrice
  }

  return product.basePrice
}

export function getInventoryStatus(product: Pick<ProductSummary, "totalInventory">) {
  if (product.totalInventory <= 0) {
    return "Out of stock"
  }

  if (product.totalInventory < 10) {
    return "Low stock"
  }

  return "In stock"
}

export function sortProducts(products: ProductSummary[], sort: ProductSortOption) {
  const sorted = [...products]

  switch (sort) {
    case "latest":
      return sorted.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    case "price-asc":
      return sorted.sort((left, right) => left.basePrice - right.basePrice)
    case "price-desc":
      return sorted.sort((left, right) => right.basePrice - left.basePrice)
    case "name-asc":
      return sorted.sort((left, right) => left.name.localeCompare(right.name))
    case "inventory-desc":
      return sorted.sort((left, right) => right.totalInventory - left.totalInventory)
    case "featured":
    default:
      return sorted.sort((left, right) => Number(right.isPublished) - Number(left.isPublished) || right.totalInventory - left.totalInventory)
  }
}

export function filterProducts(products: ProductSummary[], filters: CatalogFilters) {
  return products.filter((product) => {
    const withinPrice = product.basePrice >= filters.minPrice && product.basePrice <= filters.maxPrice
    const matchesBrand = !filters.brand || product.name.toLowerCase().includes(filters.brand.toLowerCase())
    const matchesVendor = !filters.vendor
      || product.vendorCompanyName.toLowerCase().includes(filters.vendor.toLowerCase())
      || product.vendorName.toLowerCase().includes(filters.vendor.toLowerCase())
    const matchesAvailability = !filters.availabilityOnly || product.totalInventory > 0
    const matchesRating = filters.rating <= 0 || product.averageRating >= filters.rating

    return withinPrice && matchesBrand && matchesVendor && matchesAvailability && matchesRating
  })
}

export function getStoredAddresses() {
  return readJson<string[]>(ADDRESS_STORAGE_KEY, [])
}

export function saveStoredAddress(address: string) {
  const current = getStoredAddresses()
  if (!current.includes(address)) {
    writeJson(ADDRESS_STORAGE_KEY, [address, ...current])
  }
}
