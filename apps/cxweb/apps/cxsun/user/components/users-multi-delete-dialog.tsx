'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '../../../../resources/components/ui/alert'
import { Input } from '../../../../resources/components/ui/input'
import { Label } from '../../../../resources/components/ui/label'
import { ConfirmDialog } from '../../../../resources/components/blocks/confirm-dialog'
import { type User } from '../data/schema'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

const CONFIRM_WORD = 'DELETE'

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: UserMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async (retries = 3, delay = 2000) => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const promises = selectedRows.map((row) =>
          fetch(`http://localhost:3006/users/${(row.original as User).id}`, {
  method: 'DELETE',
}).then(res => {
  if (res.status === 429) throw new Error('Too many requests, please try again later')
  if (!res.ok) throw new Error(`Failed to delete user ${(row.original as User).id}`)
  return res
})
)
await Promise.all(promises)

toast.success(`Deleted ${selectedRows.length} ${selectedRows.length > 1 ? 'users' : 'user'}`)
table.resetRowSelection()
onOpenChange(false)
setValue('')
onSuccess?.()
return
} catch (err: any) {
  if (attempt === retries - 1) {
    toast.error(err.message || 'Error deleting users')
    console.error(err)
  }
  await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
}
}
}

return (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    handleConfirm={handleDelete}
    disabled={value.trim() !== CONFIRM_WORD}
    title={
      <span className="text-destructive">
          <AlertTriangle className="stroke-destructive me-1 inline-block" size={18} /> Delete{' '}
        {selectedRows.length} {selectedRows.length > 1 ? 'users' : 'user'}
        </span>
    }
    desc={
      <div className="space-y-4">
        <p className="mb-2">
          Are you sure you want to delete the selected users? <br />
          This action cannot be undone.
        </p>
        <Label className="my-4 flex flex-col items-start gap-1.5">
          <span>Confirm by typing "{CONFIRM_WORD}":</span>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
          />
        </Label>
        <Alert variant="destructive">
          <AlertTitle>Warning!</AlertTitle>
          <AlertDescription>
            Please be careful, this operation cannot be rolled back.
          </AlertDescription>
        </Alert>
      </div>
    }
    confirmText="Delete"
    destructive
  />
)
}