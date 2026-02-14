'use client';

import { useEffect, useState } from 'react';

export function useColumnVisibility(
    storageKey: string,
    defaultColumns: string[],
) {
    const [visibleColumns, setVisibleColumns] =
        useState<string[]>(defaultColumns);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (saved) setVisibleColumns(JSON.parse(saved));
    }, [storageKey]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
    }, [visibleColumns, storageKey]);

    const toggleColumn = (key: string) => {
        setVisibleColumns((prev) =>
            prev.includes(key)
                ? prev.filter((col) => col !== key)
                : [...prev, key],
        );
    };

    return { visibleColumns, toggleColumn };
}
