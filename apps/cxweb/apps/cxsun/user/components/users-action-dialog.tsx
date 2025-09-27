'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '../../../../resources/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../resources/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../resources/components/ui/form'
import { Input } from '../../../../resources/components/ui/input'
import { PasswordInput } from '../../../../resources/components/blocks/password-input'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().min(1, 'Email is required.').email('Invalid email address.'),
    password: z.string().transform((pwd) => pwd.trim()),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    { message: 'Password is required.', path: ['password'] }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    { message: 'Password must be at least 8 characters long.', path: ['password'] }
  )
  .refine(
    ({ confirmPassword, password }) => confirmPassword === password,
    { message: 'Passwords do not match.', path: ['confirmPassword'] }
  )

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User
}

export function UsersActionDialog({
  open,
  onOpenChange,
  currentRow,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const { addUser, updateUser } = useUsers()
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentRow?.name || '',
      email: currentRow?.email || '',
      password: '',
      confirmPassword: '',
      isEdit,
    },
  })

  const isPasswordTouched = form.watch('password')

  const onSubmit = async (values: UserForm) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        ...(values.password && { password: values.password }),
        status: isEdit ? currentRow?.status : 'active',
      }
      if (isEdit && currentRow) {
        await updateUser(currentRow.id, payload)
      } else {
        await addUser(payload)
      }
      form.reset()
      onOpenChange(false)
    } catch (err) {
      toast.error(`Error ${isEdit ? 'updating' : 'adding'} user`)
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Edit the user details below.' : 'Add a new user to the system.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? 'New Password (optional)' : 'Password'}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="e.g., S3cur3P@ssw0rd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      disabled={!isPasswordTouched}
                      placeholder="e.g., S3cur3P@ssw0rd"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="user-form">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
