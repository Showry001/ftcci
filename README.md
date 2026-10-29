# FTCCI website

The website of the Federation of Telangana Chambers of Commerce and Industry.

| Folder | What it is |
|---|---|
| `/` (`src/`, `public/`) | The public website: React 18 + Vite, served under `/ftcci/` |
| `api/` | The server: Node.js 24, Fastify, PostgreSQL. Receives the forms, sends email, serves the admin API |
| `admin/` | The staff admin: React + Vite, served under `/admin/`. **Local only until staff sign-in is added (Phase 4)** |
| `shared/` | Form rules and the hall list, used by all three so the browser and the server check forms the same way |
| `docs/` | Design parity report and the [email setup guide](docs/email-setup.md) |

## Requirements

Node.js 24 LTS. Nothing else is needed on a development computer: the API's development command starts its own private PostgreSQL and a local mail catcher.

## First-time setup

```bash
npm install
npm --prefix api install
npm --prefix admin install
cp api/.env.example api/.env
```

Then edit `api/.env`:

- Replace `change-me` in `DATABASE_URL` with a password of your choice (the local database is created with it).
- Set `ALTCHA_HMAC_SECRET` to the output of `openssl rand -hex 32`.
- Set the five `*_NOTIFY_EMAIL` addresses.
- Leave `SMTP_HOST=127.0.0.1` and `SMTP_PORT=1025` to catch emails locally, or follow [docs/email-setup.md](docs/email-setup.md) to send real ones. `npm --prefix api run mail:check` tests the mail server sign-in without sending anything.

## Running locally

Use three terminals:

```bash
npm --prefix api run dev
```

```bash
npm run dev
```

```bash
npm --prefix admin run dev
```

| What | Address |
|---|---|
| Website | http://localhost:5173/ftcci/ |
| Admin | http://127.0.0.1:5174/admin/ |
| API | http://127.0.0.1:8787 (the website and admin reach it through `/api`) |
| Local database | 127.0.0.1:5433, data in `api/.data/pg` |
| Caught emails | `api/.data/mail/*.html` |

`api/.data/` and `api/.env` are ignored by git. The API reloads by itself when its code or `api/.env` changes.

## Checks

```bash
npm test
```

This runs the API test suite (33 tests) against a throwaway database. Also run `npm --prefix api run typecheck`, `npm run build` and `npm --prefix admin run build`.

## Environment variables (`api/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | yes | `development` or `production`. The admin API only exists outside production until Phase 4 |
| `HOST`, `PORT` | no | Where the API listens (default `127.0.0.1:8787`) |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `PUBLIC_SITE_URL` | yes | Site address used in email links (`https://` required in production) |
| `TRUST_PROXY` | no | Address of the reverse proxy (e.g. `127.0.0.1` for Nginx on the same server) so rate limits see visitors' IPs |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | yes (user/pass for real mail servers) | Outgoing mail server. Port 465 uses TLS; port 587 requires STARTTLS |
| `MAIL_FROM` | yes | Sender, e.g. `FTCCI <noreply@ftcci.in>` |
| `MAIL_REPLY_TO` | no | Where visitors' replies to confirmation emails go |
| `BOOKING_NOTIFY_EMAIL`, `MEMBERSHIP_NOTIFY_EMAIL`, `EVENTS_NOTIFY_EMAIL`, `CONTACT_NOTIFY_EMAIL`, `NEWSLETTER_NOTIFY_EMAIL` | yes | Who is told about each form |
| `ALTCHA_HMAC_SECRET` | yes | At least 32 random characters, for the spam check |
| `RUN_WORKER` | no | `false` stops this instance from sending queued email |

The API refuses to start, with a clear message, when a required value is missing or malformed. It never logs secret values.

## Forms

| Form | Where | Reference | Staff notified via | Email to the visitor |
|---|---|---|---|---|
| Hall booking request | Header "Hall Booking", Services page | `FTCCI-HB-YYYY-NNNNNN` | `BOOKING_NOTIFY_EMAIL` | Confirmation with reference |
| Membership application | Membership page "Apply Online" / "Apply for Membership" | `FTCCI-MA-…` | `MEMBERSHIP_NOTIFY_EMAIL` | Confirmation with reference |
| Event interest | Event page "Register Interest" | `FTCCI-EV-…` | `EVENTS_NOTIFY_EMAIL` | Confirmation with reference |
| Contact message | Contact page | `FTCCI-CT-…` | `CONTACT_NOTIFY_EMAIL` | Confirmation with reference |
| Newsletter | Home "Stay Connected", footer "Stay Informed" | — | `NEWSLETTER_NOTIFY_EMAIL` (once confirmed) | "Please confirm" link (double opt-in) |

- **Reference numbers** count up per form and calendar year in India time. They are allocated atomically in the database, so two submissions never share a number.
- **Validation:** `shared/forms.js` defines every field's rules: required fields, length limits, and email, phone, PIN, GST, IEC, website and date formats, plus options from fixed lists. The browser applies the rules for quick feedback. The server applies them again before saving anything, and drops fields a form doesn't define.
- **Spam protection:** a hidden honeypot field; ALTCHA, a self-hosted proof-of-work check that visitors never see, with each solution usable once; at most 5 form posts per IP address per 10 minutes; and at most 3 emails to any one visitor address per hour.
- **Email** is saved to an outbox in the same database transaction as the submission, then sent in the background with retries. See [docs/email-setup.md](docs/email-setup.md).
- **Personal data:** the membership form doesn't ask for bank details, PAN, DIN, dates of birth or documents; the membership desk collects those offline. Newsletter confirmation links are stored only as hashes and expire after 7 days. Retention rules and the privacy notice come in Phase 5.

## Admin (local only for now)

The admin lists each kind of submission with search and status filters. A submission's page shows everything that was sent and lets staff:

- set the status (New / Contacted / Closed);
- keep internal notes;
- see whether each email was delivered, and retry failed ones.

The Newsletter page lists sign-ups.

Until Phase 4 adds sign-in with an email one-time code, the admin API is **not registered at all in production**. In development it only answers requests that come straight from the same computer: a loopback address, a `localhost` Host and Origin, and no proxy headers.

## Project phases

1. Design parity with Figma (done)
2. Forms, server, email and submissions admin (this phase)
3. Content management: hero, events, news, publications, pages and media library; imports the existing ftcci.in files
4. Staff sign-in with email OTP, roles, audit log and the full admin dashboard
5. Hardening and deployment: HTTPS and security headers, server setup, backups, retention policy and privacy notice

The GitHub Pages workflow in `.github/` publishes only the static site, so forms can't reach the API there. It will be replaced by the self-hosted deployment in Phase 5.
