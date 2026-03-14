import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { PlusIcon } from "lucide-react"

import { getUsers } from "@/api/userApi"
import { listCommonItems } from "@/api/commonApi"
import { getProductCategories } from "@/api/productApi"
import { AutocompleteLookup, type LookupOption } from "@/components/lookups/AutocompleteLookup"
import { CommonMasterLookup, mapCommonItemToLookupOption } from "@/components/lookups/commonLookups"
import { useAuth } from "@/state/authStore"
import type { AdminUserSummary } from "@/types/admin"
import type { ProductDetail, ProductUpsertRequest } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ProductFormProps = {
  title: string
  description: string
  submitLabel: string
  initialValue?: ProductDetail | null
  onSubmit: (request: ProductUpsertRequest) => Promise<void>
}

type AttributeEditor = {
  name: string
  valuesText: string
}

type ProductFormState = Omit<ProductUpsertRequest, "attributes"> & {
  attributes: AttributeEditor[]
}

function createEmptyState(): ProductFormState {
  return {
    vendorUserId: null,
    groupId: null,
    typeId: null,
    categoryId: null,
    unitId: null,
    currencyId: null,
    gstPercentId: null,
    brandId: null,
    hsnCodeId: null,
    sku: "",
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    basePrice: 0,
    costPrice: 0,
    isPublished: true,
    isActive: true,
    variants: [{ sku: "", variantName: "", price: 0, costPrice: 0, inventoryQuantity: 0 }],
    prices: [{ priceType: "Retail", amount: 0, currencyId: null }],
    images: [{ imageUrl: "", altText: "", isPrimary: true, sortOrder: 1 }],
    inventory: [{ warehouseId: null, quantity: 0, reservedQuantity: 0, reorderLevel: 0 }],
    vendorLinks: [],
    attributes: [{ name: "", valuesText: "" }],
  }
}

function fromDetail(detail: ProductDetail): ProductFormState {
  return {
    vendorUserId: detail.vendorUserId ?? null,
    groupId: detail.groupId ?? null,
    typeId: detail.typeId ?? null,
    categoryId: detail.categoryId ?? null,
    unitId: detail.unitId ?? null,
    currencyId: detail.currencyId ?? null,
    gstPercentId: detail.gstPercentId ?? null,
    brandId: detail.brandId ?? null,
    hsnCodeId: detail.hsnCodeId ?? null,
    sku: detail.sku,
    name: detail.name,
    slug: detail.slug,
    shortDescription: detail.shortDescription,
    description: detail.description,
    basePrice: detail.basePrice,
    costPrice: detail.costPrice,
    isPublished: detail.isPublished,
    isActive: detail.isActive,
    variants: detail.variants.length > 0 ? detail.variants.map((variant) => ({ sku: variant.sku, variantName: variant.variantName, price: variant.price, costPrice: variant.costPrice, inventoryQuantity: variant.inventoryQuantity })) : createEmptyState().variants,
    prices: detail.prices.length > 0 ? detail.prices.map((price) => ({ priceType: price.priceType, amount: price.amount, currencyId: price.currencyId ?? null })) : createEmptyState().prices,
    images: detail.images.length > 0 ? detail.images.map((image) => ({ imageUrl: image.imageUrl, altText: image.altText, isPrimary: image.isPrimary, sortOrder: image.sortOrder })) : createEmptyState().images,
    inventory: detail.inventory.length > 0 ? detail.inventory.map((item) => ({ warehouseId: item.warehouseId ?? null, quantity: item.quantity, reservedQuantity: item.reservedQuantity, reorderLevel: item.reorderLevel })) : createEmptyState().inventory,
    vendorLinks: detail.vendorLinks.map((link) => ({ vendorUserId: link.vendorUserId, vendorSku: link.vendorSku, vendorSpecificPrice: link.vendorSpecificPrice, vendorInventory: link.vendorInventory })),
    attributes: detail.attributes.length > 0 ? detail.attributes.map((attribute) => ({ name: attribute.name, valuesText: attribute.values.map((value) => value.value).join(", ") })) : createEmptyState().attributes,
  }
}

