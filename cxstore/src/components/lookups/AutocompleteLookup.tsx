import { useEffect, useMemo, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type LookupOption = {
  value: string
  label: string
  parentValue?: string
}

type AutocompleteLookupProps = {
  value: string
  onChange: (value: string) => void
  options: LookupOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  allowEmptyOption?: boolean
  emptyOptionLabel?: string
  createOption?: (label: string) => Promise<LookupOption>
  onOptionsChange?: (options: LookupOption[]) => void
  onErrorChange?: (message: string) => void
  notFoundMessage?: string
}

export function AutocompleteLookup({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  allowEmptyOption = false,
  emptyOptionLabel = "Not assigned",
  createOption,
  onOptionsChange,
  onErrorChange,
  notFoundMessage = "No records found.",
}: AutocompleteLookupProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [localError, setLocalError] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const blurTimeoutRef = useRef<number | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  useEffect(() => {
    if (!open) {
      setQuery(selectedOption?.label ?? "")
    }
  }, [open, selectedOption?.label])

  useEffect(() => {
    if (!open) {
      setHighlightedIndex(-1)
      return
    }

    setHighlightedIndex(0)
  }, [open, query, value])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredOptions = options.filter((option) => !normalizedQuery || option.label.toLowerCase().includes(normalizedQuery))
  const canCreate = Boolean(createOption && normalizedQuery) && !options.some((option) => option.label.toLowerCase() === normalizedQuery)
  const renderedItems = [
    ...(allowEmptyOption && !required ? [{ key: "__empty__", label: emptyOptionLabel, action: "empty" as const }] : []),
    ...filteredOptions.map((option) => ({ key: option.value, label: option.label, action: "select" as const, option })),
    ...(filteredOptions.length === 0 && canCreate ? [{ key: "__create__", label: `Create "${query.trim()}"`, action: "create" as const }] : []),
  ]

  useEffect(() => {
    if (!open || highlightedIndex < 0) {
      return
    }

    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" })
  }, [highlightedIndex, open])

  const setError = (message: string) => {
    setLocalError(message)
    onErrorChange?.(message)
  }

  const handleSelect = (nextValue: string) => {
    setError("")
    onChange(nextValue)
    setOpen(false)
  }

  const handleCreate = async () => {
    if (!createOption || !query.trim() || isCreating) {
      return
    }

    setIsCreating(true)
    setError("")

    try {
      const createdOption = await createOption(query.trim())
      const nextOptions = mergeLookupOptions(options, [createdOption])
      onOptionsChange?.(nextOptions)
      onChange(createdOption.value)
      setQuery(createdOption.label)
      setOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create record.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          value={open ? query : (selectedOption?.label ?? "")}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => {
            if (!disabled) {
              setOpen(true)
            }
          }}
          onBlur={() => {
            blurTimeoutRef.current = window.setTimeout(() => {
              setOpen(false)
              setQuery(selectedOption?.label ?? "")
            }, 100)
          }}
          onChange={(event) => {
            setError("")
            setQuery(event.target.value)
            setOpen(true)
            if (!event.target.value.trim() && !required) {
              onChange("")
            }
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              if (event.key === "ArrowDown") {
                event.preventDefault()
                setOpen(true)
                setHighlightedIndex((current) => {
                  const nextLength = renderedItems.length
                  if (nextLength === 0) {
                    return -1
                  }

                  return current < 0 ? 0 : (current + 1) % nextLength
                })
              }

              if (event.key === "ArrowUp") {
                event.preventDefault()
                setOpen(true)
                setHighlightedIndex((current) => {
                  const nextLength = renderedItems.length
                  if (nextLength === 0) {
                    return -1
                  }

                  return current < 0 ? nextLength - 1 : (current - 1 + nextLength) % nextLength
                })
              }

              if (event.key === "Escape") {
                setOpen(false)
              }

              return
            }

            const highlightedItem = highlightedIndex >= 0 ? renderedItems[highlightedIndex] : undefined

            if (highlightedItem?.action === "empty") {
              event.preventDefault()
              handleSelect("")
              return
            }

            if (highlightedItem?.action === "select" && highlightedItem.option) {
              event.preventDefault()
              handleSelect(highlightedItem.option.value)
              return
            }

            if (highlightedItem?.action === "create" || canCreate) {
              event.preventDefault()
              void handleCreate()
            }
          }}
        />
        {open && !disabled ? (
          <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
            {allowEmptyOption && !required ? (
              <button
                type="button"
                ref={(element) => {
                  optionRefs.current[0] = element
                }}
                className="flex w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(event) => {
                  event.preventDefault()
                  handleSelect("")
                }}
                onMouseEnter={() => setHighlightedIndex(0)}
              >
                {emptyOptionLabel}
              </button>
            ) : null}
            {filteredOptions.map((option, optionIndex) => {
              const itemIndex = optionIndex + (allowEmptyOption && !required ? 1 : 0)

              return (
              <button
                key={option.value}
                type="button"
                ref={(element) => {
                  optionRefs.current[itemIndex] = element
                }}
                className={cn(
                  "flex w-full rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-accent hover:text-accent-foreground",
                  highlightedIndex === itemIndex || option.value === value ? "bg-accent text-accent-foreground" : "text-foreground",
                )}
                onMouseDown={(event) => {
                  event.preventDefault()
                  handleSelect(option.value)
                }}
                onMouseEnter={() => setHighlightedIndex(itemIndex)}
              >
                {option.label}
              </button>
              )
            })}
            {filteredOptions.length === 0 && canCreate ? (
              <button
                type="button"
                ref={(element) => {
                  optionRefs.current[allowEmptyOption && !required ? 1 : 0] = element
                }}
                className="flex w-full rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary transition hover:bg-accent"
                onMouseDown={(event) => {
                  event.preventDefault()
                  void handleCreate()
                }}
                disabled={isCreating}
                onMouseEnter={() => setHighlightedIndex(allowEmptyOption && !required ? 1 : 0)}
              >
                {isCreating ? "Creating..." : `Create "${query.trim()}"`}
              </button>
            ) : null}
            {filteredOptions.length === 0 && !canCreate ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">{notFoundMessage}</div>
            ) : null}
          </div>
        ) : null}
      </div>
      {localError && !onErrorChange ? <p className="text-xs text-destructive">{localError}</p> : null}
    </div>
  )
}

export function mergeLookupOptions(current: LookupOption[], next: LookupOption[]) {
  const merged = [...current]

  next.forEach((option) => {
    if (!merged.some((item) => item.value === option.value)) {
      merged.push(option)
    }
  })

  return merged
}
