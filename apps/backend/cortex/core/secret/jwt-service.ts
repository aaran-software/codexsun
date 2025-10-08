// cortex/core/secret/jwt-service.ts

import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../app.types';
import { query } from '../../db/db';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-please-replace';

export async function generateJwt(user: { id: string; tenantId: string; role: string }): Promise<string> {
    const payload: JwtPayload = { id: user.id, tenantId: user.tenantId, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    await query(
        'INSERT INTO user_sessions (user_id, token, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())',
        [user.id, token]
    );

    return token;
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

        const result = await query<{ expires_at: string }>(
            'SELECT expires_at FROM user_sessions WHERE token = ? AND user_id = ?',
            [token, payload.id]
        );

        if (result.rows.length === 0 || new Date(result.rows[0].expires_at) < new Date()) {
            throw new Error('Invalid or expired token');
        }

        return payload;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Token verification failed');
    }
}

export async function refreshJwt(token: string): Promise<string> {
    try {
        const payload = await verifyJwt(token);
        await dropJwt(token); // Remove old token

        const newToken = await generateJwt({
            id: payload.id,
            tenantId: payload.tenantId,
            role: payload.role
        });

        return newToken;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Token refresh failed');
    }
}

export async function dropJwt(token: string): Promise<void> {
    await query('DELETE FROM user_sessions WHERE token = ?', [token]);
}

export async function blockJwt(token: string): Promise<void> {
    await query(
        'UPDATE user_sessions SET expires_at = NOW() WHERE token = ?',
        [token]
    );
}