import { createHash, randomBytes } from 'node:crypto';
import { getDb } from '@/lib/db/mongodb';

const TTL_MS = 60 * 60 * 1000; // 1 heure

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** Crée un jeton de reset (stocke son hash + expiration), renvoie le jeton BRUT. */
export async function createResetToken(userId: string): Promise<string> {
  const raw = randomBytes(32).toString('hex');
  const db = await getDb();
  await db.collection('password_reset_tokens').insertOne({
    userId,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + TTL_MS),
    createdAt: new Date(),
  });
  return raw;
}

/** Valide un jeton (non expiré, non utilisé) et le consomme (usage unique). */
export async function consumeResetToken(userId: string, rawToken: string): Promise<boolean> {
  const db = await getDb();
  const coll = db.collection('password_reset_tokens');
  const doc = await coll.findOne({
    userId,
    tokenHash: hashToken(rawToken),
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });
  if (!doc) return false;
  await coll.updateOne({ _id: doc._id }, { $set: { usedAt: new Date() } });
  return true;
}
