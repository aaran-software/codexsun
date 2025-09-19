// apps/cxsun/core/user/user.model.ts

export interface User {
    id: number;          // SERIAL PRIMARY KEY
    name: string;
    email: string;
    password: string;    // plain text for now
    status: string;      // default 'active'
    created_at: Date;
    updated_at: Date;
}
