import { resolve } from 'node:path';
import { configuredDataDir } from './paths.js';
import { connectDatabase } from './database.js';
import { migrateSQLite } from './migration.js';

let database;
try {
  database = await connectDatabase();
  const source = process.argv[2] ? resolve(process.argv[2]) : resolve(configuredDataDir(), 'rapid-nova.sqlite');
  const result = await migrateSQLite(source, database);
  console.log(`Imported ${result.jobs} vacancies and ${result.submissions} submissions. Existing MongoDB records and the source SQLite database were preserved. Sessions are not imported; sign in again.`);
} catch { console.error('Migration failed. Check the source file and MongoDB configuration. The SQLite file has not been changed; the import can be retried.'); process.exitCode = 1; }
finally { await database?.close(); }
