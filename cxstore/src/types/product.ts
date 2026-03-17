export interface ProductCategory {
  id: number
  name: string
  slug: string
  isActive: boolean
}

export interface ProductVariant {
  id: number
  sku: string
  variantName: string
  price: number
  costPrice: number
  inventoryQuantity: number
  isActive: boolean
}

export interface ProductPrice {
  id: number
  productVariantId?: number | null
  priceType: string
  salesChannel: string
  minQuantity: number
  price: number
  currencyId?: number | null
  currencyName: string
  startDate?: string | null
  endDate?: string | null
}

export interface ProductImage {
  id: number
  imageUrl: string
  altText: string
  isPrimary: boolean
  sortOrder: number
}

export interface ProductInventory {
  id: number
  warehouseId?: number | null
  warehouseName: string
  quantity: number
  reservedQuantity: number
  reorderLevel: number
}

export interface ProductVendorLink {
  id: number
  vendorUserId: string
  vendorId?: number | null
  vendorCompanyName: string
  vendorName: string
  vendorSku: string
  vendorSpecificPrice: number
  vendorInventory: number
}

export interface ProductAttributeValue {
  id: number
  value: string
  productVariantId?: number | null
}

export interface ProductAttribute {
  id: number
  name: string
  values: ProductAttributeValue[]
}

export interface ProductSummary {
  id: number
  ownerUserId: string
  vendorUserId?: string | null
  vendorId?: number | null
  vendorCompanyName: string
  vendorName: string
  groupId?: number | null
  groupName: string
  typeId?: number | null
  typeName: string
  categoryId?: number | null
  categoryName: string
  unitId?: number | null
  unitName: string
  currencyId?: number | null
  currencyName: string
  gstPercentId?: number | null
  gstPercent?: number | null
  sku: string
  name: string
  slug: string
  basePrice: number
  costPrice: number
  isPublished: boolean
  isActive: boolean
  totalInventory: number
  averageRating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface ProductDetail extends ProductSummary {
  shortDescription: string
  description: string
  brandId?: number | null
  brandName: string
  hsnCodeId?: number | null
  hsnCode: string
  variants: ProductVariant[]
  prices: ProductPrice[]
  images: ProductImage[]
  inventory: ProductInventory[]
  vendorLinks: ProductVendorLink[]
  attributes: ProductAttribute[]
}

export interface ProductVariantInput {
  sku: string
  variantName: string
  price: number
  costPrice: number
  inventoryQuantity: number
}

export interface ProductPriceInput {
  productVariantId?: number | null
  priceType: string
  salesChannel: string
  minQuantity: number
  price: number
  currencyId?: number | null
  startDate?: string | null
  endDate?: string | null
}

export interface ProductImageInput {
  imageUrl: string
  altText: string
  isPrimary: boolean
  sortOrder: number
}

export interface ProductInventoryInput {
  warehouseId?: number | null
  quantity: number
  reservedQuantity: number
  reorderLevel: number
}

export interface ProductVendorLinkInput {
  vendorUserId: string
  vendorSku: string
  vendorSpecificPrice: number
  vendorInventory: number
}

export interface ProductAttributeValueInput {
  value: string
  variantIndex?: number | null
}

export interface ProductAttributeInput {
  name: string
  values: ProductAttributeValueInput[]
}

export interface ProductUpsertRequest {
  vendorUserId?: string | null
  groupId?: number | null
  typeId?: number | null
  categoryId?: number | null
  unitId?: number | null
  currencyId?: number | null
  gstPercentId?: number | null
  brandId?: number | null
  hsnCodeId?: number | null
  sku: string
  name: string
  slug: string
  shortDescription: string
  description: string
  basePrice: number
  costPrice: number
  isPublished: boolean
  isActive: boolean
  variants: ProductVariantInput[]
  prices: ProductPriceInput[]
  images: ProductImageInput[]
  inventory: ProductInventoryInput[]
  vendorLinks: ProductVendorLinkInput[]
  attributes: ProductAttributeInput[]
}
