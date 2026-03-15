import { FormEvent, useState } from "react"
import { SearchIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function StorefrontSearchBar({ initialValue = "", compact = false }: { initialValue?: string; compact?: boolean }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialValue)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={compact ? "h-10 rounded-full bg-background pl-9" : "h-11 rounded-full bg-background pl-9"}
          placeholder="Search products, vendors, or categories"
        />
      </div>
      <Button type="submit" className={compact ? "rounded-full px-4" : "rounded-full px-5"}>Search</Button>
    </form>
  )
}
