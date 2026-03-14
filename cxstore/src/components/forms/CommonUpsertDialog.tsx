import { useEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type CommonUpsertValue = string | number | boolean

export type CommonUpsertSelectOption = {
  value: string | number
  label: string
}

export type CommonUpsertFieldDefinition = {
  key: string
  label: string
  type?: "text" | "number" | "select"
  placeholder?: string
  required?: boolean
  options?: CommonUpsertSelectOption[]
  parseAs?: "string" | "number"
  createOption?: (
    label: string,
    values: Record<string, string>,
  ) => Promise<CommonUpsertSelectOption>
}

export type CommonUpsertFormValues = Record<string, CommonUpsertValue>

type CommonUpsertDialogProps = {
  open: boolean
  mode: "create" | "edit"
  entityLabel: string
  fields: CommonUpsertFieldDefinition[]
  initialValues: CommonUpsertFormValues
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CommonUpsertFormValues) => Promise<void> | void
  errorMessage?: string | null
}

const EMPTY_SELECT_VALUE = "__empty__"

function normalizeValue(field: CommonUpsertFieldDefinition, value: CommonUpsertValue | undefined) {
  if (field.type === "number") {
    return typeof value === "number" ? String(value) : ""
  }

  if (field.type === "select") {
    if (value === null || value === undefined || value === "") {
      return EMPTY_SELECT_VALUE
    }

    return String(value)
  }

  return typeof value === "string" ? value : ""
}

