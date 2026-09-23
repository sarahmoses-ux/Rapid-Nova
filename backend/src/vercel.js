import { createApp } from './app.js';

// Cache the application/connection pool across warm Vercel invocations.
export function createVercelHandler({ createApplication = createApp, env = process.env } = {}) {
  let applicationPromise;
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      const url = new URL(req.url, 'http://localhost');
      const routedPath = url.searchParams.get('__route') ?? req.query?.__route;
      if (routedPath !== undefined) {
        if (typeof routedPath !== 'string' || !/^[a-zA-Z0-9/-]+$/.test(routedPath)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid API path.' }));
        }
        url.pathname = `/api/${routedPath}`;
        url.searchParams.delete('__route');
        req.url = url.pathname + url.search;
      }
      if (!url.pathname.startsWith('/api/')) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'API endpoint not found.' }));
      }
      if (!applicationPromise) {
        if (!env.MONGODB_URI || !env.PUBLIC_ORIGIN || !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'The backend is not configured. Set the database, public origin, and admin environment variables in Vercel.' }));
        }
        applicationPromise = createApplication({
          mongoUri: env.MONGODB_URI,
          databaseName: env.MONGODB_DATABASE || 'rapid_nova',
          admin: { email: env.ADMIN_EMAIL, passwordHash: env.ADMIN_PASSWORD_HASH },
          publicOrigin: env.PUBLIC_ORIGIN,
          production: true,
        }).catch(error => { applicationPromise = undefined; throw error; });
      }
      const app = await applicationPromise;
      await app.handler(req, res);
    } catch {
      // Do not include connection strings or other secret configuration in responses.
      if (!res.headersSent) res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'The backend could not connect. Check the Vercel environment settings and MongoDB network access.' }));
    }
  };
}
