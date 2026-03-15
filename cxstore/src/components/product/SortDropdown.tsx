import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProductSortOption } from "@/types/storefront"

const options: { label: string; value: ProductSortOption }[] = [
  { label: "Featured", value: "featured" },
  { label: "Latest", value: "latest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name", value: "name-asc" },
  { label: "Inventory", value: "inventory-desc" },
]

export function SortDropdown({ value, onChange }: { value: ProductSortOption; onChange: (value: ProductSortOption) => void }) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as ProductSortOption)}>
      <SelectTrigger className="w-full rounded-full bg-card md:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