export function CommonUpsertDialog({
  open,
  mode,
  entityLabel,
  fields,
  initialValues,
  onOpenChange,
  onSubmit,
  errorMessage,
}: CommonUpsertDialogProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectOptions, setSelectOptions] = useState<Record<string, CommonUpsertSelectOption[]>>({})

  const dialogTitle = useMemo(() => `${mode === "create" ? "Create" : "Edit"} ${entityLabel}`, [entityLabel, mode])

  useEffect(() => {
    if (!open) {
      return
    }

    const nextValues = Object.fromEntries(fields.map((field) => [field.key, normalizeValue(field, initialValues[field.key])]))
    setFormValues(nextValues)
    setIsActive(Boolean(initialValues.isActive ?? true))
    setErrors({})
    setIsSubmitting(false)
    setSelectOptions(
      Object.fromEntries(
        fields
          .filter((field) => field.type === "select")
          .map((field) => [field.key, field.options ?? []]),
      ),
    )
  }, [fields, initialValues, open])

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (!field.required) {
        return
      }

      const rawValue = formValues[field.key] ?? ""
      const value = rawValue === EMPTY_SELECT_VALUE ? "" : rawValue.trim()
      if (!value) {
        nextErrors[field.key] = `${field.label} is required.`
      }
    })

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const submittedValues: CommonUpsertFormValues = {
      ...Object.fromEntries(fields.map((field) => {
        const rawValue = formValues[field.key] ?? ""
        const normalizedValue = field.type === "select" && rawValue === EMPTY_SELECT_VALUE
          ? ""
          : rawValue

        return [
          field.key,
          field.type === "number" || field.parseAs === "number"
            ? Number(normalizedValue)
            : normalizedValue.trim(),
        ]
      })),
      isActive,
    }

    setIsSubmitting(true)

    try {
      await onSubmit(submittedValues)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || isSubmitting) {
      return
    }

    const target = event.target as HTMLElement | null
    if (!target) {
      return
    }

    if (target.tagName === "TEXTAREA") {
      return
    }

    const role = target.getAttribute("role")
    const tagName = target.tagName
    if (role === "option" || role === "listbox" || tagName === "BUTTON") {
      return
    }

    event.preventDefault()
    void handleSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-md p-4" onKeyDown={handleDialogKeyDown}>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div>
          <FieldGroup>
            {fields.map((field) => (
              <Field key={field.key}>
                <FieldLabel>{field.label}</FieldLabel>
                <FieldContent>
                  {field.type === "select" ? (
                    <AutocompleteSelectField
                      field={field}
                      value={formValues[field.key] ?? EMPTY_SELECT_VALUE}
                      values={formValues}
                      options={selectOptions[field.key] ?? field.options ?? []}
                      onValueChange={(value) => {
                        setFormValues((current) => ({ ...current, [field.key]: value }))
                        setErrors((current) => ({ ...current, [field.key]: "" }))
                      }}
                      onOptionsChange={(options) => {
                        setSelectOptions((current) => ({ ...current, [field.key]: options }))
                      }}
                      onCreateError={(message) => {
                        setErrors((current) => ({ ...current, [field.key]: message }))
                      }}
                    />
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      value={formValues[field.key] ?? ""}
                      onChange={(event) => {
                        const value = event.target.value
                        setFormValues((current) => ({ ...current, [field.key]: value }))
                        setErrors((current) => ({ ...current, [field.key]: "" }))
                      }}
                    />
                  )}
                  {errors[field.key] ? <FieldError>{errors[field.key]}</FieldError> : null}
                </FieldContent>
              </Field>
            ))}

            <Field orientation="horizontal" className="items-center">
              <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(Boolean(checked))} />
              <FieldLabel className="w-auto">Active</FieldLabel>
            </Field>
          </FieldGroup>

          {errorMessage ? (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <DialogFooter className="-mx-4 -mb-4 mt-4 rounded-b-md" showCloseButton>
          <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {mode === "create" ? `Create ${entityLabel}` : `Save ${entityLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AutocompleteSelectFieldProps = {
  field: CommonUpsertFieldDefinition
  value: string
  values: Record<string, string>
  options: CommonUpsertSelectOption[]
  onValueChange: (value: string) => void
  onOptionsChange: (options: CommonUpsertSelectOption[]) => void
  onCreateError: (message: string) => void
}

function AutocompleteSelectField({
  field,
  value,
  values,
  options,
  onValueChange,
  onOptionsChange,
  onCreateError,
}: AutocompleteSelectFieldProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const blurTimeoutRef = useRef<number | null>(null)

  const selectedOption = options.find((option) => String(option.value) === value)

  useEffect(() => {
    if (!open) {
      setQuery(selectedOption?.label ?? "")
    }
  }, [open, selectedOption?.label])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredOptions = options.filter((option) => {
    if (!normalizedQuery) {
      return true
    }

    return option.label.toLowerCase().includes(normalizedQuery)
  })
  const canCreate = Boolean(field.createOption && normalizedQuery) && !options.some(
    (option) => option.label.toLowerCase() === normalizedQuery,
  )

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue)
    setOpen(false)
  }

  const handleCreate = async () => {
    if (!field.createOption || !query.trim() || isCreating) {
      return
    }

    setIsCreating(true)
    onCreateError("")

    try {
      const createdOption = await field.createOption(query.trim(), values)
      const nextOptions = [...options, createdOption]
      onOptionsChange(nextOptions)
      onValueChange(String(createdOption.value))
      setQuery(createdOption.label)
      setOpen(false)
    } catch (error) {
      onCreateError(error instanceof Error ? error.message : `Unable to create ${field.label.toLowerCase()}.`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="relative">
      <Input
        value={open ? query : (selectedOption?.label ?? "")}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimeoutRef.current = window.setTimeout(() => {
            setOpen(false)
            setQuery(selectedOption?.label ?? "")
          }, 100)
        }}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          if (!event.target.value.trim() && !field.required) {
            onValueChange(EMPTY_SELECT_VALUE)
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter") {
            return
          }

          if (filteredOptions.length > 0) {
            event.preventDefault()
            handleSelect(String(filteredOptions[0].value))
            return
          }

          if (canCreate) {
            event.preventDefault()
            void handleCreate()
          }
        }}
      />
      {open ? (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
          {!field.required ? (
            <button
              type="button"
              className="flex w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
              onMouseDown={(event) => {
                event.preventDefault()
                handleSelect(EMPTY_SELECT_VALUE)
              }}
            >
              Not assigned
            </button>
          ) : null}
          {filteredOptions.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              className={cn(
                "flex w-full rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-accent hover:text-accent-foreground",
                String(option.value) === value ? "bg-accent text-accent-foreground" : "text-foreground",
              )}
              onMouseDown={(event) => {
                event.preventDefault()
                handleSelect(String(option.value))
              }}
            >
              {option.label}
            </button>
          ))}
          {filteredOptions.length === 0 ? (
            canCreate ? (
              <button
                type="button"
                className="flex w-full rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary transition hover:bg-accent"
                onMouseDown={(event) => {
                  event.preventDefault()
                  void handleCreate()
                }}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : `Create "${query.trim()}"`}
              </button>
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No records found.</div>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
