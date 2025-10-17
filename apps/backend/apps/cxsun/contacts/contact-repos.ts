// File: apps/cxsun/contacts/contact-repos.ts

import { query, withTransaction } from '../../../cortex/db/db';
import { Contact } from './contact-model';

export class ContactRepository {

    static async getAll(tenantId: string): Promise<Contact[]> {
        const result = await query<Contact>(
            'SELECT * FROM contacts ORDER BY created_at',
            [],
            tenantId
        );
        return result.rows;
    }

    static async getById(tenantId: string, id: number): Promise<Contact | null> {
        const result = await query<Contact>(
            'SELECT * FROM contacts WHERE id = ?',
            [id],
            tenantId
        );
        return result.rows[0] || null;
    }

    static async getByEmail(tenantId: string, email: string): Promise<Contact | null> {
        const result = await query<Contact>(
            'SELECT * FROM contacts WHERE email = ?',
            [email],
            tenantId
        );
        return result.rows[0] || null;
    }

    static async create(tenantId: string, contact: Contact): Promise<Contact> {
        return await withTransaction(async (client) => {
            const insertResult = await client.query(
                `INSERT INTO contacts (name, email, phone, created_at, updated_at)
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [contact.name, contact.email, contact.phone || null]
            );

            const insertId = insertResult.insertId;
            if (!insertId) {
                throw new Error('Failed to retrieve inserted contact ID');
            }

            const selectResult = await client.query<Contact>(
                `SELECT * FROM contacts WHERE id = ?`,
                [insertId],
                tenantId
            );

            const newContact = selectResult.rows[0];
            if (!newContact) {
                throw new Error('Inserted contact not found');
            }
            return newContact;
        }, tenantId);
    }

    static async update(tenantId: string, id: number, contact: Partial<Contact>): Promise<Contact | null> {
        const updates: string[] = [];
        const values: any[] = [];

        if (contact.name !== undefined) {
            updates.push('name = ?');
            values.push(contact.name);
        }
        if (contact.email !== undefined) {
            updates.push('email = ?');
            values.push(contact.email);
        }
        if (contact.phone !== undefined) {
            updates.push('phone = ?');
            values.push(contact.phone);
        }

        if (updates.length === 0) {
            return null;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        return await withTransaction(async (client) => {
            await client.query(
                `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            const selectResult = await client.query<Contact>(
                `SELECT * FROM contacts WHERE id = ?`,
                [id]
            );
            return selectResult.rows[0] || null;
        }, tenantId);
    }

    static async delete(tenantId: string, id: number): Promise<boolean> {
        return await withTransaction(async (client) => {
            const result = await client.query(
                'DELETE FROM contacts WHERE id = ?',
                [id]
            );
            return result.rowCount > 0;
        }, tenantId);
    }

}