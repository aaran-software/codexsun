import type { MenuItem } from './types';

export const mainMenuItems: MenuItem[] = [
    {
        label: 'About',
        href: '/about',
    },
    {
        label: 'Products',
        children: [
            {
                label: 'E-Commerce',
                href: '/products/ecommerce',
                description: 'Complete online store with payments & inventory',
                icon: 'ShoppingCart',
            },
            {
                label: 'Blog Platform',
                href: '/products/blog',
                description: 'SEO optimized blogging system',
                icon: 'Newspaper',
            },
            {
                label: 'CRM System',
                href: '/products/crm',
                description: 'Manage leads and customers effortlessly',
                icon: 'Users',
            },
        ],
    },
    {
        label: 'Solutions',
        children: [
            {
                label: 'For Startups',
                href: '/solutions/startups',
                description: 'Launch fast with minimal cost',
                icon: 'Rocket',
            },
            {
                label: 'For Enterprises',
                href: '/solutions/enterprise',
                description: 'Enterprise-grade security & scale',
                icon: 'Building2',
            },
        ],
    },
    {
        label: 'Modules',
        children: [
            {
                label: 'Finance',
                href: '/modules/finance',
                description: 'Invoicing, payments, expense tracking & multi-currency',
                image: '/images/module-finance.jpg',
            },
            {
                label: 'HR & Payroll',
                href: '/modules/hr',
                description: 'Employee management, attendance, payroll & leave',
                image: '/images/module-hr.jpg',
            },
            {
                label: 'Inventory',
                href: '/modules/inventory',
                description: 'Stock management, warehouse, purchase & sales orders',
                image: '/images/module-inventory.jpg',
            },
        ],
    },
    {
        label: 'Finance',
        children: [
            {
                label: 'Accounts Payable',
                href: '/finance/payable',
                description: 'Vendor bills, payments & reconciliation',
                image: '/images/finance-ap.jpg',
            },
            {
                label: 'Accounts Receivable',
                href: '/finance/receivable',
                description: 'Customer invoices & collections',
                image: '/images/finance-ar.jpg',
            },
            {
                label: 'General Ledger',
                href: '/finance/ledger',
                description: 'Journal entries & financial statements',
                image: '/images/finance-gl.jpg',
            },
        ],
    },
    {
        label: 'Sales',
        children: [
            {
                label: 'Quotes & Orders',
                href: '/sales/orders',
                description: 'Create quotes, convert to sales orders',
                image: '/images/sales-quotes.jpg',
            },
            {
                label: 'POS & Invoicing',
                href: '/sales/pos',
                description: 'Point of sale & instant invoicing',
                image: '/images/sales-pos.jpg',
            },
            {
                label: 'Customer Management',
                href: '/sales/customers',
                description: 'CRM, contacts & sales pipeline',
                image: '/images/sales-crm.jpg',
            },
        ],
    },
    {
        label: 'Blog',
        href: '/blog',
    },
    {
        label: 'Contact',
        href: '/web-contact',
    },
];

export const quickAccessLinks = [
    { title: 'All Modules', href: '/modules' },
    { title: 'Recent Activities', href: '/activities' },
    { title: 'Notifications', href: '/notifications' },
    { title: 'Help Center', href: '/help' },
];
