import { createServer } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { verifyPassword, tokenHash } from './auth.js';
import { defaultDistDir } from './paths.js';
import { connectDatabase } from './database.js';

const MAX_BODY = 4.2 * 1024 * 1024;
const MAX_CV = 3 * 1024 * 1024;
const statuses = ['new', 'reviewing', 'contacted', 'placed', 'closed'];
export const placements = ['Travel', 'Contract', 'Permanent', 'Temporary-to-permanent', 'Per diem'];
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
function field(value, label, max = 200, required = true) {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new HttpError(400, `${label} is required and must be under ${max + 1} characters.`);
  return value.trim();
}
function email(value) {
  const text = field(value, 'Email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw new HttpError(400, 'Enter a valid email address.');
  return text;
}
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new HttpError(415, 'Send JSON data.');
  if (Number(req.headers['content-length']) > MAX_BODY) throw new HttpError(413, 'Upload a PDF under 3 MB.');
  // Vercel's Node helpers may already have parsed the JSON request stream.
  if (req.body !== undefined) {
    let value = req.body;
    if (Buffer.isBuffer(value)) value = value.toString();
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch { throw new HttpError(400, 'Invalid request data.'); }
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Invalid request data.');
    if (Buffer.byteLength(JSON.stringify(value)) > MAX_BODY) throw new HttpError(413, 'Upload a PDF under 3 MB.');
    return value;
  }
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new HttpError(413, 'Upload a PDF under 3 MB.');
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString());
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new HttpError(400, 'Invalid request data.'); }
}

