// export interface User {
//     id?: number; // Optional for creation, set by database
//     username: string;
//     email: string;
//     password_hash?: string; // Handled by service, not sent in response
//     mobile: string | null;
//     status: 'active' | 'inactive' | 'invited' | 'suspended';
//     role: 'admin' | 'user';
//     tenant_id: string;
//     created_at?: string; // Set by database
// }