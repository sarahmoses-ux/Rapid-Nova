import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createApp } from './app.js';
import { configuredDataDir } from './paths.js';

const dataDir = configuredDataDir();
const adminFile = resolve(dataDir, 'admin.json');
const admin = process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH
  ? { email: process.env.ADMIN_EMAIL, passwordHash: process.env.ADMIN_PASSWORD_HASH }
  : existsSync(adminFile) ? JSON.parse(readFileSync(adminFile, 'utf8')) : undefined;
if (!admin) console.warn('Admin is not configured. Run npm run admin:setup to enable team access.');
let app;
try { app = await createApp({ admin, production: process.env.NODE_ENV === 'production', publicOrigin: process.env.PUBLIC_ORIGIN }); }
catch (error) { console.error(error.message); process.exit(1); }
const port = Number(process.env.PORT || 3001), host = process.env.HOST || '127.0.0.1';
app.server.listen(port, host, () => console.log(`Rapid Nova server running at http://${host}:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await app.close(); process.exit(0); });
