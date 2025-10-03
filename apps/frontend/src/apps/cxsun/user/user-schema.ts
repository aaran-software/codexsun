// File: apps/cxsun/user/user-schema.ts

import { z } from 'zod';

export const userSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    password_hash: z.string(),
    tenant_id: z.string(),
    role: z.string(),
    created_at: z.string(),
});

export type User = z.infer<typeof userSchema>;