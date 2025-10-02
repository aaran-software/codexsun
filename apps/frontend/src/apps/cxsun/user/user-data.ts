import { z } from "zod";

export const schema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    password_hash: z.string(),
    tenant_id: z.string(),
    role: z.string(),
    created_at: z.string(),
});

export const roles = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Editor', value: 'Editor' },
    { label: 'Viewer', value: 'Viewer' },
];