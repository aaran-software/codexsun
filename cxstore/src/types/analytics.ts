export interface VendorTopProduct {
  productId: number
  productName: string
  totalQuantity: number
  totalRevenue: number
}

export interface VendorSalesSummary {
  vendorId: number
  vendorCompanyName: string
  totalOrders: number
  totalSales: number
  totalEarnings: number
  periodStart: string
  periodEnd: string
  topProducts: VendorTopProduct[]
}

export interface ProductSalesSummary {
  productId: number
  productName: string
  totalQuantity: number
  totalRevenue: number
  periodStart: string
  periodEnd: string
}

export interface SalesOverview {
  totalOrders: number
  totalSales: number
  totalTax: number
  totalDiscounts: number
  totalVendorEarnings: number
  periodStart: string
  periodEnd: string
}
