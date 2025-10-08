import * as bcrypt from 'bcrypt';
import { query } from '../../db/db';

// Toggle between bcrypt and plain-text (set to false for plain-text testing)
const USE_BCRYPT = true;
const LOG_HASH = false; // Set to true to log hashed passwords to console

// Hash and compare passwords using bcrypt
export async function hashAndCompare(password: string, storedHash?: string): Promise<string | boolean> {
    if (!USE_BCRYPT) {
        throw new Error('Bcrypt mode disabled; use plainText function');
    }

    if (storedHash === undefined) {
        // Hash new password
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        if (LOG_HASH) {
            console.log(`Hashed password: ${hash}`);
        }
        return hash;
    }

    // Compare provided password with stored hash
    return bcrypt.compare(password, storedHash);
}

// Handle plain-text passwords
export async function plainText(password: string, storedPassword?: string): Promise<string | boolean> {
    if (USE_BCRYPT) {
        throw new Error('Plain-text mode disabled; use hashAndCompare function');
    }

    if (storedPassword === undefined) {
        if (LOG_HASH) {
            console.log(`Plain-text password: ${password}`);
        }
        return password;
    }

    return password === storedPassword;
}

// Retrieve password from users table
export async function connectAndReturnPassword(email: string): Promise<string | null> {
    try {
        const result = await query<{ password_hash: string }>(
            'SELECT password_hash FROM users WHERE email = ?',
            [email]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const password = result.rows[0].password_hash;
        if (LOG_HASH) {
            console.log(`Retrieved password for ${email}: ${password}`);
        }
        return password;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to retrieve password');
    }
}

// Compare provided password with stored password (bcrypt or plain-text based on USE_BCRYPT)
export async function decodePassword(password: string, email: string): Promise<boolean> {
    const storedPassword = await connectAndReturnPassword(email);
    if (!storedPassword) {
        return false;
    }

    if (USE_BCRYPT) {
        return hashAndCompare(password, storedPassword) as Promise<boolean>;
    }
    return plainText(password, storedPassword) as Promise<boolean>;
}