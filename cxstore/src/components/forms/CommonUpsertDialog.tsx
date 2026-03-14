import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-md p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Update the shared {entityLabel.toLowerCase()} details used across common master forms.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4">
          <FieldGroup>
            {fields.map((field) => (
              <Field key={field.key}>
                <FieldLabel>{field.label}</FieldLabel>
                <FieldContent>
                  {field.type === "select" ? (
                    <Select
                      value={formValues[field.key] ?? EMPTY_SELECT_VALUE}
                      onValueChange={(value) => {
                        setFormValues((current) => ({ ...current, [field.key]: value ?? EMPTY_SELECT_VALUE }))
                        setErrors((current) => ({ ...current, [field.key]: "" }))
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {!field.required ? (
                          <SelectItem value={EMPTY_SELECT_VALUE}>Not assigned</SelectItem>
                        ) : null}
                        {(field.options ?? []).map((option) => (
                          <SelectItem key={String(option.value)} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      value={formValues[field.key] ?? ""}
                      placeholder={field.placeholder}
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

        <DialogFooter className="rounded-b-md" showCloseButton>
          <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {mode === "create" ? `Create ${entityLabel}` : `Save ${entityLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
