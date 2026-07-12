import bcrypt from 'bcryptjs';

/** Hachage bcrypt (coût 12). Server-only. */
export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}
