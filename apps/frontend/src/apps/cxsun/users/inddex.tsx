// File: index.tsx
import { useState, useEffect, useRef } from 'react'
import { Main } from '@/components/layout/main'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider, useUsers } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { type User, userRoleSchema } from './data/schema'
import { useAuth } from "@/global/auth/useAuth"
import { z } from "zod"

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
    const { token, user, API_URL, loading: authLoading, headers } = useAuth()
    const baseUrl = `${API_URL}/api/users`
    const refreshUrl = `${API_URL}/api/auth/refresh`
    const prevOpen = useRef(open)

    // Refresh token if needed
    const refreshToken = async () => {
        try {
            const res = await fetch(refreshUrl, {
                method: 'POST',
                headers: headers(),
            })
            if (res.ok) {
                const data = await res.json()
                return data.token
            } else {
                setError('Token refresh failed')
                console.error('Token refresh failed:', res.statusText)
                return null
            }
        } catch (error) {
            setError('Network error during token refresh')
            console.error('Error refreshing token:', error)
            return null
        }
    }

    // Fetch users
    const fetchUsers = async () => {
        if (authLoading || !token || !user?.tenantId || !user?.id) {
            setError('No authentication token, tenant ID, or user ID available. Please log in.')
            return
        }

        try {
            let res = await fetch(baseUrl, {
                headers: headers(),
            })
            if (res.status === 401) {
                const newToken = await refreshToken()
                if (!newToken) {
                    setError('Authentication failed')
                    return
                }
                res = await fetch(baseUrl, {
                    headers: headers(),
                })
            }
            if (res.ok) {
                const data = await res.json()
                if (data.status !== 200) {
                    setError(`Failed to fetch users: ${data.body?.error || 'Unknown error'}`)
                    return
                }
                const users = data.body
                if (!Array.isArray(users)) {
                    setError('Invalid response format: Expected an array of users.')
                    return
                }

                const mappedUsers = users.map((user: any) => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: idToRole[user.role_id] || 'admin',
                    status: user.status || 'active',
                    mobile: user.mobile || null,
                    createdAt: new Date(user.created_at),
                }))
                setData(mappedUsers)
                setError(null)
            } else {
                const errorData = await res.json().catch(() => ({}))
                setError(`Failed to fetch users: ${errorData.error || res.statusText}`)
            }
        } catch (error) {
            setError(`Error fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [token, user?.tenantId, user?.id])

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