import { ObjectId, type Document } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

function toUser(d: Document): AppUser {
  return { id: d._id.toString(), email: d.email, name: d.name, passwordHash: d.passwordHash };
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const db = await getDb();
  const doc = await db.collection('users').findOne({ email: email.toLowerCase() });
  return doc ? toUser(doc) : null;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection('users').findOne({ _id: new ObjectId(id) });
  return doc ? toUser(doc) : null;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  const db = await getDb();
  await db.collection('users').updateOne(
    { _id: new ObjectId(id) },
    { $set: { passwordHash, updatedAt: new Date() } },
  );
}
