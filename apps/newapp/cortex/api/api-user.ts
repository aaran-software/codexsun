// cortex/api/api-user.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from '../db/db'; // Assuming this is the path to the query function in db.ts

export function createUserRouter() {
    const router = express.Router();

    // Authentication middleware
    const authenticate = async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, 'secret'); // Use process.env.JWT_SECRET in production
            req.user = decoded;

            const tenantId = req.headers['x-tenant-id'];
            if (!tenantId || tenantId !== decoded.tenant_id) {
                return res.status(403).json({ error: 'Tenant ID mismatch' });
            }

            next();
        } catch (err) {
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    };

    router.use(authenticate);

    // POST /users - Create user (admin only)
    router.post('/', async (req, res) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { username, email, password, role = 'user' } = req.body;
        const tenantId = req.headers['x-tenant-id'];

        try {
            const password_hash = await bcrypt.hash(password, 10);
            const result = await query(
                'INSERT INTO users (username, email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?, ?)',
                [username, email, password_hash, role, tenantId],
                tenantId
            );

            const id = result.insertId;
            const users = await query(
                'SELECT id, username, email, role, tenant_id, created_at FROM users WHERE id = ?',
                [id],
                tenantId
            );

            res.status(201).json(users[0]);
        } catch (err) {
            console.error('MariaDB query error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: err.sqlMessage });
            } else {
                res.status(500).json({ error: 'Server error' });
            }
        }
    });

    // GET /users/:id - Get user by ID (admin or self)
    router.get('/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({ error: 'Cannot access another user' });
        }

        const tenantId = req.headers['x-tenant-id'];

        try {
            const users = await query(
                'SELECT id, username, email, role, tenant_id, created_at FROM users WHERE id = ?',
                [id],
                tenantId
            );

            if (!users.length) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(users[0]);
        } catch (err) {
            console.error('MariaDB query error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // GET /users/email/:email - Get user by email (admin only)
    router.get('/email/:email', async (req, res) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const email = req.params.email;
        const tenantId = req.headers['x-tenant-id'];

        try {
            const users = await query(
                'SELECT id, username, email, role, tenant_id, created_at FROM users WHERE email = ?',
                [email],
                tenantId
            );

            if (!users.length) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(users[0]);
        } catch (err) {
            console.error('MariaDB query error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // PUT /users/:id - Update user (admin or self)
    router.put('/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({ error: 'Admin access required or cannot modify another user' });
        }

        const { username, email, password } = req.body;
        const tenantId = req.headers['x-tenant-id'];

        const fields = [];
        const params = [];

        if (username) {
            fields.push('username = ?');
            params.push(username);
        }
        if (email) {
            fields.push('email = ?');
            params.push(email);
        }
        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            fields.push('password_hash = ?');
            params.push(password_hash);
        }

        if (!fields.length) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);

        try {
            await query(
                `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                params,
                tenantId
            );

            const users = await query(
                'SELECT id, username, email, role, tenant_id, created_at FROM users WHERE id = ?',
                [id],
                tenantId
            );

            res.json(users[0]);
        } catch (err) {
            console.error('MariaDB query error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: err.sqlMessage });
            } else {
                res.status(500).json({ error: 'Server error' });
            }
        }
    });

    // DELETE /users/:id - Delete user (admin only)
    router.delete('/:id', async (req, res) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const tenantId = req.headers['x-tenant-id'];

        try {
            const result = await query('DELETE FROM users WHERE id = ?', [id], tenantId);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(204).send();
        } catch (err) {
            console.error('MariaDB query error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // POST /users/verify - Verify password (admin only)
    router.post('/verify', async (req, res) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id, password } = req.body;
        const tenantId = req.headers['x-tenant-id'];

        try {
            const users = await query('SELECT password_hash FROM users WHERE id = ?', [id], tenantId);
            if (!users.length) {
                return res.json({ isValid: false });
            }

            const isValid = await bcrypt.compare(password, users[0].password_hash);
            res.json({ isValid });
        } catch (err) {
            console.error('MariaDB query error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
}