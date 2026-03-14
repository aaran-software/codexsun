import { useEffect, useMemo, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type CommonMasterValue = string | number | boolean

export type CommonMasterFieldDefinition = {
  key: string
  label: string
  type?: "text" | "number"
  placeholder?: string
  required?: boolean
}

export type CommonMasterFormValues = Record<string, CommonMasterValue>

type CommonMasterUpsertDialogProps = {
  open: boolean
  mode: "create" | "edit"
  entityLabel: string
  fields: CommonMasterFieldDefinition[]
  initialValues: CommonMasterFormValues
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CommonMasterFormValues) => void
}

function normalizeValue(field: CommonMasterFieldDefinition, value: CommonMasterValue | undefined) {
  if (field.type === "number") {
    return typeof value === "number" ? String(value) : ""
  }

  return typeof value === "string" ? value : ""
}

export function CommonMasterUpsertDialog({
  open,
  mode,
  entityLabel,
  fields,
  initialValues,
  onOpenChange,
  onSubmit,
}: CommonMasterUpsertDialogProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const dialogTitle = useMemo(() => `${mode === "create" ? "Create" : "Edit"} ${entityLabel}`, [entityLabel, mode])

  useEffect(() => {
    if (!open) {
      return
    }

    const nextValues = Object.fromEntries(fields.map((field) => [field.key, normalizeValue(field, initialValues[field.key])]))
    setFormValues(nextValues)
    setIsActive(Boolean(initialValues.isActive ?? true))
    setErrors({})
  }, [fields, initialValues, open])

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (!field.required) {
        return
      }

      const value = formValues[field.key]?.trim()
      if (!value) {
        nextErrors[field.key] = `${field.label} is required.`
      }
    })

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const submittedValues: CommonMasterFormValues = {
      ...Object.fromEntries(fields.map((field) => {
        const rawValue = formValues[field.key] ?? ""
        return [
          field.key,
          field.type === "number" ? Number(rawValue) : rawValue.trim(),
        ]
      })),
      isActive,
    }

    onSubmit(submittedValues)
    onOpenChange(false)
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
                  {errors[field.key] ? <FieldError>{errors[field.key]}</FieldError> : null}
                </FieldContent>
              </Field>
            ))}

            <Field orientation="horizontal" className="items-center">
              <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(Boolean(checked))} />
              <FieldLabel className="w-auto">Active</FieldLabel>
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter className="rounded-b-md" showCloseButton>
          <Button type="button" onClick={handleSubmit}>
            {mode === "create" ? `Create ${entityLabel}` : `Save ${entityLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
