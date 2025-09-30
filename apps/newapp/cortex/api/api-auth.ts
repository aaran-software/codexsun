// cortex/api/api-auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from '../db/db'; // Assuming this is the path to the query function in db.ts

export function createAuthRouter() {
    const router = express.Router();

    router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const tenantId = req.headers['x-tenant-id'];

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID required' });
        }

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        try {
            const users = await query('SELECT * FROM users WHERE email = ?', [email], tenantId);
            const user = users[0];

            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role, tenant_id: user.tenant_id },
                'secret', // Use process.env.JWT_SECRET in production
                { expiresIn: '1h' }
            );

            res.json({ token });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
}