# Rapid Nova healthcare staffing

React frontend and Node API with MongoDB storage. Requires Node 24.11 or later and a MongoDB deployment (Atlas or local).

## Run the complete website locally

```sh
npm ci
npm ci --prefix backend
```

Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and `MONGODB_DATABASE` for your database. Keep the connection string private. Then:

```sh
npm run admin:setup
npm run build
npm start
```

Open `http://localhost:3001`. Team sign-in is at `http://localhost:3001/admin`. Admin setup asks for your email and a password (at least 12 characters); no default password is supplied. It stores only a salted password hash in the ignored `backend/data/admin.json`. Restart the server after changing credentials. Re-running setup rotates the password and invalidates existing sessions. Environment credentials take precedence over this file.

For frontend development, run `npm run dev:api` and `npm run dev` in separate terminals. Vite forwards `/api` requests to port 3001. `npm run preview` previews the frontend only; use `npm start` to test the complete production build.

## Working features

- Candidate applications with a required PDF CV (maximum 3 MB), contact details, desired role, and location.
- Facility staffing requests and general contact enquiries.
- Database-backed vacancies, public search, and applications linked to a vacancy.
- Team dashboard to review submissions, download CVs, save internal notes and statuses, and create, edit, publish, or unpublish vacancies.
- Password hashing, eight-hour HttpOnly sessions, server-side validation, submission/login rate limits, origin checks, and authenticated CV downloads.

Applications are saved in the dashboard. Email notifications, candidate accounts, password-reset emails, and external applicant-tracking integrations are not implemented. CV validation checks size, extension, and PDF markers; it is not a malware scanner. No sample vacancies or applications are inserted into the real database.

## Deployment

Deploy a Node server connected to MongoDB; the server serves both `dist` and `/api`. A static-only host cannot run this backend. Copy `backend/.env.example` to `backend/.env` for local settings, or use the host's environment settings. Never commit real credentials.

1. Set `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT` as required by the host, and `PUBLIC_ORIGIN` to the exact public HTTPS origin.
2. Set `MONGODB_URI` and `MONGODB_DATABASE`. Configure database credentials and network access for the backend host. Supply `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` through environment settings, or preserve `DATA_DIR` for the local admin credential file.
3. Run `npm ci`, `npm ci --prefix backend --omit=dev`, and `npm run build`; start with `npm start` behind HTTPS. `/api/health` checks MongoDB connectivity.
4. Configure MongoDB backups and restrict database access. Application records, CVs, and sessions live in MongoDB, not in the backend filesystem.
5. Verify a real application, staffing request, admin login, CV download, and restart persistence on the deployed site.

The in-process limiter deliberately uses the socket address, not untrusted forwarding headers. Behind a reverse proxy, visitors share its limit (15 submissions and 10 login attempts per 15 minutes). Configure trusted proxy/edge rate limiting before a wider rollout. MongoDB shares sessions and records across instances; rate counters are per-process and reset on restart. Use shared rate limiting before adding multiple backend instances.

## Checks and code

`npm test` tests API workflows, private downloads, validation, sign-in, origin protection, throttling, vacancy publishing, persistence, session expiry, and SQLite migration. Tests run a real temporary MongoDB server via `mongodb-memory-server`; its first installation/run downloads a MongoDB binary. They never use your configured Atlas database. `npm run build` builds the frontend. `npm run test:e2e` tests the complete application in an installed Microsoft Edge browser, with an isolated temporary MongoDB server and HTTP port 3107.

Production frontend: `src/`. Backend: `backend/` (source, API tests, environment settings, and runtime data). See `backend/README.md` for standalone backend commands. The original static design in `Rapid-Nova-Design/` is a reference only and does not run the API workflows.

Existing SQLite files are preserved. After configuring MongoDB, run `npm --prefix backend run migrate:sqlite` to import the previous vacancies and submissions, including CVs. Import is repeatable and does not overwrite existing MongoDB records. Sessions are not migrated.

MongoDB driver reference: https://www.mongodb.com/docs/drivers/node/current/connect/
