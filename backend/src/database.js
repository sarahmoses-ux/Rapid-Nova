import { MongoClient, Binary } from 'mongodb';

// CVs are capped at 3 MB, below MongoDB's 16 MB document limit. Keeping
// the CV with its application makes submission writes atomic.
export async function connectDatabase({ uri = process.env.MONGODB_URI, databaseName = process.env.MONGODB_DATABASE || 'rapid_nova' } = {}) {
  if (!uri) throw new Error('Set MONGODB_URI in backend/.env before starting the backend.');
  if (!/^[a-zA-Z0-9_-]{1,63}$/.test(databaseName)) throw new Error('MONGODB_DATABASE must contain only letters, numbers, underscores, or hyphens.');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, socketTimeoutMS: 20000, maxPoolSize: 10 });
  try {
    await client.connect();
    const db = client.db(databaseName);
    const jobs = db.collection('jobs'), submissions = db.collection('submissions'), sessions = db.collection('sessions');
    await Promise.all([
      jobs.createIndex({ active: 1, created_at: -1 }),
      submissions.createIndex({ created_at: -1 }),
      sessions.createIndex({ expires: 1 }, { expireAfterSeconds: 0 }),
    ]);
    const serialize = ({ _id, ...row }) => ({ id: _id, ...row });
    return {
      db,
      async ping() { await db.command({ ping: 1 }); return true; },
      async listJobs(activeOnly = false) { return (await jobs.find(activeOnly ? { active: true } : {}).sort({ created_at: -1, _id: 1 }).toArray()).map(serialize); },
      async activeJob(id) { const job = await jobs.findOne({ _id: id, active: true }); return job ? serialize(job) : null; },
      async createJob({ id, ...job }) { await jobs.insertOne({ _id: id, ...job }); },
      async updateJob(id, values) { return (await jobs.updateOne({ _id: id }, { $set: values })).matchedCount > 0; },
      async createSubmission({ id, cv, ...submission }) { await submissions.insertOne({ _id: id, ...submission, cv: cv ? new Binary(cv) : null }); },
      async listSubmissions(page) {
        const [total, rows] = await Promise.all([submissions.countDocuments(), submissions.find({}, { projection: { cv: 0 } }).sort({ created_at: -1, _id: 1 }).skip((page - 1) * 50).limit(50).toArray()]);
        return { total, submissions: rows.map(serialize), page };
      },
      async cv(id) { const row = await submissions.findOne({ _id: id }, { projection: { cv: 1 } }); return row?.cv ? Buffer.from(row.cv.value()) : null; },
      async updateSubmission(id, values) { return (await submissions.updateOne({ _id: id }, { $set: values })).matchedCount > 0; },
      async session(hash, credential) { return sessions.findOne({ _id: hash, credential, expires: { $gt: new Date() } }); },
      async createSession(hash, credential) {
        await sessions.deleteMany({ $or: [{ expires: { $lt: new Date() } }, { credential: { $ne: credential } }] });
        await sessions.insertOne({ _id: hash, credential, expires: new Date(Date.now() + 8 * 3600 * 1000) });
      },
      async deleteSession(hash) { await sessions.deleteOne({ _id: hash }); },
      async close() { await client.close(); },
    };
  } catch (error) {
    await client.close();
    // Driver errors can contain connection details; don't expose credentials.
    throw new Error('Could not connect to MongoDB. Check MONGODB_URI, database access, and the network allowlist.', { cause: error });
  }
}
