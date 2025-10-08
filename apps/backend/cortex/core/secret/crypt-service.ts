import * as bcrypt from 'bcrypt';

// Enable password logging for debugging (set to false in production)
const LOG_HASH = false;

// Generate a hash for a password
export async function generateHash(password: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    if (LOG_HASH) {
        console.log(`Hashed password: ${hash}`);
    }
    return hash;
}

// Compare a password with a stored hash
export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
    return bcrypt.compare(password, storedHash);
}