export interface CartItem {
  id: number
  productId: number
  productName: string
  productSku: string
  productVariantId?: number | null
  productVariantName: string
  vendorUserId?: string | null
  vendorName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Cart {
  id: number
  userId?: string | null
  sessionId: string
  currencyId?: number | null
  currencyName: string
  subtotal: number
  totalItems: number
  items: CartItem[]
}

export interface OrderAddress {
  id: number
  contactId?: number | null
  addressType: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  productSku: string
  productVariantId?: number | null
  productVariantName: string
  vendorUserId?: string | null
  vendorName: string
  quantity: number
  unitPrice: number
  taxAmount: number
  totalPrice: number
}

export interface OrderStatusHistory {
  id: number
  status: string
  notes: string
  createdAt: string
}

export interface OrderSummary {
  id: number
  orderNumber: string
  customerContactId?: number | null
  customerName: string
  orderStatus: string
  paymentStatus: string
  currencyName: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  itemCount: number
  createdAt: string
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[]
  statusHistory: OrderStatusHistory[]
  addresses: OrderAddress[]
}

export interface InvoiceItem {
  id: number
  productId?: number | null
  description: string
  quantity: number
  unitPrice: number
  taxAmount: number
  totalAmount: number
}

export interface InvoiceSummary {
  id: number
  invoiceNumber: string
  orderId?: number | null
  orderNumber: string
  customerContactId?: number | null
  customerName: string
  currencyName: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: string
  issuedDate: string
  dueDate?: string | null
}

export interface InvoiceDetail extends InvoiceSummary {
  items: InvoiceItem[]
}

export interface PaymentSummary {
  id: number
  invoiceId: number
  invoiceNumber: string
  paymentMethodName: string
  currencyName: string
  amount: number
  status: string
  transactionReference: string
  paidAt?: string | null
  createdAt: string
}

export interface VendorEarning {
  id: number
  vendorId?: number | null
  vendorCompanyName: string
  orderId: number
  orderNumber: string
  productId: number
  productName: string
  saleAmount: number
  commissionAmount: number
  vendorAmount: number
  isSettled: boolean
}

export interface VendorPayoutSummary {
  id: number
  vendorUserId: string
  vendorId?: number | null
  vendorCompanyName: string
  vendorName: string
  payoutNumber: string
  currencyName: string
  amount: number
  status: string
  requestedAt: string
  processedAt?: string | null
  earnings: VendorEarning[]
}

export interface OrderAddressRequest {
  contactId?: number | null
  addressType: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface CreateOrderRequest {
  cartId?: number | null
  sessionId: string
  customerContactId?: number | null
  currencyId?: number | null
  discountAmount: number
  invoiceDueDate?: string | null
  billingAddress: OrderAddressRequest
  shippingAddress: OrderAddressRequest
}

export interface RecordPaymentRequest {
  invoiceId: number
  paymentModeId?: number | null
  amount: number
  currencyId?: number | null
  transactionReference: string
  provider: string
}
