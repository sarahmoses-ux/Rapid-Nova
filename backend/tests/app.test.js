import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth.js';
import { startTestMongo, testDatabaseName, dropTestDatabase } from './mongo.js';
import { migrateSQLite } from '../src/migration.js';

let mongo;
before(async () => { mongo = await startTestMongo(); });
after(async () => { await mongo?.stop(); });

const password = 'test-only-strong-password-123';
const admin = { email: 'admin@example.test', passwordHash: await hashPassword(password) };
const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
const application = { name: 'Test Candidate', email: 'candidate@example.test', phone: '+1 555 0100', role: 'Registered Nurse', location: 'Test City', consent: true, message: 'Available for travel assignments.', cv: { name: 'cv.pdf', base64: pdf.toString('base64') } };
async function start(t, options = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'rapid-nova-test-'));
  const distDir = join(directory, 'dist'); mkdirSync(distDir); writeFileSync(join(distDir, 'index.html'), '<html>Rapid Nova</html>');
  const mongoUri = mongo.getUri(), databaseName = testDatabaseName();
  let app = await createApp({ mongoUri, databaseName, distDir, admin, ...options });
  await new Promise(done => app.server.listen(0, '127.0.0.1', done));
  let base = `http://127.0.0.1:${app.server.address().port}`;
  t.after(async () => { await app.close(); await dropTestDatabase(mongoUri, databaseName); rmSync(directory, { recursive: true, force: true }); });
  let cookie = '';
  return {
    app: () => app,
    async request(path, method = 'GET', data, extra = {}) {
      return fetch(base + path, { method, headers: { ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...extra }, body: data === undefined ? undefined : JSON.stringify(data) });
    },
    async login() { const response = await this.request('/api/admin/login', 'POST', { email: admin.email, password }); assert.equal(response.status, 200); cookie = response.headers.get('set-cookie').split(';')[0]; return response; },
    async restart() { await app.close(); app = await createApp({ mongoUri, databaseName, distDir, admin, ...options }); await new Promise(done => app.server.listen(0, '127.0.0.1', done)); base = `http://127.0.0.1:${app.server.address().port}`; },
  };
}

test('application, private CV, admin review, persistence, and logout work end to end', async t => {
  const client = await start(t);
  const response = await client.request('/api/applications', 'POST', application);
  assert.equal(response.status, 201); const { id } = await response.json();
  assert.equal((await client.request('/api/admin/submissions')).status, 401);
  assert.equal((await client.request(`/api/admin/submissions/${id}/cv`)).status, 401);
  const login = await client.login(); assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  let inbox = await (await client.request('/api/admin/submissions')).json();
  assert.equal(inbox.total, 1); assert.equal(inbox.submissions[0].data.email, application.email); assert.equal(inbox.submissions[0].cv, undefined);
  const cv = await client.request(`/api/admin/submissions/${id}/cv`); assert.equal(cv.status, 200); assert.match(cv.headers.get('content-disposition'), /^attachment/); assert.deepEqual(Buffer.from(await cv.arrayBuffer()), pdf);
  assert.equal((await client.request(`/api/admin/submissions/${id}`, 'PATCH', { status: 'reviewing', notes: 'Call about availability.' })).status, 200);
  await client.restart();
  inbox = await (await client.request('/api/admin/submissions')).json(); assert.equal(inbox.submissions[0].status, 'reviewing'); assert.equal(inbox.submissions[0].notes, 'Call about availability.');
  assert.equal((await client.request('/api/admin/logout', 'POST')).status, 200);
  assert.equal((await client.request('/api/admin/submissions')).status, 401);
});

test('jobs publish, filter, attach to applications, edit and close', async t => {
  const client = await start(t);
  const job = { title: 'Travel Nurse', location: 'Test City', placement: 'Travel', description: 'Registered nurse for a travel assignment.', active: true };
  assert.equal((await client.request('/api/admin/jobs', 'POST', job)).status, 401);
  await client.login();
  const created = await client.request('/api/admin/jobs', 'POST', job); assert.equal(created.status, 201); const { id } = await created.json();
  assert.equal((await (await client.request('/api/jobs?q=nurse&location=test')).json()).jobs.length, 1);
  assert.equal((await (await client.request('/api/jobs?q=therapist')).json()).jobs.length, 0);
  assert.equal((await client.request('/api/applications', 'POST', { ...application, jobId: id })).status, 201);
  const inbox = await (await client.request('/api/admin/submissions')).json(); assert.equal(inbox.submissions[0].data.jobTitle, job.title);
  assert.equal((await client.request(`/api/admin/jobs/${id}`, 'PATCH', { ...job, active: false })).status, 200);
  assert.equal((await (await client.request('/api/jobs')).json()).jobs.length, 0);
  assert.equal((await client.request('/api/applications', 'POST', { ...application, jobId: id })).status, 400);
});

