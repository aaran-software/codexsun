// cortex/migrations/seeder/tenant/003_contacts_seeder.ts

import { query, withTransaction } from '../../../db/db';

/**
 * Seeds the contacts table in a tenant database with initial data.
 */
export class ContactsSeeder {
    // Check if a Contact exists by name
    private async contactExists(name: string, tenantId: string, userId: string): Promise<boolean> {
        const result = await query<{ name: string }>(
            `SELECT name FROM contacts WHERE name = ? AND user_id = ?`,
            [name, userId],
            tenantId
        );
        return result.rows.length > 0;
    }

    // Insert a Contact
    private async insertContact(
        name: string,
        email: string,
        phone: string | null,
        userId: string,
        tenantId: string
    ): Promise<void> {
        await query(
            `INSERT INTO contacts (name, email, phone, user_id, created_at, updated_at)
VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [name, email, phone, userId],
            tenantId
        );
        console.log(`Seeded contact: ${name} for user '${userId}' in tenant '${tenantId}'`);
    }

    async up(tenantId: string = 'default'): Promise<void> {
        console.log(`Seeding contacts table for tenant '${tenantId}'`);
        try {
            const contacts = [
                { name: 'sundar', email: 'sundar@sundar.com', phone: '9655227738', user_id: '1' },
                { name: 'arunesh', email: 'arunesh@arunesh.com', phone: '7373029500', user_id: '1' },
                { name: 'muki', email: 'muki@muki.com', phone: '7373029500', user_id: '1' },
            ];
            await withTransaction(async (client) => {
                for (const contact of contacts) {
                    if (!contact.name || !contact.email || !contact.user_id) {
                        console.log(`Skipping invalid contact: ${JSON.stringify(contact)}`);
                        continue;
                    }
                    if (await this.contactExists(contact.name, tenantId, contact.user_id)) {
                        console.log(`Contact '${contact.name}' already exists for user '${contact.user_id}' in tenant '${tenantId}', skipping insertion`);
                        continue;
                    }
                    await this.insertContact(
                        contact.name,
                        contact.email,
                        contact.phone || null,
                        contact.user_id,
                        tenantId
                    );
                }
            }, tenantId);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error seeding contacts table for tenant '${tenantId}': ${error.message}`);
            throw error;
        }
    }

    async down(tenantId: string = 'default'): Promise<void> {
        console.log(`Rolling back contacts table seed for tenant '${tenantId}'`);
        try {
            const userId = '1';
            await withTransaction(async (client) => {
                await client.query(
                    `DELETE FROM contacts WHERE name IN (?, ?, ?) AND user_id = ?`,
                    ['sundar', 'arunesh', 'muki', userId],
                    tenantId
                );
            }, tenantId);
            console.log(`Rolled back contacts seed for tenant '${tenantId}'`);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            console.error(`Error rolling back contacts table seed for tenant '${tenantId}': ${error.message}`);
            throw error;
        }
    }
}

export default ContactsSeeder;