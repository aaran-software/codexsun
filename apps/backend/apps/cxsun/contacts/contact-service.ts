// File: apps/cxsun/contacts/contact-service.ts

import { ContactRepository } from './contact-repos';
import { Contact } from './contact-model';


export class ContactService {

    static async getAll(tenantId: string): Promise<Contact[]> {
        return await ContactRepository.getAll(tenantId);
    }

    static async getById(tenantId: string, id: number): Promise<Contact> {
        const customer = await ContactRepository.getById(tenantId, id);
        if (!customer) {
            throw new Error(`Contact with ID ${id} not found`);
        }
        return customer;
    }

    static async create(tenantId: string, customer: Contact): Promise<Contact> {
        if (!customer.name || !customer.email) {
            throw new Error('Contact name and email are required');
        }
        const existing = await ContactRepository.getByEmail(tenantId, customer.email);
        if (existing) {
            throw new Error(`Contact with email ${customer.email} already exists`);
        }
        return await ContactRepository.create(tenantId, customer);
    }

    static async update(tenantId: string, id: number, customer: Partial<Contact>): Promise<Contact> {
        if (!Object.keys(customer).length) {
            throw new Error('No updates provided');
        }
        if (customer.email) {
            const existing = await ContactRepository.getByEmail(tenantId, customer.email);
            if (existing && existing.id !== id) {
                throw new Error(`Contact with email ${customer.email} already exists`);
            }
        }
        const updatedContact = await ContactRepository.update(tenantId, id, customer);
        if (!updatedContact) {
            throw new Error(`Contact with ID ${id} not found`);
        }
        return updatedContact;
    }

    static async delete(tenantId: string, id: number): Promise<void> {
        const deleted = await ContactRepository.delete(tenantId, id);
        if (!deleted) {
            throw new Error(`Contact with ID ${id} not found`);
        }
    }
}