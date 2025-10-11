export interface User {
    id?: number; // Optional for creation, set by database
    username: string;
    email: string;
    password_hash?: string; // Optional, set during creation
    mobile: string | null;
    status: 'active' | 'inactive' | 'invited' | 'suspended';
    role_id: number;
    email_verified: string | null;
    created_at?: string; // Set by database
    updated_at?: string; // Set by database
}