export function ProductForm({ title, description, submitLabel, initialValue, onSubmit }: ProductFormProps) {
  const auth = useAuth()
  const [form, setForm] = useState<ProductFormState>(initialValue ? fromDetail(initialValue) : createEmptyState())
  const [vendors, setVendors] = useState<LookupOption[]>([])
  const [categories, setCategories] = useState<LookupOption[]>([])
  const [groups, setGroups] = useState<LookupOption[]>([])
  const [types, setTypes] = useState<LookupOption[]>([])
  const [units, setUnits] = useState<LookupOption[]>([])
  const [currencies, setCurrencies] = useState<LookupOption[]>([])
  const [gstPercents, setGstPercents] = useState<LookupOption[]>([])
  const [brands, setBrands] = useState<LookupOption[]>([])
  const [hsnCodes, setHsnCodes] = useState<LookupOption[]>([])
  const [warehouses, setWarehouses] = useState<LookupOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(initialValue ? fromDetail(initialValue) : createEmptyState())
  }, [initialValue])

  useEffect(() => {
    void Promise.all([
      auth.user?.role === "Admin" ? getUsers() : Promise.resolve([] as AdminUserSummary[]),
      getProductCategories(),
      listCommonItems("/common/product-groups"),
      listCommonItems("/common/product-types"),
      listCommonItems("/common/units"),
      listCommonItems("/common/currencies"),
      listCommonItems("/common/gst-percents"),
      listCommonItems("/common/brands"),
      listCommonItems("/common/hsn-codes"),
      listCommonItems("/common/warehouses"),
    ]).then(([users, categoryItems, groupItems, typeItems, unitItems, currencyItems, gstItems, brandItems, hsnItems, warehouseItems]) => {
      setVendors(users.filter((user) => user.role === "Vendor" && !user.isDeleted).map((user) => ({ value: user.id, label: user.username })))
      setCategories(categoryItems.filter((item) => item.isActive).map((item) => ({ value: String(item.id), label: item.name })))
      setGroups(groupItems.filter((item) => item.isActive).map((item) => mapCommonItemToLookupOption("product-groups", item)))
      setTypes(typeItems.filter((item) => item.isActive).map((item) => mapCommonItemToLookupOption("product-types", item)))
      setUnits(unitItems.filter((item) => item.isActive).map((item) => mapCommonItemToLookupOption("units", item)))
      setCurrencies(currencyItems.filter((item) => item.isActive).map((item) => mapCommonItemToLookupOption("currencies", item)))
      setGstPercents(gstItems.filter((item) => item.isActive).map((item) => mapCommonItemToLookupOption("gst-percents", item)))
      setBrands(brandItems.filter((item) => item.isActive).map((item) => mapCommonItemToLookupOption("brands", item)))
      setHsnCodes(hsnItems.filter((item) => item.isActive).map((item) => mapCommonItemToLookupOption("hsn-codes", item)))
      setWarehouses(warehouseItems.filter((item) => item.isActive).map((item) => mapCommonItemToLookupOption("warehouses", item)))
    }).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to load form data.")
    })
  }, [auth.user?.role])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await onSubmit({
        ...form,
        vendorUserId: auth.user?.role === "Vendor" ? auth.user.id : form.vendorUserId || null,
        attributes: form.attributes
          .filter((attribute) => attribute.name.trim().length > 0)
          .map((attribute) => ({
            name: attribute.name.trim(),
            values: attribute.valuesText
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
              .map((value) => ({ value })),
          })),
      })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save product.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-3 border-b bg-muted/10 px-7 py-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-7 py-7">
        {error ? <div className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <form className="space-y-8" onSubmit={handleSubmit}>
          <FormSection title="Catalog Details" description="Primary identity, catalog classification, and vendor ownership for this product.">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="SKU" required>
                <Input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} required />
              </Field>
              <Field label="Product Name" required className="xl:col-span-2">
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </Field>
              <Field label="Slug">
                <Input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="Auto generated if empty" />
              </Field>
              {auth.user?.role === "Admin" ? (
                <Field label="Vendor">
                  <AutocompleteLookup
                    value={form.vendorUserId ?? ""}
                    onChange={(value) => setForm((current) => ({ ...current, vendorUserId: value || null }))}
                    options={vendors}
                    placeholder="Platform default"
                  />
                </Field>
              ) : null}
              <Field label="Product Group">
                <CommonMasterLookup masterKey="product-groups" value={toLookupValue(form.groupId)} onChange={(value) => setForm((current) => ({ ...current, groupId: toNumberOrNull(value) }))} options={groups} onOptionsChange={setGroups} placeholder="Select group" />
              </Field>
              <Field label="Product Type">
                <CommonMasterLookup masterKey="product-types" value={toLookupValue(form.typeId)} onChange={(value) => setForm((current) => ({ ...current, typeId: toNumberOrNull(value) }))} options={types} onOptionsChange={setTypes} placeholder="Select type" />
              </Field>
              <Field label="Product Category">
                <AutocompleteLookup value={toLookupValue(form.categoryId)} onChange={(value) => setForm((current) => ({ ...current, categoryId: toNumberOrNull(value) }))} options={categories} placeholder="Select category" />
              </Field>
              <Field label="Brand">
                <CommonMasterLookup masterKey="brands" value={toLookupValue(form.brandId)} onChange={(value) => setForm((current) => ({ ...current, brandId: toNumberOrNull(value) }))} options={brands} onOptionsChange={setBrands} placeholder="Select brand" />
              </Field>
              <Field label="HSN Code">
                <CommonMasterLookup masterKey="hsn-codes" value={toLookupValue(form.hsnCodeId)} onChange={(value) => setForm((current) => ({ ...current, hsnCodeId: toNumberOrNull(value) }))} options={hsnCodes} onOptionsChange={setHsnCodes} placeholder="Select HSN" />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Pricing And Publishing" description="Base commercial values, taxation, and publish status used for sales and ecommerce.">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Unit">
                <CommonMasterLookup masterKey="units" value={toLookupValue(form.unitId)} onChange={(value) => setForm((current) => ({ ...current, unitId: toNumberOrNull(value) }))} options={units} onOptionsChange={setUnits} placeholder="Select unit" />
              </Field>
              <Field label="Currency">
                <CommonMasterLookup masterKey="currencies" value={toLookupValue(form.currencyId)} onChange={(value) => setForm((current) => ({ ...current, currencyId: toNumberOrNull(value) }))} options={currencies} onOptionsChange={setCurrencies} placeholder="Select currency" />
              </Field>
              <Field label="GST">
                <CommonMasterLookup masterKey="gst-percents" value={toLookupValue(form.gstPercentId)} onChange={(value) => setForm((current) => ({ ...current, gstPercentId: toNumberOrNull(value) }))} options={gstPercents} onOptionsChange={setGstPercents} placeholder="Select GST" />
              </Field>
              <Field label="Base Price">
                <Input type="number" value={form.basePrice} onChange={(event) => setForm((current) => ({ ...current, basePrice: Number(event.target.value) }))} />
              </Field>
              <Field label="Cost Price">
                <Input type="number" value={form.costPrice} onChange={(event) => setForm((current) => ({ ...current, costPrice: Number(event.target.value) }))} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleCard label="Published" checked={form.isPublished} onChange={(checked) => setForm((current) => ({ ...current, isPublished: checked }))} />
              <ToggleCard label="Active" checked={form.isActive} onChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))} />
            </div>
          </FormSection>

          <FormSection title="Descriptions" description="Customer-facing summary and detailed product narrative for catalog and sales channels.">
            <div className="grid gap-5">
              <Field label="Short Description">
                <Textarea value={form.shortDescription} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} rows={3} />
              </Field>
              <Field label="Description">
                <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={7} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Variants" description="Alternate sellable configurations such as size, color, or model combinations.">
            <SectionHeader title="Variant Rows" onAdd={() => setForm((current) => ({ ...current, variants: [...current.variants, { sku: "", variantName: "", price: 0, costPrice: 0, inventoryQuantity: 0 }] }))} />
            <div className="space-y-4">
              {form.variants.map((variant, index) => (
                <InlinePanel key={`variant-${index}`}>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Field label="Variant SKU">
                      <Input value={variant.sku} onChange={(event) => updateArray(setForm, "variants", index, { ...variant, sku: event.target.value })} placeholder="Variant SKU" />
                    </Field>
                    <Field label="Variant Name">
                      <Input value={variant.variantName} onChange={(event) => updateArray(setForm, "variants", index, { ...variant, variantName: event.target.value })} placeholder="Variant name" />
                    </Field>
                    <Field label="Price">
                      <Input type="number" value={variant.price} onChange={(event) => updateArray(setForm, "variants", index, { ...variant, price: Number(event.target.value) })} placeholder="Price" />
                    </Field>
                    <Field label="Cost">
                      <Input type="number" value={variant.costPrice} onChange={(event) => updateArray(setForm, "variants", index, { ...variant, costPrice: Number(event.target.value) })} placeholder="Cost" />
                    </Field>
                    <Field label="Inventory">
                      <div className="flex gap-2">
                        <Input type="number" value={variant.inventoryQuantity} onChange={(event) => updateArray(setForm, "variants", index, { ...variant, inventoryQuantity: Number(event.target.value) })} placeholder="Inventory" />
                        <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "variants", index)}>Remove</Button>
                      </div>
                    </Field>
                  </div>
                </InlinePanel>
              ))}
            </div>
          </FormSection>

          <FormSection title="Price Tiers" description="Additional price levels for retail, wholesale, dealer, or channel-specific pricing.">
            <SectionHeader title="Tier Rows" onAdd={() => setForm((current) => ({ ...current, prices: [...current.prices, { priceType: "", amount: 0, currencyId: current.currencyId }] }))} />
            <div className="space-y-4">
              {form.prices.map((price, index) => (
                <InlinePanel key={`price-${index}`}>
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_220px_auto]">
                    <Field label="Price Type">
                      <Input value={price.priceType} onChange={(event) => updateArray(setForm, "prices", index, { ...price, priceType: event.target.value })} placeholder="Retail, Wholesale..." />
                    </Field>
                    <Field label="Amount">
                      <Input type="number" value={price.amount} onChange={(event) => updateArray(setForm, "prices", index, { ...price, amount: Number(event.target.value) })} placeholder="Amount" />
                    </Field>
                    <Field label="Currency">
                      <CommonMasterLookup masterKey="currencies" value={toLookupValue(price.currencyId)} onChange={(value) => updateArray(setForm, "prices", index, { ...price, currencyId: toNumberOrNull(value) })} options={currencies} onOptionsChange={setCurrencies} placeholder="Currency" />
                    </Field>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "prices", index)}>Remove</Button>
                    </div>
                  </div>
                </InlinePanel>
              ))}
            </div>
          </FormSection>

          <FormSection title="Media" description="Primary and gallery images used in storefront and marketplace presentation.">
            <SectionHeader title="Image Rows" onAdd={() => setForm((current) => ({ ...current, images: [...current.images, { imageUrl: "", altText: "", isPrimary: false, sortOrder: current.images.length + 1 }] }))} />
            <div className="space-y-4">
              {form.images.map((image, index) => (
                <InlinePanel key={`image-${index}`}>
                  <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_150px_100px_auto]">
                    <Field label="Image URL">
                      <Input value={image.imageUrl} onChange={(event) => updateArray(setForm, "images", index, { ...image, imageUrl: event.target.value })} placeholder="Image URL" />
                    </Field>
                    <Field label="Alt Text">
                      <Input value={image.altText} onChange={(event) => updateArray(setForm, "images", index, { ...image, altText: event.target.value })} placeholder="Alt text" />
                    </Field>
                    <Field label="Primary">
                      <Toggle compact label="Primary" checked={image.isPrimary} onChange={(checked) => setForm((current) => ({ ...current, images: current.images.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index ? checked : checked ? false : item.isPrimary })) }))} />
                    </Field>
                    <Field label="Sort Order">
                      <Input type="number" value={image.sortOrder} onChange={(event) => updateArray(setForm, "images", index, { ...image, sortOrder: Number(event.target.value) })} placeholder="Sort" />
                    </Field>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "images", index)}>Remove</Button>
                    </div>
                  </div>
                </InlinePanel>
              ))}
            </div>
          </FormSection>

          <FormSection title="Inventory" description="Warehouse-level stock, reservations, and reorder planning for operations.">
            <SectionHeader title="Inventory Rows" onAdd={() => setForm((current) => ({ ...current, inventory: [...current.inventory, { warehouseId: null, quantity: 0, reservedQuantity: 0, reorderLevel: 0 }] }))} />
            <div className="space-y-4">
              {form.inventory.map((item, index) => (
                <InlinePanel key={`inventory-${index}`}>
                  <div className="grid gap-4 md:grid-cols-[220px_1fr_1fr_1fr_auto]">
                    <Field label="Warehouse">
                      <CommonMasterLookup masterKey="warehouses" value={toLookupValue(item.warehouseId)} onChange={(value) => updateArray(setForm, "inventory", index, { ...item, warehouseId: toNumberOrNull(value) })} options={warehouses} onOptionsChange={setWarehouses} placeholder="Warehouse" />
                    </Field>
                    <Field label="Quantity">
                      <Input type="number" value={item.quantity} onChange={(event) => updateArray(setForm, "inventory", index, { ...item, quantity: Number(event.target.value) })} placeholder="Quantity" />
                    </Field>
                    <Field label="Reserved">
                      <Input type="number" value={item.reservedQuantity} onChange={(event) => updateArray(setForm, "inventory", index, { ...item, reservedQuantity: Number(event.target.value) })} placeholder="Reserved" />
                    </Field>
                    <Field label="Reorder Level">
                      <Input type="number" value={item.reorderLevel} onChange={(event) => updateArray(setForm, "inventory", index, { ...item, reorderLevel: Number(event.target.value) })} placeholder="Reorder level" />
                    </Field>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "inventory", index)}>Remove</Button>
                    </div>
                  </div>
                </InlinePanel>
              ))}
            </div>
          </FormSection>

          {auth.user?.role === "Admin" ? (
            <FormSection title="Vendor Links" description="Vendor-specific SKUs, prices, and stock for marketplace or B2B sourcing flows.">
              <SectionHeader title="Vendor Rows" onAdd={() => setForm((current) => ({ ...current, vendorLinks: [...current.vendorLinks, { vendorUserId: "", vendorSku: "", vendorSpecificPrice: 0, vendorInventory: 0 }] }))} />
              <div className="space-y-4">
                {form.vendorLinks.map((item, index) => (
                  <InlinePanel key={`vendor-link-${index}`}>
                    <div className="grid gap-4 md:grid-cols-[220px_1fr_1fr_1fr_auto]">
                      <Field label="Vendor">
                        <AutocompleteLookup value={item.vendorUserId} onChange={(value) => updateArray(setForm, "vendorLinks", index, { ...item, vendorUserId: value })} options={vendors} placeholder="Vendor" />
                      </Field>
                      <Field label="Vendor SKU">
                        <Input value={item.vendorSku} onChange={(event) => updateArray(setForm, "vendorLinks", index, { ...item, vendorSku: event.target.value })} placeholder="Vendor SKU" />
                      </Field>
                      <Field label="Vendor Price">
                        <Input type="number" value={item.vendorSpecificPrice} onChange={(event) => updateArray(setForm, "vendorLinks", index, { ...item, vendorSpecificPrice: Number(event.target.value) })} placeholder="Vendor price" />
                      </Field>
                      <Field label="Vendor Inventory">
                        <Input type="number" value={item.vendorInventory} onChange={(event) => updateArray(setForm, "vendorLinks", index, { ...item, vendorInventory: Number(event.target.value) })} placeholder="Vendor inventory" />
                      </Field>
                      <div className="flex items-end">
                        <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "vendorLinks", index)}>Remove</Button>
                      </div>
                    </div>
                  </InlinePanel>
                ))}
              </div>
            </FormSection>
          ) : null}

          <FormSection title="Attributes" description="Reusable descriptive attributes for merchandising, filtering, and product detail display.">
            <SectionHeader title="Attribute Rows" onAdd={() => setForm((current) => ({ ...current, attributes: [...current.attributes, { name: "", valuesText: "" }] }))} />
            <div className="space-y-4">
              {form.attributes.map((attribute, index) => (
                <InlinePanel key={`attribute-${index}`}>
                  <div className="grid gap-4 md:grid-cols-[220px_1fr_auto]">
                    <Field label="Attribute Name">
                      <Input value={attribute.name} onChange={(event) => updateArray(setForm, "attributes", index, { ...attribute, name: event.target.value })} placeholder="Attribute name" />
                    </Field>
                    <Field label="Values">
                      <Input value={attribute.valuesText} onChange={(event) => updateArray(setForm, "attributes", index, { ...attribute, valuesText: event.target.value })} placeholder="Values separated by comma" />
                    </Field>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={() => removeArrayItem(setForm, "attributes", index)}>Remove</Button>
                    </div>
                  </div>
                </InlinePanel>
              ))}
            </div>
          </FormSection>

          <div className="flex justify-end border-t pt-6">
            <Button type="submit" className="min-w-36" disabled={submitting}>
              {submitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function toLookupValue(value: number | null | undefined) {
  return value ? String(value) : ""
}

function toNumberOrNull(value: string) {
  return value ? Number(value) : null
}

function updateArray<T extends keyof ProductFormState>(
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>,
  key: T,
  index: number,
  value: ProductFormState[T] extends Array<infer TItem> ? TItem : never,
) {
  setForm((current) => ({
    ...current,
    [key]: (current[key] as unknown[]).map((item, itemIndex) => itemIndex === index ? value : item),
  }))
}

function removeArrayItem<T extends keyof ProductFormState>(setForm: React.Dispatch<React.SetStateAction<ProductFormState>>, key: T, index: number) {
  setForm((current) => {
    const items = (current[key] as unknown[]).filter((_, itemIndex) => itemIndex !== index)
    return {
      ...current,
      [key]: items.length > 0 ? items : createEmptyState()[key],
    }
  })
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5 rounded-2xl border border-border/70 bg-muted/20 p-6 md:p-7">
      <div className="space-y-1.5 border-b border-border/60 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Section</p>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  required = false,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("grid gap-2.5 text-sm", className)}>
      <span className="font-medium text-foreground/90">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <Button type="button" variant="outline" className="gap-2" onClick={onAdd}>
        <PlusIcon className="size-4" />
        <span>Add</span>
      </Button>
    </div>
  )
}

function InlinePanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border border-border/70 bg-background p-4 shadow-sm", className)}>
      {children}
    </div>
  )
}

function ToggleCard({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors", checked ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border/70 bg-background")}>
      <span className="font-medium text-foreground">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
  compact = false,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  compact?: boolean
}) {
  return (
    <label className={cn("flex items-center gap-2 text-sm", compact ? "justify-start" : "justify-between")}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}
