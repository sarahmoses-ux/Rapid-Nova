# Rapid Nova launch checklist

## Day 1: Finish the enquiry website

- Confirm the owned domain, hosting provider, business email, and public phone number.
- Confirm locations served and the advertised credential screening and 24/7 support claims.
- Configure the team admin account and verify applications, private PDF CV uploads, facility requests, and contact messages in the dashboard.
- Add real vacancies in the admin dashboard. Confirm whether email notifications or candidate accounts are required for launch; neither is connected yet.
- Replace privacy and terms placeholders with business-approved content reflecting actual data handling.
- Supply official social profile URLs or remove the placeholder social links.
- Review the healthcare staffing copy and mobile layout.

## Day 2: Publish and verify

- Build with `npm ci`, `npm ci --prefix backend --omit=dev`, and `npm run build`; deploy the Node server with `npm start`, HTTPS, and a configured MongoDB connection. A static-only deployment cannot run the backend.
- Connect the domain and verify HTTPS on the chosen primary address.
- Add the confirmed site URL to canonical and social metadata and generate a sitemap.
- Test candidate and facility enquiries end to end in the admin inbox, including private CV download and persistence after restart. If email notifications are added, verify delivery separately.
- Check phone and desktop navigation, keyboard access, and all contact links on the public URL.
- Confirm an owner can access hosting, domain settings, and the enquiry inbox.

## Current implementation

The production application lives in `src/`; `Rapid-Nova-Design/` is the original static design reference, not the production entry point.

The application includes travel nursing, allied health, temporary-to-permanent placement, and international healthcare hiring. Applications, PDF CVs, staffing requests, and contact enquiries are stored by the API. `/admin` provides authenticated review, notes/status updates, and vacancy publishing. Public job search queries actual published vacancies. Page metadata and a keyboard skip link are included.

The backend uses MongoDB for applications, CVs, vacancies, and sessions. Configure `MONGODB_URI` and `MONGODB_DATABASE` in private environment settings. Public deployment, business credentials, privacy/terms content, email notifications, domain configuration, and database backups remain launch tasks.
