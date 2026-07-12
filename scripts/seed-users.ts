import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

const accounts = [
  { email: 'amelie.megdad@gmail.com', name: 'Amélie Megdad', pwEnv: 'SEED_AMELIE_PASSWORD' },
  { email: 'clement@nemosolutions.fr', name: 'Clément', pwEnv: 'SEED_CLEMENT_PASSWORD' },
];

async function main() {
  if (!uri || !dbName) throw new Error('MONGODB_URI / MONGODB_DB manquants (voir .env.local).');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  for (const acc of accounts) {
    const pw = process.env[acc.pwEnv];
    if (!pw) {
      console.warn(`⚠ ${acc.pwEnv} manquant — ${acc.email} ignoré.`);
      continue;
    }
    const passwordHash = await bcrypt.hash(pw, 12);
    const now = new Date();
    await db.collection('users').updateOne(
      { email: acc.email },
      { $set: { email: acc.email, name: acc.name, passwordHash, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
    console.log(`✔ ${acc.email} seedé.`);
  }
  await client.close();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