export async function createApp({ mongoUri, databaseName, distDir = defaultDistDir, admin, production = false, publicOrigin } = {}) {
  if (production && (!publicOrigin || new URL(publicOrigin).protocol !== 'https:')) throw new Error('Production requires an HTTPS PUBLIC_ORIGIN.');
  const database = await connectDatabase({ uri: mongoUri, databaseName });
  const limits = new Map();
  function limit(req, group, max) {
    const now = Date.now();
    for (const [key, value] of limits) if (value.reset < now) limits.delete(key);
    // Do not trust caller-supplied proxy headers. Shared proxy addresses share a limit.
    const key = `${group}:${req.socket.remoteAddress}`;
    const entry = limits.get(key) || { count: 0, reset: now + 15 * 60 * 1000 };
    entry.count++; limits.set(key, entry);
    if (entry.count > max) throw new HttpError(429, 'Too many attempts. Please try again in 15 minutes.');
  }
  async function requireAdmin(req) {
    const token = /(?:^|;\s*)rn_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
    if (!token || !admin) throw new HttpError(401, 'Please sign in.');
    const session = await database.session(tokenHash(token), tokenHash(admin.passwordHash));
    if (!session) throw new HttpError(401, 'Your session has expired. Please sign in again.');
    return token;
  }
  function cookie(token, age = 8 * 3600) {
    return `rn_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${age}${production ? '; Secure' : ''}`;
  }
  function jobData(input) {
    const placement = field(input.placement, 'Placement');
    if (!placements.includes(placement)) throw new HttpError(400, 'Choose a valid placement type.');
    if (input.active !== undefined && typeof input.active !== 'boolean') throw new HttpError(400, 'Invalid job visibility.');
    return { title: field(input.title, 'Job title'), location: field(input.location, 'Location'), placement, description: field(input.description, 'Description', 10000), active: input.active !== false };
  }
  const handler = async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (production) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
    try {
      const url = new URL(req.url, 'http://localhost');
      const path = url.pathname;
      if (path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store');
        if (!['GET', 'HEAD'].includes(req.method)) {
          const origin = req.headers.origin;
          const allowed = publicOrigin ? [new URL(publicOrigin).origin] : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001', 'http://127.0.0.1:3001'];
          if ((origin && !allowed.includes(origin)) || req.headers['sec-fetch-site'] === 'cross-site') throw new HttpError(403, 'Request origin is not allowed.');
        }
        if (req.method === 'GET' && path === '/api/health') {
          try { return json(200, { ok: await database.ping() }); }
          catch { return json(503, { ok: false, error: 'Database unavailable.' }); }
        }
        if (req.method === 'GET' && path === '/api/jobs') {
          const q = (url.searchParams.get('q') || '').slice(0, 200).toLowerCase();
          const location = (url.searchParams.get('location') || '').slice(0, 200).toLowerCase();
          return json(200, { jobs: (await database.listJobs(true)).filter(job => `${job.title} ${job.description} ${job.placement}`.toLowerCase().includes(q) && job.location.toLowerCase().includes(location)) });
        }
        if (req.method === 'POST' && ['/api/applications', '/api/staffing-requests', '/api/contact'].includes(path)) {
          limit(req, 'submission', 15);
          const input = await body(req);
          if (input.website) throw new HttpError(400, 'Unable to accept this submission.');
          if (input.consent !== true) throw new HttpError(400, 'Please agree to be contacted about this request.');
          const data = { name: field(input.name, 'Name', 120), email: email(input.email), phone: field(input.phone || '', 'Phone', 50, false), message: field(input.message || '', 'Message', 5000, false), consent: true, consentAt: new Date().toISOString(), consentVersion: 'contact-request-v1' };
          let cv = null, cvName = null;
          const kind = path === '/api/applications' ? 'application' : path === '/api/staffing-requests' ? 'staffing' : 'contact';
          if (kind === 'application') {
            data.role = field(input.role, 'Role'); data.location = field(input.location, 'Location');
            if (input.jobId) {
              const job = await database.activeJob(field(input.jobId, 'Job ID', 50));
              if (!job) throw new HttpError(400, 'This vacancy is no longer available. Submit a general application instead.');
              data.jobId = job.id; data.jobTitle = job.title;
            }
            if (!input.cv || typeof input.cv.base64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(input.cv.base64)) throw new HttpError(400, 'Attach your CV as a PDF under 3 MB.');
            cvName = field(input.cv.name, 'CV filename', 180);
            cv = Buffer.from(input.cv.base64, 'base64');
            if (cv.length > MAX_CV) throw new HttpError(413, 'Upload a PDF under 3 MB.');
            if (!/\.pdf$/i.test(cvName) || cv.length < 8 || cv.subarray(0, 5).toString() !== '%PDF-' || !cv.subarray(-1024).includes(Buffer.from('%%EOF'))) throw new HttpError(400, 'Attach a valid PDF document.');
          }
          if (kind === 'staffing') {
            data.facility = field(input.facility, 'Facility'); data.role = field(input.role, 'Role'); data.location = field(input.location, 'Location');
            data.placement = field(input.placement, 'Placement');
            if (!placements.includes(data.placement)) throw new HttpError(400, 'Choose a valid placement type.');
            if (!Number.isInteger(input.headcount) || input.headcount < 1 || input.headcount > 1000) throw new HttpError(400, 'Headcount must be between 1 and 1000.');
            data.headcount = input.headcount;
          }
          if (kind === 'contact' && !data.message) throw new HttpError(400, 'Please enter your message.');
          const id = randomUUID();
          await database.createSubmission({ id, kind, data, status: 'new', notes: '', cv, cv_name: cvName, created_at: new Date().toISOString() });
          return json(201, { id, message: 'Your submission has been received.' });
        }
        if (req.method === 'POST' && path === '/api/admin/login') {
          limit(req, 'login', 10);
          const input = await body(req);
          if (!admin) throw new HttpError(503, 'Admin access has not been configured.');
          const loginEmail = email(input.email);
          field(input.password, 'Password', 256);
          const password = input.password;
          const valid = await verifyPassword(password, admin.passwordHash);
          if (!valid || loginEmail !== admin.email.toLowerCase()) throw new HttpError(401, 'Email or password is incorrect.');
          const token = randomBytes(32).toString('hex');
          await database.createSession(tokenHash(token), tokenHash(admin.passwordHash));
          res.setHeader('Set-Cookie', cookie(token));
          return json(200, { email: admin.email });
        }
        if (path.startsWith('/api/admin/')) {
          const token = await requireAdmin(req);
          if (req.method === 'GET' && path === '/api/admin/session') return json(200, { email: admin.email });
          if (req.method === 'POST' && path === '/api/admin/logout') {
            await database.deleteSession(tokenHash(token));
            res.setHeader('Set-Cookie', cookie('', 0)); return json(200, { ok: true });
          }
          if (req.method === 'GET' && path === '/api/admin/submissions') {
            const page = Math.max(1, Math.min(100000, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1));
            return json(200, await database.listSubmissions(page));
          }
          const cvMatch = /^\/api\/admin\/submissions\/([a-f0-9-]{36})\/cv$/.exec(path);
          if (req.method === 'GET' && cvMatch) {
            const cv = await database.cv(cvMatch[1]);
            if (!cv) throw new HttpError(404, 'CV not found.');
            res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="cv-${cvMatch[1]}.pdf"`, 'Content-Security-Policy': "sandbox; default-src 'none'" });
            return res.end(cv);
          }
          const submissionMatch = /^\/api\/admin\/submissions\/([a-f0-9-]{36})$/.exec(path);
          if (req.method === 'PATCH' && submissionMatch) {
            const input = await body(req);
            if (!statuses.includes(input.status)) throw new HttpError(400, 'Invalid status.');
            const notes = field(input.notes || '', 'Notes', 10000, false);
            if (!await database.updateSubmission(submissionMatch[1], { status: input.status, notes })) throw new HttpError(404, 'Submission not found.');
            return json(200, { ok: true });
          }
          if (req.method === 'GET' && path === '/api/admin/jobs') return json(200, { jobs: await database.listJobs() });
          if (req.method === 'POST' && path === '/api/admin/jobs') {
            const input = await body(req), values = jobData(input), id = randomUUID();
            await database.createJob({ id, ...values, created_at: new Date().toISOString() });
            return json(201, { id });
          }
          const jobMatch = /^\/api\/admin\/jobs\/([a-f0-9-]{36})$/.exec(path);
          if (req.method === 'PATCH' && jobMatch) {
            const values = jobData(await body(req));
            if (!await database.updateJob(jobMatch[1], values)) throw new HttpError(404, 'Job not found.');
            return json(200, { ok: true });
          }
        }
        throw new HttpError(404, 'API endpoint not found.');
      }
      if (!['GET', 'HEAD'].includes(req.method)) throw new HttpError(405, 'Method not allowed.');
      const root = resolve(distDir);
      const requested = resolve(root, `.${decodeURIComponent(path)}`);
      if (requested !== root && !requested.startsWith(root + sep)) throw new HttpError(404, 'Not found.');
      const file = path === '/' || path === '/admin' || path === '/admin/' ? resolve(root, 'index.html') : requested;
      if (!existsSync(file) || !statSync(file).isFile()) throw new HttpError(404, 'Page not found. Build the website before serving it.');
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': extname(file) === '.html' ? 'no-cache' : 'public, max-age=3600' });
      return res.end(req.method === 'HEAD' ? undefined : readFileSync(file));
    } catch (error) {
      if (!error.status) console.error('Request failed:', error.code || error.name);
      if (!res.headersSent) json(error.status || 500, { error: error.status ? error.message : 'Something went wrong. Please try again.' });
      else res.end();
    }
  };
  const server = createServer(handler);
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  return { server, handler, database, close: async () => {
    try { if (server.listening) await new Promise((done, reject) => server.close(error => error ? reject(error) : done())); }
    finally { await database.close(); }
  } };
}
