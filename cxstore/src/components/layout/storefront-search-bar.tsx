import { useState } from "react"
import type { FormEvent } from "react"
import { SearchIcon, LayoutGridIcon, LaptopIcon, ShirtIcon, HomeIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StorefrontSearchBar({ initialValue = "" }: { initialValue?: string }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialValue)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full overflow-hidden items-stretch rounded-md border border-border shadow-sm focus-within:ring-2 focus-within:ring-orange-500/50">
      <Select defaultValue="all">
        <SelectTrigger className="h-auto min-h-[40px] w-[70px] rounded-r-none border-0 border-r bg-muted/60 px-3 py-0 flex justify-center text-center cursor-pointer hover:bg-muted focus:ring-0 focus-visible:ring-0 sm:w-[85px] sm:px-4 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:text-center *:data-[slot=select-value]:justify-center">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent align="start" className="w-[200px]">
          <div className="mb-1 px-2 py-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</span>
          </div>
          <SelectItem value="all" className="cursor-pointer">
            <LayoutGridIcon className="mr-2 size-4 text-muted-foreground" />
            All Departments
          </SelectItem>
          <SelectItem value="electronics" className="cursor-pointer">
            <LaptopIcon className="mr-2 size-4 text-muted-foreground" />
            Electronics
          </SelectItem>
          <SelectItem value="fashion" className="cursor-pointer">
            <ShirtIcon className="mr-2 size-4 text-muted-foreground" />
            Fashion
          </SelectItem>
          <SelectItem value="home" className="cursor-pointer">
            <HomeIcon className="mr-2 size-4 text-muted-foreground" />
            Home & Kitchen
          </SelectItem>
        </SelectContent>
      </Select>
      <div className="relative flex-1">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 rounded-none border-0 bg-background px-3 focus-visible:ring-0 sm:px-4"
          placeholder="Search Products, Brands and More"
        />
      </div>
      <Button 
        type="submit" 
        size="icon"
        className="h-10 cursor-pointer rounded-l-none bg-[#febd69] text-black hover:bg-[#f3a847] w-12 sm:w-14"
      >
        <SearchIcon className="size-5" />
      </Button>
    </form>
  )
}
