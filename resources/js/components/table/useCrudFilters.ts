'use client';

import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoute } from 'ziggy-js';

interface UseCrudFiltersProps<T> {
    initialFilters: T;
    routeName: string;
    debounceKeys?: (keyof T)[];
}

export function useCrudFilters<T extends Record<string, any>>({
    initialFilters,
    routeName,
    debounceKeys = [],
}: UseCrudFiltersProps<T>) {
    const route = useRoute();
    const [filters, setFilters] = useState<T>(initialFilters);
    const [isNavigating, setIsNavigating] = useState(false);
    const isFirstRender = useRef(true);

    const buildPayload = useCallback(() => {
        const payload: Record<string, any> = {};

        Object.keys(filters).forEach((key) => {
            const value = filters[key];
            if (value !== '' && value !== 'all' && value !== undefined) {
                payload[key] = value;
            }
        });

        return payload;
    }, [filters]);

    const navigate = useCallback(
        (extra: Record<string, any> = {}, resetPage = true) => {
            setIsNavigating(true);

            router.get(
                route(routeName),
                {
                    ...buildPayload(),
                    ...(resetPage ? { page: 1 } : {}),
                    ...extra,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    onFinish: () => setIsNavigating(false),
                },
            );
        },
        [route, buildPayload, routeName],
    );

    // ✅ Debounced keys — skip first mount
    useEffect(
        () => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }

            const timeout = setTimeout(() => {
                navigate({}, true);
            }, 500);

            return () => clearTimeout(timeout);
        },
        debounceKeys.map((key) => filters[key]),
    );

    return {
        filters,
        setFilters,
        navigate,
        isNavigating,
    };
}
