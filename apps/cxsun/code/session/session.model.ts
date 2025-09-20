// apps/cxsun/code/session/session.model.ts

export interface Session {
    id: number;          // SERIAL PRIMARY KEY
    user_id: number;     // References users(id)
    token: string;       // JWT token
    expires_at: Date;    // Token expiry
    revoked: boolean;    // Revocation status
    created_at: Date;    // Creation timestamp
    updated_at: Date;    // Update timestamp
}