// File: apps/cxsun/user/user-provider.tsx
// Description: User-specific provider with context and table logic.
// Notes for study:
// - Separates context for dialog state from table logic.
// - useDataTableLogic moved to hooks/use-data-table-logic.ts for reusability.
// - Context only for dialog state; tableMeta set in user-table.tsx.

import * as React from "react";
import { type User } from "./user-schema";

type DialogType = 'invite' | 'add' | 'edit' | 'delete' | null;

type UsersContextType = {
    open: DialogType;
    setOpen: (str: DialogType) => void;
    currentRow: User | null;
    setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>;
};

const UsersContext = React.createContext<UsersContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState<DialogType>(null);
    const [currentRow, setCurrentRow] = React.useState<User | null>(null);

    return (
        <UsersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </UsersContext.Provider>
    );
}

export const useUsers = () => {
    const context = React.useContext(UsersContext);
    if (!context) {
        throw new Error('useUsers must be used within UserProvider');
    }
    return context;
};