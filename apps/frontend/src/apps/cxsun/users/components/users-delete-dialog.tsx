'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { type User } from '../data/schema'
import { useAuth } from "@/global/auth/useAuth"

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
    const { token, user, API_URL,headers } = useAuth()
    const tenantId = user?.tenantId
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        if (value.trim() !== currentRow.username) return
        if (!token || !tenantId) {
            setError('Authentication required or tenant ID missing')
            return
        }

        try {
            const response = await fetch(`${API_URL}/api/users/${currentRow.id}`, {
                method: 'DELETE',
                headers: headers(),
            })

            if (response.ok) {
                onOpenChange(false)
                setValue('')
                setError(null)
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(`Failed to delete user: ${errorData.error || response.statusText}`)
            }
        } catch (err) {
            setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen)
                if (!isOpen) {
                    setValue('')
                    setError(null)
                }
            }}
            handleConfirm={handleDelete}
            disabled={value.trim() !== currentRow.username}
            title={
                <span className='text-destructive'>
                    <AlertTriangle
                        className='stroke-destructive me-1 inline-block'
                        size={18}
                    />{' '}
                    Delete User
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Are you sure you want to delete{' '}
                        <span className='font-bold'>{currentRow.username}</span>?
                        <br />
                        This action will permanently remove the user with the role of{' '}
                        <span className='font-bold'>
                            {currentRow.role.toUpperCase()}
                        </span>{' '}
                        from the system. This cannot be undone.
                    </p>

                    <Label className='my-2'>
                        Username:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Enter username to confirm deletion.'
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>
                            Please be careful, this operation cannot be rolled back.
                        </AlertDescription>
                    </Alert>
                    {error && <p className='text-red-600 text-sm'>{error}</p>}
                </div>
            }
            confirmText='Delete'
            destructive
        />
    )
}