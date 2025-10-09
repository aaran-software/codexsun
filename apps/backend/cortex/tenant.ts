// // cortex/tenant.ts
// import { AsyncLocalStorage } from 'async_hooks';
//
// interface TenantContext {
//     tenantId: string | null;
//     tenantDatabase: string | null;
// }
//
// const tenantStorage = new AsyncLocalStorage<TenantContext>();
//
// export async function withTenantContext<T>(
//     tenantId: string | null,
//     tenantDatabase: string | null,
//     callback: () => Promise<T>
// ): Promise<T> {
//     const store: TenantContext = { tenantId, tenantDatabase };
//     return tenantStorage.run(store, callback);
// }
//
// export function getTenantId(): string | null {
//     return tenantStorage.getStore()?.tenantId || null;
// }
//
// export function getTenantDatabase(): string | null {
//     return tenantStorage.getStore()?.tenantDatabase || null;
// }