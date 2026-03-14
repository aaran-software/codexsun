import { useEffect, useState } from "react"

import { createProductCategory, getProductCategories } from "@/api/productApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ProductCategory } from "@/types/product"

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [error, setError] = useState<string | null>(null)

  const loadCategories = async () => {
    setLoading(true)
    setError(null)

    try {
      setCategories(await getProductCategories(true))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load categories.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const filteredCategories = categories.filter((category) => {
    const normalizedSearch = searchValue.trim().toLowerCase()
    return normalizedSearch.length === 0
      || category.name.toLowerCase().includes(normalizedSearch)
      || category.slug.toLowerCase().includes(normalizedSearch)
  })

  const columns: CommonListColumn<ProductCategory>[] = [
    { id: "name", header: "Category", accessor: (item) => item.name, sortable: true, cell: (item) => item.name },
    { id: "slug", header: "Slug", accessor: (item) => item.slug, sortable: true, cell: (item) => item.slug },
    { id: "status", header: "Status", accessor: (item) => String(item.isActive), sortable: true, cell: (item) => item.isActive ? "Active" : "Inactive" },
  ]

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
      <div className="flex gap-2">
        <Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Create product category" />
        <Button
          type="button"
          onClick={() => void createProductCategory(newCategory).then(() => {
            setNewCategory("")
            return loadCategories()
          }).catch((createError: unknown) => {
            setError(createError instanceof Error ? createError.message : "Unable to create category.")
          })}
        >
          Create
        </Button>
      </div>
      <CommonList
        header={{
          pageTitle: "Product Categories",
          pageDescription: "Manage product categories used by the product module.",
        }}
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Search product categories",
        }}
        table={{
          columns,
          data: filteredCategories,
          loading,
          emptyMessage: "No categories found.",
          rowKey: (item) => item.id,
        }}
      />
    </div>
  )
}
