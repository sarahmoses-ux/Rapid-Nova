# Deploy the website and admin on Vercel

Use the repository root as the Vercel Root Directory, with the Vite framework preset. `vercel.json` configures the install/build commands, `/admin` React route, and `/api/*` Node function. The small root `api/index.js` file is the Vercel entry point; backend logic remains in `backend/src/`.

In Vercel → Project → Settings → Environment Variables, set these for Production:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Your private Atlas connection string from `backend/.env` |
| `MONGODB_DATABASE` | The same database name used locally (default `rapid_nova`) |
| `PUBLIC_ORIGIN` | Your exact public HTTPS origin, e.g. `https://your-project.vercel.app` |
| `ADMIN_EMAIL` | The `email` value from local `backend/data/admin.json` |
| `ADMIN_PASSWORD_HASH` | The entire `passwordHash` value from that file (not your plaintext password) |

The local `.env` and admin file are deliberately excluded from Git and deployments. Copy values privately in the Vercel dashboard; do not commit them. If `DATA_DIR` was customised, use the admin file from that directory instead.

Allow the deployed backend to connect through the Atlas network settings. Use the same exact `PUBLIC_ORIGIN` as the domain you visit; previews and alternative domains need their own environment configuration. Otherwise cross-origin writes are rejected.

Deploy the latest Git commit or redeploy after saving environment variables. Then check:

1. `/admin` displays Team Sign In, including after refresh.
2. `/api/health` returns `{"ok":true}`.
3. Sign in with your existing admin email and password.
4. Verify a vacancy and a test application, then review and download its CV.

An HTML 404 on `/admin` points to an old deployment or incorrect project root. A JSON 503 from `/api/health` points to missing environment settings or a MongoDB connection problem. No `npm start` command is needed on Vercel; it invokes the API function for requests.

The application and MongoDB pool are reused while the function instance stays warm. Records and sessions persist in MongoDB. Rate limiting is currently per function instance; configure Vercel Firewall rate limits before wider public traffic. PDF uploads remain capped at 3 MB.

References: [Vite SPA routes](https://vercel.com/docs/frameworks/frontend/vite), [Node.js functions](https://vercel.com/docs/functions/runtimes/node-js).
