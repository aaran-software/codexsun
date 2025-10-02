import React, { useState } from 'react'
import { type User } from './schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
    open: UsersDialogType | null
    setOpen: (str: UsersDialogType | null) => void
    currentRow: User | null
    setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState<UsersDialogType | null>(null)
    const [currentRow, setCurrentRow] = useState<User | null>(null)

    return (
        <UsersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </UsersContext.Provider>
    )
}

export const useUsers = () => {
    const usersContext = React.useContext(UsersContext)

    if (!usersContext) {
        throw new Error('useUsers has to be used within <UsersContext.Provider>')
    }

    return usersContext
}