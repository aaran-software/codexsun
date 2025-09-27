import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailPlus, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../../resources/components/ui/button'
import {
  Dialog,
  DialogClose,
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
import { Textarea } from '../../../../resources/components/ui/textarea'
import { SelectDropdown } from '../../../../resources/components/blocks/select-dropdown'
import { roles } from '../data/data'

const formSchema = z.object({
  email: z.string().min(1, 'Please enter an email to invite.').email('Invalid email address.'),
  role: z.string().min(1, 'Role is required.'),
  desc: z.string().optional(),
})

type UserInviteForm = z.infer<typeof formSchema>

type UserInviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void // Callback to refetch data
}

export function UsersInviteDialog({
  open,
  onOpenChange,
  onSuccess,
}: UserInviteDialogProps) {
  const form = useForm<UserInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', role: '', desc: '' },
  })

  const onSubmit = async (values: UserInviteForm) => {
    try {
      const res = await fetch('http://localhost:3000/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          role: values.role,
          description: values.desc,
        }),
      })
      if (!res.ok) throw new Error('Failed to send invitation')

      toast.success('Invitation sent successfully')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error('Error sending invitation')
      console.error(err)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <MailPlus /> Invite User
          </DialogTitle>
          <DialogDescription>
            Invite a new user to join your team by sending an email invitation. Assign a role to define their access level.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="user-invite-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select a role"
                    items={roles.map(({ label, value }) => ({ label, value }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Add a personal note to your invitation (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="gap-y-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="user-invite-form">
            Invite <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
