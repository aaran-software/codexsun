// apps/cxsun/contacts/contact-model.ts

export interface Contact {
    id?: number;
    name: string;
    email: string;
    phone?: string | null;
    created_at?: string;
    updated_at?: string;
}