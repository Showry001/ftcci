# FTCCI website

The website of the Federation of Telangana Chambers of Commerce and Industry.

| Folder | What it is |
|---|---|
| `/` (`src/`, `public/`) | The public website: React 18 + React Router 7, rendered on the server, served under `/ftcci/`. Its pages read their content from the API |
| `api/` | The server: Node.js 24, Fastify, PostgreSQL. Stores content and media, receives the forms, sends email, serves the admin API |
| `admin/` | The staff admin: React + Vite, served under `/admin/`. **Local only until staff sign-in is added (Phase 4)** |
| `shared/` | Content types and form rules, used by all three so the browser and the server check everything the same way |
| `docs/` | Design parity report and the [email setup guide](docs/email-setup.md) |

## Requirements

Node.js 24 LTS. Nothing else is needed on a development computer: the API's development command starts its own private PostgreSQL, a local mail catcher, and uses a bundled ffmpeg for video uploads.

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

Start the API once (see below), then load the starting content in a second terminal:

```bash
npm --prefix api run seed
```

This fills the database and media library from `api/seed/content.json`, the images in `api/seed/assets/` and the documents on ftcci.in, and publishes everything so the site looks exactly as designed. Downloads from ftcci.in are kept in `api/.data/import-cache` (about 1.5 GB with the FTCCI Review archive; delete it after seeding if space matters). `--skip-reviews` leaves out the Review archive. Running it again is safe.

## Running locally

Use three terminals. Start the API first: the website renders its pages from it.

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

`api/.data/` and `api/.env` are ignored by git. The API reloads by itself when its code or `api/.env` changes. Uploaded files go to `api/.data/media` in development.

## Checks

```bash
npm test
```

This runs the API test suite (51 tests) against a throwaway database. Also run `npm --prefix api run typecheck`, `npm run build` and `npm --prefix admin run build`.

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
| `MEDIA_DIR` | no | Where uploaded files are stored. Development default `api/.data/media`; in production an absolute path outside the app folder, served by Nginx |
| `MEDIA_URL` | no | Address the files are served at (default `/media`) |
| `FFMPEG_PATH` | no | ffmpeg for compressing hero videos (default `ffmpeg` on the PATH; development uses the bundled copy) |
| `RUN_WORKER` | no | `false` stops this instance from sending queued email, processing videos and publishing scheduled items |

The website's server reads one variable: `API_URL`, the API address (default `http://127.0.0.1:8787`). It only uses it on the server; browsers never call it directly.

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

## Content management

Everything on the website except the layout is edited in the admin.

| Admin section | What it holds |
|---|---|
| Events, News & Press, Publications, FTCCI Review, Careers | Collections: one item per event, story, report, issue or vacancy |
| Website pages | One document per page or block: home hero, home page, About, Membership, Services (including the hall tariff used by the booking form), Knowledge Centre, Media, Privilege Card, Careers, and the footer |
| Media Library | Every image, PDF and video, with titles, alt text and where each file is used |

- **States.** Items are *Draft*, *Published* or *Archived*. The website shows only published content (archived events stay reachable from old links and appear under past events). Editing a published item changes a working copy; the website keeps the live version until staff press *Publish changes*.
- **Saving.** New items are saved with *Save Draft*. After that the editor saves by itself a moment after each change, and asks before leaving a new item unsaved. Required fields are only enforced when publishing; formats and lengths are checked on every save, in the browser and again on the server (`shared/validate-content.js`).
- **Preview.** *Preview* opens the real page with the unsaved working copy, through a signed link that expires after one hour.
- **Scheduling.** *Publish later* sets a date and time; the API publishes due items within 20 seconds of that time.
- **Version history.** Every publish and restore, and at most one save every five minutes, is kept (the last 60 per item). *Restore* brings an earlier version back as the draft and keeps the one it replaces.
- **Order.** Publications and vacancies appear in the order set with the arrows on their lists; everything else is ordered by date.
- **Rich text** (news stories) allows headings, bold, italic, underline, lists, quotes and links only. The server removes everything else, including scripts, styles and unsafe links.

### Media library

| Type | Accepted | Limit | What happens on upload |
|---|---|---|---|
| Images | JPG, PNG, WebP, GIF, AVIF | 20 MB | Saved as WebP at 480, 960, 1600 and 2400 px wide plus a JPEG, with camera and location data removed |
| PDFs | PDF | 100 MB | Stored as uploaded |
| Videos | MP4, MOV, WebM | 200 MB | Compressed in the background to 1080p and 720p H.264 with a poster image; it can be published once ready |

The real file type is read from the file's contents, not its name, and anything not on the list is refused. Identical files are stored once. A file that is used anywhere can't be deleted until it is replaced there. Each upload gets its own unguessable folder under `MEDIA_DIR` (outside the code folder in production), so files never change and can be cached for a year.

### Speed and search engines

Pages are rendered on the server with their content, titles, descriptions and social preview images, so they load fast and are fully readable by search engines. The API caches published content in memory and clears it on every publish. Pages allow shared caches (Nginx in Phase 5) to keep them for 60 seconds, so published changes show within about a minute; preview pages are never cached.

In production, run the website with `npm run build` then `npm start` (set `API_URL` and `PORT`), and let Nginx serve `MEDIA_DIR` at `/media`. Phase 5 adds the server setup.

## Admin (local only for now)

The admin covers website content (above), website submissions and the newsletter.

For each kind of submission there is a list with search and status filters. A submission's page shows everything that was sent and lets staff:

- set the status (New / Contacted / Closed);
- keep internal notes;
- see whether each email was delivered, and retry failed ones.

The Newsletter page lists sign-ups.

Until Phase 4 adds sign-in with an email one-time code, the admin API is **not registered at all in production**. In development it only answers requests that come straight from the same computer: a loopback address, a `localhost` Host and Origin, and no proxy headers.

## Project phases

1. Design parity with Figma (done)
2. Forms, server, email and submissions admin (done)
3. Content management: hero, events, news, publications, pages and media library; imports the existing ftcci.in files (this phase)
4. Staff sign-in with email OTP, roles, audit log and the full admin dashboard
5. Hardening and deployment: HTTPS and security headers, server setup, backups, retention policy and privacy notice
