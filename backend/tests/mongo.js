import { MongoMemoryServer } from 'mongodb-memory-server';
import { randomUUID } from 'node:crypto';
import { connectDatabase } from '../src/database.js';

// A real disposable MongoDB process; never use application/Atlas credentials in tests.
export const startTestMongo = () => MongoMemoryServer.create({ binary: { version: '8.2.6' } });
export const testDatabaseName = () => `rapid_nova_test_${randomUUID().replaceAll('-', '')}`;
export async function dropTestDatabase(uri, databaseName) {
  if (!databaseName.startsWith('rapid_nova_test_')) throw new Error('Refusing to drop a non-test database.');
  const database = await connectDatabase({ uri, databaseName });
  try { await database.db.dropDatabase(); } finally { await database.close(); }
}
