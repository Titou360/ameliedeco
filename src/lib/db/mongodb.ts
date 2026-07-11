import { MongoClient, type Db } from 'mongodb';

/**
 * Client MongoDB partagé. Réutilisé entre invocations serverless et entre
 * rechargements à chaud (dev) via un cache sur `globalThis`. Timeout de
 * sélection court pour échouer vite si le cluster est injoignable (le repo
 * appelant capte l'erreur et renvoie du vide).
 */
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI manquant (voir .env.local).');
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    }).connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB;
  if (!dbName) throw new Error('MONGODB_DB manquant (voir .env.local).');
  const client = await clientPromise();
  return client.db(dbName);
}
