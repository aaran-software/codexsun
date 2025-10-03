import { z } from 'zod'

// const userStatusSchema = z.union([
//     z.literal('active'),
//     z.literal('inactive'),
//     z.literal('invited'),
//     z.literal('suspended'),
// ])
// export type UserStatus = z.infer<typeof userStatusSchema>

export const userRoleSchema = z.union([
    z.literal('superadmin'),
    z.literal('admin'),
    z.literal('cashier'),
    z.literal('manager'),
])

const userSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    mobile: z.literal(null),
    status: z.literal('active'),
    role: userRoleSchema,
    createdAt: z.coerce.date(),
    tenant_id: z.string(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)