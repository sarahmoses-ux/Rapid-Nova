# Rapid Nova backend

All backend source, API tests, configuration, and migration tools live here. Application data is stored in MongoDB.

For the hosted site, see [Vercel deployment](VERCEL.md). The root `api/index.js` is a thin entry point for `src/vercel.js`; all backend logic stays in this folder.

```text
backend/
  src/
    app.js          HTTP API, validation, database, and static serving
    auth.js         Password hashing and session helpers
    database.js     MongoDB connection, indexes, and data operations
    index.js        Server startup
    migration.js    Read-only SQLite import logic
    migrate-sqlite.js Migration command
    paths.js        Data and frontend build paths
    setup-admin.js  Admin account setup
  tests/
    app.test.js     API integration tests
  data/             Local admin config and preserved legacy SQLite files (gitignored)
  .env.example      Environment template
  package.json      Backend commands
```

Requires Node 24.11 or later. The backend uses the official `mongodb` driver. `mongodb-memory-server` is a development-only test dependency.

From this folder:

```sh
npm ci
```

Copy `.env.example` to `.env`. For local MongoDB, use `MONGODB_URI=mongodb://127.0.0.1:27017`. For Atlas, use the cluster's driver connection string, with your database user's credentials, and allow network access from your backend host. Set `MONGODB_DATABASE=rapid_nova`. Do not put database credentials in frontend variables or source control.

Then:

```sh
npm run admin:setup
npm start
```

Use `npm run dev` for automatic restart during development and `npm test` for the API tests. Tests use a real disposable MongoDB process, never your Atlas database. The first install/run downloads its MongoDB binary.

The server runs at `http://localhost:3001` by default. It serves the frontend build from `../dist`; build that first with `npm run build` from the project root. Admin sign-in is at `/admin`.

MongoDB stores `jobs`, `submissions`, and `sessions`. PDF CVs (limited to 3 MB) are binary values stored atomically with applications and excluded from inbox queries. Downloads require admin authentication. Sessions have a TTL index plus an explicit expiry check during authentication.

The server connects to MongoDB and creates indexes before listening. It stops with a configuration message if the URI is missing or connection fails; it never silently falls back to SQLite. `/api/health` checks the database and returns 503 if unavailable.

`DATA_DIR` defaults to `backend/data` and is now used only for the local admin credential file and legacy SQLite source. Relative values resolve from this backend folder; absolute paths are supported. With environment-provided admin credentials, production does not need local persistent data storage. Configure database backups separately.

To import previous SQLite records after configuring MongoDB:

```sh
npm run migrate:sqlite
# Or specify a different source path:
npm run migrate:sqlite -- path/to/rapid-nova.sqlite
```

Stop the previous SQLite backend before importing. The importer opens SQLite read-only, preserves record IDs and CV bytes, skips existing MongoDB records, and can resume after interruption by being run again. It leaves the source database intact. Existing sessions are not imported; sign in again.

Root commands (`npm start`, `npm run dev:api`, `npm run admin:setup`, and `npm test`) delegate here. Browser tests remain in the root `tests/` folder because they exercise both the frontend and backend. See the root README for deployment settings and production limitations.
