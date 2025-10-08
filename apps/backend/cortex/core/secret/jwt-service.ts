import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../app.types';
import { query } from '../../db/mdb';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-please-replace';
const MASTER_DB = process.env.MASTER_DB_NAME || 'master_db';

export async function generateJwt(user: { id: string; tenantId: string; role: string }): Promise<string> {
    const payload: JwtPayload = { id: user.id, tenantId: user.tenantId, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    await query(
        'INSERT INTO user_sessions (user_id, token, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())',
        [user.id, token], // Store plain token
        MASTER_DB
    );

    return token;
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

        const result = await query<{ expires_at: string; token: string }>(
            'SELECT expires_at, token FROM user_sessions WHERE user_id = ?',
            [payload.id],
            MASTER_DB
        );

        if (result.rows.length === 0 || new Date(result.rows[0].expires_at) < new Date()) {
            return Promise.reject(new Error('Invalid or expired token'));
        }

        if (result.rows[0].token !== token) {
            return Promise.reject(new Error('Invalid token'));
        }

        return payload;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Token verification failed');
    }
}

export async function refreshJwt(token: string): Promise<string> {
    try {
        const payload = await verifyJwt(token);
        await dropJwt(token);

        return await generateJwt({
            id: payload.id,
            tenantId: payload.tenantId,
            role: payload.role
        });
    } catch (error) {
        throw error instanceof Error ? error : new Error('Token refresh failed');
    }
}

export async function dropJwt(token: string): Promise<void> {
    await query('DELETE FROM user_sessions WHERE token = ?', [token], MASTER_DB);
}

export async function blockJwt(token: string): Promise<void> {
    await query(
        'UPDATE user_sessions SET expires_at = NOW() WHERE token = ?',
        [token],
        MASTER_DB
    );
}