test('facility and general enquiries are stored with validation', async t => {
  const client = await start(t);
  const data = { name: 'Facility Contact', email: 'facility@example.test', consent: true, facility: 'Test Clinic', role: 'Allied Health', location: 'Test City', placement: 'Temporary-to-permanent', headcount: 3 };
  assert.equal((await client.request('/api/staffing-requests', 'POST', { ...data, headcount: 0 })).status, 400);
  assert.equal((await client.request('/api/staffing-requests', 'POST', data)).status, 201);
  assert.equal((await client.request('/api/contact', 'POST', { name: 'Contact', email: 'contact@example.test', message: 'Please get in touch.', consent: true })).status, 201);
  await client.login(); const inbox = await (await client.request('/api/admin/submissions')).json(); assert.equal(inbox.total, 2); assert.equal(inbox.submissions.find(item => item.kind === 'staffing').data.headcount, 3);
});

test('reject invalid CVs, missing consent, malformed data, and cross-origin writes', async t => {
  const client = await start(t);
  assert.equal((await client.request('/api/applications', 'POST', { ...application, consent: false })).status, 400);
  assert.equal((await client.request('/api/applications', 'POST', { ...application, cv: { name: 'fake.pdf', base64: Buffer.from('not a PDF').toString('base64') } })).status, 400);
  assert.equal((await client.request('/api/applications', 'POST', { ...application, cv: { name: 'large.pdf', base64: Buffer.alloc(3 * 1024 * 1024 + 1).toString('base64') } })).status, 413);
  assert.equal((await client.request('/api/applications', 'POST', application, { Origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await client.request('/api/applications', 'POST', { ...application, email: 'bad-address' })).status, 400);
  assert.equal((await client.request('/api/applications', 'POST', { ...application, website: 'spam' })).status, 400);
  assert.equal((await client.request('/api/contact', 'POST', null)).status, 400);
  assert.equal((await client.request('/api/admin/login', 'POST', { email: admin.email, password: 'wrong-password' })).status, 401);
  assert.equal((await client.request('/data/rapid-nova.sqlite')).status, 404);
  assert.equal((await client.request('/admin')).status, 200);
});

test('login attempts are throttled and production uses secure cookies', async t => {
  const client = await start(t, { production: true, publicOrigin: 'https://rapidnova.example' });
  const login = await client.login(); assert.match(login.headers.get('set-cookie'), /; Secure/);
  for (let i = 0; i < 9; i++) assert.equal((await client.request('/api/admin/login', 'POST', { email: admin.email, password: 'wrong' })).status, 401);
  assert.equal((await client.request('/api/admin/login', 'POST', { email: admin.email, password })).status, 429);
});

test('missing admin credentials leave admin access closed', async t => {
  const client = await start(t, { admin: undefined });
  assert.equal((await client.request('/api/admin/login', 'POST', { email: admin.email, password })).status, 503);
  assert.equal((await client.request('/api/admin/session')).status, 401);
});

test('expired sessions are rejected even before MongoDB TTL cleanup', async t => {
  const client = await start(t); await client.login();
  await client.app().database.db.collection('sessions').updateMany({}, { $set: { expires: new Date(0) } });
  assert.equal((await client.request('/api/admin/session')).status, 401);
  const indexes = await client.app().database.db.collection('sessions').indexes();
  assert.ok(indexes.some(index => index.expireAfterSeconds === 0 && index.key.expires === 1));
});

test('SQLite migration preserves CVs and can be repeated without overwriting MongoDB changes', async t => {
  const { DatabaseSync } = await import('node:sqlite');
  const directory = mkdtempSync(join(tmpdir(), 'rapid-nova-migration-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const sourcePath = join(directory, 'legacy.sqlite');
  const source = new DatabaseSync(sourcePath);
  source.exec(`CREATE TABLE jobs (id TEXT PRIMARY KEY, title TEXT, location TEXT, placement TEXT, description TEXT, active INTEGER, created_at TEXT);
    CREATE TABLE submissions (id TEXT PRIMARY KEY, kind TEXT, data TEXT, status TEXT, notes TEXT, cv BLOB, cv_name TEXT, created_at TEXT);`);
  source.prepare('INSERT INTO jobs VALUES (?, ?, ?, ?, ?, ?, ?)').run('legacy-job', 'Travel Nurse', 'Test City', 'Travel', 'Test role', 1, new Date().toISOString());
  source.prepare('INSERT INTO submissions VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run('legacy-application', 'application', JSON.stringify({ name: 'Legacy Candidate' }), 'new', '', pdf, 'cv.pdf', new Date().toISOString());
  source.close();
  const client = await start(t), database = client.app().database;
  assert.deepEqual(await migrateSQLite(sourcePath, database), { jobs: 1, submissions: 1 });
  assert.deepEqual(await database.cv('legacy-application'), pdf);
  assert.equal((await database.listJobs(true))[0].title, 'Travel Nurse');
  await database.updateSubmission('legacy-application', { status: 'reviewing', notes: 'Keep these changes.' });
  assert.deepEqual(await migrateSQLite(sourcePath, database), { jobs: 0, submissions: 0 });
  const inbox = await database.listSubmissions(1); assert.equal(inbox.submissions[0].notes, 'Keep these changes.');
  const check = new DatabaseSync(sourcePath, { readOnly: true });
  assert.equal(check.prepare('SELECT status FROM submissions').get().status, 'new'); check.close();
});

test('backend refuses to start without a MongoDB connection string', async () => {
  await assert.rejects(createApp({ mongoUri: '' }), /Set MONGODB_URI/);
});
