import crypto from "crypto";

const ITERATIONS = 100000;
const KEY_LEN = 32; // 256 bits
const DIGEST = "sha256";

/**
 * Hashes a password using PBKDF2 SHA-256.
 * Returns a formatted string: pbkdf2:sha256:iterations:salt:hash
 */
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex");
    return `pbkdf2:sha256:${ITERATIONS}:${salt}:${hash}`;
}

/**
 * Verifies a password against a stored PBKDF2 SHA-256 hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
    if (!storedHash || !storedHash.startsWith("pbkdf2:sha256:")) {
        return false;
    }
    try {
        const parts = storedHash.split(":");
        if (parts.length !== 5) {
            return false;
        }
        const iterations = parseInt(parts[2], 10);
        const salt = parts[3];
        const originalHash = parts[4];
        
        const hash = crypto.pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST).toString("hex");
        return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
    } catch (err) {
        console.error("Error verifying password:", err);
        return false;
    }
}

/**
 * Checks if the stored password hash is a valid PBKDF2 SHA-256 hash.
 */
export function isPasswordSet(storedHash: string): boolean {
    return !!storedHash && storedHash.startsWith("pbkdf2:sha256:");
}
