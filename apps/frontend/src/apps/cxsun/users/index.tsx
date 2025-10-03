import { useState, useEffect, useRef } from 'react'
import { Main } from '@/components/layout/main'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider, useUsers } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { type User } from './data/schema'
import { useAuth } from '@/global/auth/AuthContext'

function UsersContent() {
    const [data, setData] = useState<User[]>([])
    const { open } = useUsers()
    const { token } = useAuth()
    const prevOpen = useRef(open)

    const fetchUsers = async () => {
        if (!token) return
        try {
            const response = await fetch('http://localhost:3000/api/users', {
                headers: {
                    'X-Tenant-Id': 'tenant1',
                    'Authorization': `Bearer ${token}`,
                },
            })
            if (response.ok) {
                const users = await response.json()
                // Map API response to User schema with dummy fields
                const mappedUsers = users.map((user: any) => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    tenant_id: user.tenant_id,
                    status: 'active' as const,
                    mobile: null,
                    createdAt: new Date(user.created_at),
                }))
                setData(mappedUsers)
            } else {
                console.error('Failed to fetch users:', response.status)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [token])

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