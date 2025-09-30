let currentTenantId: string | null = null;

export async function withTenantContext<T>(tenantId: string, callback: () => Promise<T>): Promise<T> {
    const previousTenantId = currentTenantId;
    currentTenantId = tenantId;
    try {
        return await callback().finally(() => {
            currentTenantId = previousTenantId;
        });
    } catch (error) {
        currentTenantId = previousTenantId;
        throw error;
    }
}

export function getTenantId(): string | null {
    return currentTenantId;
}