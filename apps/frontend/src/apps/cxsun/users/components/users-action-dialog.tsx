'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/common/password-input'
import { SelectDropdown } from '@/components/common/select-dropdown'
import { type User, userRoleSchema } from '../data/schema'
import { useAuth } from "@/global/auth/useAuth"
import { useState, useEffect } from 'react'

const getAddUserUrl = (tenantId: string) => `/api/users?tenant_id=${tenantId}`

const getEditUserUrl = (id: number, tenantId: string) => `/api/users/${id}?tenant_id=${tenantId}`

const formSchema = z
    .object({
        username: z.string().min(1, 'Username is required.'),
        email: z.string().email('Invalid email address.'),
        role: userRoleSchema,
        password: z.string().transform((pwd) => pwd.trim()),
        confirmPassword: z.string().transform((pwd) => pwd.trim()),
        isEdit: z.boolean(),
    })
    .refine(
        ({ isEdit, password }) => (isEdit && !password ? true : password.length > 0),
        { message: 'Password is required.', path: ['password'] }
    )
    .refine(
        ({ isEdit, password }) => (isEdit && !password ? true : password.length >= 8),
        { message: 'Password must be at least 8 characters long.', path: ['password'] }
    )
    .refine(
        ({ isEdit, password }) => (isEdit && !password ? true : /[a-z]/.test(password)),
        { message: 'Password must contain at least one lowercase letter.', path: ['password'] }
    )
    .refine(
        ({ isEdit, password }) => (isEdit && !password ? true : /\d/.test(password)),
        { message: 'Password must contain at least one number.', path: ['password'] }
    )
    .refine(
        ({ isEdit, password, confirmPassword }) => (isEdit && !password ? true : password === confirmPassword),
        { message: "Passwords don't match.", path: ['confirmPassword'] }
    )

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
    currentRow?: User
    open: boolean
    onOpenChange: (open: boolean) => void
}

type Role = {
    label: string;
    value: string;
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: UserActionDialogProps) {
    const isEdit = !!currentRow
    const { token, user, API_URL } = useAuth()
    const tenantId = user?.tenantId || user?.tenant_id
    const [isPasswordTouched, setIsPasswordTouched] = useState(false)
    const [rolesList, setRolesList] = useState<Role[]>([])
    const [roleToIdMap, setRoleToIdMap] = useState<Record<string, number>>({})

    const form = useForm<UserForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? {
                username: currentRow?.username || '',
                email: currentRow?.email || '',
                role: currentRow?.role || '' as any,
                password: '',
                confirmPassword: '',
                isEdit,
            }
            : {
                username: '',
                email: '',
                role: '' as any, // Type assertion for zod union
                password: '',
                confirmPassword: '',
                isEdit,
            },
    })

    useEffect(() => {
        if (!open || !token || !tenantId) return;

        const fetchRoles = async () => {
            try {
                const response = await fetch(`${API_URL}/api/roles?tenant_id=${tenantId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    const mappedRoles = data.map((r: { id: number; name: string }) => ({
                        label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
                        value: r.name,
                    }));
                    const map = data.reduce((acc: Record<string, number>, r: { id: number; name: string }) => {
                        acc[r.name] = r.id;
                        return acc;
                    }, {});
                    setRolesList(mappedRoles);
                    setRoleToIdMap(map);
                } else {
                    console.error('Failed to fetch roles');
                }
            } catch (err) {
                console.error('Error fetching roles', err);
            }
        };

        fetchRoles();
    }, [open, token, tenantId, API_URL]);

    const onSubmit = async (values: UserForm) => {
        if (!token || !tenantId) {
            form.setError('root', { message: 'Authentication required or tenant ID missing' })
            return
        }
        if (isEdit && !currentRow?.id) {
            form.setError('root', { message: 'User ID is missing for editing' })
            return
        }
        if (!roleToIdMap[values.role]) {
            form.setError('role', { message: 'Invalid role selected' })
            return
        }
        try {
            const endpoint = isEdit ? getEditUserUrl(currentRow!.id, tenantId) : getAddUserUrl(tenantId)
            const method = isEdit ? 'PUT' : 'POST'
            const payload = {
                username: values.username,
                email: values.email,
                role_id: roleToIdMap[values.role],
                ...(values.password && { password: values.password }),
            }

            console.log('Sending request:', {
                url: `${API_URL}${endpoint}`,
                method,
                payload,
                headers: { 'Authorization': `Bearer ${token}` },
            })

            const response = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                onOpenChange(false)
                form.reset()
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('API error:', response.status, errorData)
                form.setError('root', { 
                    message: `Failed to ${isEdit ? 'update' : 'create'} user: ${errorData.error || response.statusText}`
                })
            }
        } catch (error) {
            console.error('Fetch error:', error)
            form.setError('root', { 
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen)
            if (!isOpen) form.reset()
        }}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Make changes to the user here.' : 'Add a new user here.'} Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <Form {...form}>
                        <form id='user-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 grid grid-cols-1'>
                            <FormField
                                control={form.control}
                                name='username'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder='e.g., john_doe' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder='e.g., john@example.com' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='role'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                                        <SelectDropdown
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Select a role'
                                            className='col-span-4'
                                            items={rolesList}
                                        />
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                placeholder='e.g., S3cur3P@ssw0rd'
                                                className='col-span-4'
                                                onChange={(e) => {
                                                    field.onChange(e)
                                                    setIsPasswordTouched(!!e.target.value)
                                                }}
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Confirm Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                disabled={!isPasswordTouched && isEdit}
                                                placeholder='e.g., S3cur3P@ssw0rd'
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            {form.formState.errors.root && (
                                <p className='text-red-600 text-sm col-span-6'>{form.formState.errors.root.message}</p>
                            )}
                        </form>
                    </Form>
                </div>
                <DialogFooter>
                    <Button type='submit' form='user-form'>
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
