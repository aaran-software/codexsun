import { useState, useEffect, useRef } from 'react'
import { Main } from '@/components/layout/main'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider, useUsers } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { type User, userRoleSchema } from './data/schema'
import { useAuth } from "@/global/auth/useAuth"
import {z} from "zod";

const idToRole: Record<number, z.infer<typeof userRoleSchema>> = {
    1: 'superadmin',
    2: 'admin',
    3: 'cashier',
    4: 'manager',
}

function UsersContent() {
    const [data, setData] = useState<User[]>([])
    const [error, setError] = useState<string | null>(null)
    const { open } = useUsers()
    const { token, user, API_URL } = useAuth()
    const prevOpen = useRef(open)

    const fetchUsers = async () => {
        if (!token || !user?.tenantId) {
            setError('No authentication token or tenant ID available. Please log in.')
            return
        }

        try {
            const response = await fetch(`${API_URL}/api/users?tenant_id=${user.tenantId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
            if (response.ok) {
                const users = await response.json()
                const mappedUsers = users.map((user: any) => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: idToRole[user.role_id] || 'admin',
                    tenant_id: user.tenant_id,
                    status: user.status || 'active',
                    mobile: user.mobile || null,
                    createdAt: new Date(user.created_at),
                }))
                setData(mappedUsers)
                setError(null)
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(`Failed to fetch users: ${errorData.error || response.statusText}`)
            }
        } catch (error) {
            setError(`Error fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [token, user?.tenantId])

    useEffect(() => {
        if (prevOpen.current !== null && open === null) {
            fetchUsers() // Refresh data after dialog closes
        }
        prevOpen.current = open
    }, [open])

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
                    <p className='text-muted-foreground'>
                        Manage your users and their roles here.
                    </p>
                    {error && (
                        <p className='text-red-600 text-sm mt-2'>{error}</p>
                    )}
                </div>
                <UsersPrimaryButtons />
            </div>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                <UsersTable data={data} />
            </div>
            <UsersDialogs />
        </Main>
    )
}

export function Users() {
    return (
        <UsersProvider>
            <UsersContent />
        </UsersProvider>
    )
}