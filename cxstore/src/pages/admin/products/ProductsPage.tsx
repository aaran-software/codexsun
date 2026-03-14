import { useEffect, useMemo, useState } from "react"
import { EditIcon, EyeIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { deleteProduct, getProducts } from "@/api/productApi"
import { CommonList, type CommonListColumn } from "@/components/forms/CommonList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProductSummary } from "@/types/product"

export default function ProductsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const basePath = location.pathname.startsWith("/vendor") ? "/vendor/products" : "/admin/products"
  const pageTitle = location.pathname.startsWith("/vendor") ? "My Products" : "Product Management"

  const loadProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      setProducts(await getProducts(showInactive))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [showInactive])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()
    return products.filter((product) => normalizedSearch.length === 0
      || product.name.toLowerCase().includes(normalizedSearch)
      || product.sku.toLowerCase().includes(normalizedSearch)
      || product.categoryName.toLowerCase().includes(normalizedSearch)
      || product.vendorName.toLowerCase().includes(normalizedSearch))
  }, [products, searchValue])

  const totalRecords = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedProducts = filteredProducts.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  const handleDelete = async (id: number) => {
    setError(null)
    setMessage(null)

    try {
      await deleteProduct(id)
      setMessage("Product deleted successfully.")
      await loadProducts()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete product.")
    }
  }

  const columns: CommonListColumn<ProductSummary>[] = [
    {
      id: "serialNumber",
      header: "Sl.No",
      cell: (product) => ((safeCurrentPage - 1) * pageSize) + paginatedProducts.findIndex((item) => item.id === product.id) + 1,
      className: "w-12 min-w-12 px-2 text-center text-foreground",
      headerClassName: "w-12 min-w-12 px-2 text-center",
      sticky: "left",
    },
    {
      id: "name",
      header: "Product",
      accessor: (product) => product.name,
      sortable: true,
      cell: (product) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{product.name}</div>
          <div className="text-xs text-muted-foreground">{product.sku}</div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessor: (product) => product.categoryName,
      sortable: true,
      cell: (product) => product.categoryName || "-",
    },
    {
      id: "price",
      header: "Base Price",
      accessor: (product) => product.basePrice,
      sortable: true,
      cell: (product) => `${product.basePrice.toFixed(2)} ${product.currencyName || ""}`.trim(),
    },
    {
      id: "inventory",
      header: "Inventory",
      accessor: (product) => product.totalInventory,
      sortable: true,
      cell: (product) => product.totalInventory,
    },
    {
      id: "status",
      header: "Status",
      cell: (product) => (
        <div className="flex flex-wrap gap-2">
          <Badge className={product.isPublished ? "bg-sky-500 text-white hover:bg-sky-500/90" : "bg-slate-500 text-white hover:bg-slate-500/90"}>
            {product.isPublished ? "Published" : "Draft"}
          </Badge>
          <Badge className={product.isActive ? "bg-emerald-500 text-white hover:bg-emerald-500/90" : "bg-rose-500 text-white hover:bg-rose-500/90"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sticky: "right",
      className: "w-16 min-w-16 text-center",
      headerClassName: "w-16 min-w-16 text-center",
      cell: (product) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(
                <Button type="button" size="icon" variant="ghost" className="size-8 rounded-md data-[state=open]:bg-accent" />
              )}
            >
              <MoreHorizontalIcon className="size-4 stroke-[2.5]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-0 w-auto whitespace-nowrap">
              <DropdownMenuItem onClick={() => navigate(`${basePath}/${product.id}`)}>
                <EyeIcon className="size-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`${basePath}/edit/${product.id}`)}>
                <EditIcon className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => void handleDelete(product.id)}>
                <Trash2Icon className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-lg bg-secondary px-3 py-2 text-sm">{message}</div> : null}
      {error ? <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      <CommonList
        header={{
          pageTitle,
          pageDescription: "Manage catalog products, vendor pricing, and inventory tracking from one workflow.",
          addLabel: "New Product",
          onAddClick: () => navigate(`${basePath}/create`),
        }}
        search={{
          value: searchValue,
          onChange: (value) => {
            setSearchValue(value)
            setCurrentPage(1)
          },
          placeholder: "Search products by name, SKU, category, or vendor",
        }}
        filters={{
          buttonLabel: "Product filters",
          options: [
            { key: "inactive", label: showInactive ? "Hide inactive" : "Show inactive", onSelect: () => setShowInactive((current) => !current) },
          ],
        }}
        table={{
          columns,
          data: paginatedProducts,
          loading,
          emptyMessage: "No products found.",
          rowKey: (product) => product.id,
        }}
        footer={{
          content: (
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Total records: <span className="font-medium text-foreground">{totalRecords}</span>
              </span>
              <span>
                Active records: <span className="font-medium text-foreground">{filteredProducts.filter((product) => product.isActive).length}</span>
              </span>
            </div>
          ),
        }}
        pagination={{
          currentPage: safeCurrentPage,
          pageSize,
          totalRecords,
          onPageChange: setCurrentPage,
          onPageSizeChange: (value) => {
            setPageSize(value)
            setCurrentPage(1)
          },
        }}
      />
    </div>
  )
}
