'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '../../../../resources/components/ui/alert'
import { Input } from '../../../../resources/components/ui/input'
import { Label } from '../../../../resources/components/ui/label'
import { ConfirmDialog } from '../../../../resources/components/blocks/confirm-dialog'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { deleteUser } = useUsers()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) {
      toast.error(`Please type "${currentRow.name}" to confirm.`)
      return
    }

    try {
      await deleteUser(currentRow.id)
      onOpenChange(false)
      setValue('')
    } catch (err) {
      toast.error('Error deleting user')
      console.error(err)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name}
      title={
        <span className="text-destructive">
          <AlertTriangle className="stroke-destructive me-1 inline-block" size={18} /> Delete User
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete <span className="font-bold">{currentRow.name}</span>?
            <br />
            This action will permanently remove the user from the system. This cannot be undone.
          </p>
          <Label className="my-2">
            Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter name to confirm deletion."
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
