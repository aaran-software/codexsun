// File: providers/data-provider.tsx
// Description: Generic context provider for managing data state, dialogs, and table meta.
// Notes for study:
// - Parametrized with <T> for any data type.
// - Can be used across modules by providing entity-specific types.
// - Replaces user-specific provider; wrap with EntityProvider for specifics.

import * as React from "react";
import { type TableMeta as GenericTableMeta } from "../hooks/use-data-table-logic"; // Reusable hook types.

type DialogType = 'invite' | 'add' | 'edit' | 'delete' | null;

type DataContextType<T> = {
    open: DialogType;
    setOpen: (type: DialogType) => void;
    currentRow: T | null;
    setCurrentRow: React.Dispatch<React.SetStateAction<T | null>>;
    tableMeta: GenericTableMeta<T> | null;
};

const DataContext = React.createContext<DataContextType<any> | null>(null);

export function DataProvider<T>({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState<DialogType>(null);
    const [currentRow, setCurrentRow] = React.useState<T | null>(null);
    const [tableMeta, setTableMeta] = React.useState<GenericTableMeta<T> | null>(null);

    return (
        <DataContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, tableMeta, setTableMeta }}>
            {children}
        </DataContext.Provider>
    );
}

export const useDataContext = <T,>() => {
    const context = React.useContext(DataContext) as DataContextType<T>;
    if (!context) throw new Error('useDataContext must be within DataProvider');
    return context;
};