import React, { useState, useEffect, useCallback } from 'react'
import useDialogState from '../../../../resources/hooks/use-dialog-state'
import { type User } from '../data/schema'
import { toast } from 'sonner'

type UsersDialogType = 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  users: User[]
  isLoading: boolean
  error: string | null
  fetchUsers: () => Promise<User[]>
  addUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateUser: (id: number, user: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>
  deleteUser: (id: number) => Promise<void>
  deleteUsers: (ids: number[]) => Promise<void>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async (): Promise<User[]> => {
    try {
      const { users } = await import('../data/users')
      setUsers(users)
      setError(null)
      return users
    } catch (err) {
      setError('Failed to load mock data')
      console.error(err)
      return []
    }
  }, [])

  const addUser = useCallback(async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      const newUser: User = {
        id: users.length + 1,
        ...user,
        created_at: new Date(),
        updated_at: new Date(),
      }
      setUsers(prev => [...prev, newUser])
      toast.success('User added successfully')
    } catch (err) {
      toast.error('Error adding user')
      console.error(err)
    }
  }, [users])

  const updateUser = useCallback(async (id: number, user: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, ...user, updated_at: new Date() } : u
        )
      )
      toast.success('User updated successfully')
    } catch (err) {
      toast.error('Error updating user')
      console.error(err)
    }
  }, [])

  const deleteUser = useCallback(async (id: number): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success('User deleted successfully')
    } catch (err) {
      toast.error('Error deleting user')
      console.error(err)
    }
  }, [])

  const deleteUsers = useCallback(async (ids: number[]): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsers(prev => prev.filter(u => !ids.includes(u.id)))
      toast.success(`Deleted ${ids.length} ${ids.length > 1 ? 'users' : 'user'}`)
    } catch (err) {
      toast.error('Error deleting users')
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchUsers().finally(() => setIsLoading(false))
  }, [fetchUsers])

  return (
    <UsersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        users,
        isLoading,
        error,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        deleteUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)
  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }
  return usersContext
}
