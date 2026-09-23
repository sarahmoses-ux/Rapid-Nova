import { Binary } from 'mongodb';

export async function migrateSQLite(sourcePath, database) {
  const { DatabaseSync } = await import('node:sqlite');
  const source = new DatabaseSync(sourcePath, { readOnly: true });
  let jobs = 0, submissions = 0;
  try {
    for (const { id, active, ...job } of source.prepare('SELECT * FROM jobs').iterate()) {
      const result = await database.db.collection('jobs').updateOne({ _id: id }, { $setOnInsert: { ...job, active: !!active } }, { upsert: true });
      jobs += result.upsertedCount;
    }
    for (const { id, data, cv, ...submission } of source.prepare('SELECT * FROM submissions').iterate()) {
      const result = await database.db.collection('submissions').updateOne({ _id: id }, { $setOnInsert: { ...submission, data: JSON.parse(data), cv: cv ? new Binary(Buffer.from(cv)) : null } }, { upsert: true });
      submissions += result.upsertedCount;
    }
    return { jobs, submissions };
  } finally { source.close(); }
}
