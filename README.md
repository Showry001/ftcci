# FTCCI website

The website of the Federation of Telangana Chambers of Commerce and Industry.

| Folder | What it is |
|---|---|
| `/` (`src/`, `public/`) | The public website: React 18 + React Router 7, rendered on the server, served under `/ftcci/`. Its pages read their content from the API |
| `api/` | The server: Node.js 24, Fastify, PostgreSQL. Stores content and media, receives the forms, sends email, serves the admin API |
| `admin/` | The staff admin: React + Vite, served under `/admin/`. Staff sign in with their own accounts |
| `shared/` | Content types and form rules, used by all three so the browser and the server check everything the same way |
| `docs/` | The [staff guide](docs/admin-guide.md), [security notes](docs/security-notes.md), [email setup guide](docs/email-setup.md) and design parity report |

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

Then create the first Super Admin. There are no default accounts or passwords:

```bash
npm --prefix api run admin:create -- --email you@ftcci.in --name "Your Name"
```

It asks for a password, which isn't shown as you type. Leave it empty to sign in with codes sent to that email instead. The command works only while there is no active Super Admin; after that, add people under Staff accounts in the admin.

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

This runs the API test suite (69 tests) against a throwaway database. Also run `npm --prefix api run typecheck`, `npm run build` and `npm --prefix admin run build`.

## Environment variables (`api/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | yes | `development` or `production`. Production requires https addresses and uses Secure cookies |
| `HOST`, `PORT` | no | Where the API listens (default `127.0.0.1:8787`) |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `PUBLIC_SITE_URL` | yes | Site address used in email links (`https://` required in production) |
| `ADMIN_URL` | yes in production | The admin's address, e.g. `https://www.ftcci.in/admin` (development default `http://127.0.0.1:5174/admin`). Used in sign-in emails; only pages from this address can sign in or make changes |
| `TRUST_PROXY` | no | Address of the reverse proxy (e.g. `127.0.0.1` for Nginx on the same server) so rate limits see visitors' IPs |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | yes (user/pass for real mail servers) | Outgoing mail server. Port 465 uses TLS; port 587 requires STARTTLS |
| `MAIL_FROM` | yes | Sender, e.g. `FTCCI <noreply@ftcci.in>` |
| `MAIL_REPLY_TO` | no | Where visitors' replies to confirmation emails go |
| `BOOKING_NOTIFY_EMAIL`, `MEMBERSHIP_NOTIFY_EMAIL`, `EVENTS_NOTIFY_EMAIL`, `CONTACT_NOTIFY_EMAIL`, `NEWSLETTER_NOTIFY_EMAIL` | yes | Who is told about each form |
| `ALTCHA_HMAC_SECRET` | yes | At least 32 random characters. Signs spam-check challenges, preview links and sign-in codes |
| `MEDIA_DIR` | no | Where uploaded files are stored. Development default `api/.data/media`; in production an absolute path outside the app folder, served by Nginx |
| `MEDIA_URL` | no | Address the files are served at (default `/media`) |
| `FFMPEG_PATH` | no | ffmpeg for compressing hero videos (default `ffmpeg` on the PATH; development uses the bundled copy) |
| `RUN_WORKER` | no | `false` stops this instance from sending queued email, processing videos and publishing scheduled items |

The website's server reads two variables:

- `API_URL`: the API address (default `http://127.0.0.1:8787`). It's used only on the server; browsers never call it directly.
- `ADMIN_ORIGIN`: where the admin runs, if that's a different address from the website. Only the page editor's preview uses it. It defaults to `http://127.0.0.1:5174` in development and to the website's own address in production.

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
| Website pages | The fixed pages (Home, About, Membership, Services, Knowledge Centre, Media, Privilege Card, Careers), edited in the visual page editor described below. The hero and the footer are edited from the pages that show them. |
| Media Library | Every image, PDF and video, with titles, alt text and where each file is used |

- **States.** Items are *Draft*, *Published* or *Archived*. The website shows only published content (archived events stay reachable from old links and appear under past events). Editing a published item changes a working copy; the website keeps the live version until staff press *Publish changes*.
- **Saving.** New items are saved with *Save Draft*. After that the editor saves by itself a moment after each change, and asks before leaving a new item unsaved. Required fields are only enforced when publishing; formats and lengths are checked on every save, in the browser and again on the server (`shared/validate-content.js`).
- **Preview.** *Preview* opens the real page with the unsaved working copy, through a signed link that expires after one hour. One link can cover several documents, so a page previews together with its hero and footer.
- **Scheduling.** *Publish later* sets a date and time; the API publishes due items within 20 seconds of that time.
- **Version history.** Every publish and restore, and at most one save every five minutes, is kept (the last 60 per item). *Restore* brings an earlier version back as the draft and keeps the one it replaces.
- **Order.** Publications and vacancies appear in the order set with the arrows on their lists; everything else is ordered by date.
- **Rich text** (news stories) allows headings, bold, italic, underline, lists, quotes and links only. The server removes everything else, including scripts, styles and unsafe links.

### Visual page editor

Website pages open in a full-screen editor, laid out like Shopify's theme editor:

- **Left:** the parts of the page, in the order they appear (for the About page: History, Vision & Mission, Objectives and so on, then the footer).
- **Right:** the real page, at desktop, tablet or phone width.
- **Choosing a part:** hover outlines it with its name; clicking it, there or in the list, opens its fields on the left.
- **Saving:** changes save as a draft about a second after typing, and the preview refreshes in place. **Publish** puts everything changed on that page live together: the page, plus the hero, office bearers or footer if they were changed there.
- **Shared parts:** the hero, office bearers and footer are edited wherever they appear. Footer changes show on every page.
- **Lists:** events, news, publications and vacancies stay in their own sections; the editor links to them.
- **Phones:** on a phone, the parts list and the preview take turns.

How it works:
- **Which part is which:** `shared/page-sections.js` lists each page's parts and the fields they edit. The website marks each part with `data-edit="<part id>"`.
- **The preview frame:** inside the editor, `src/components/PreviewBridge.jsx` outlines parts and reports clicks. It only acts in a frame opened with a signed preview link and `edit=1`, and only exchanges messages with the admin's address.
- **No content in messages:** messages carry part names and "reload" requests only. The page always reads drafts from the server through the signed link.

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

## Admin

The admin covers the dashboard, website content (above), website submissions and the newsletter. Super Admins also see Administration: staff accounts, the activity log and the bin.

For each kind of submission there is a list with search and status filters. A submission's page shows everything that was sent and lets staff:

- set the status (New / Contacted / Closed);
- keep internal notes;
- see whether each email was delivered, and retry failed ones.

The Newsletter page lists sign-ups. A step-by-step guide for staff is in [docs/admin-guide.md](docs/admin-guide.md).

### Staff accounts and roles

| Role | Can |
|---|---|
| Admin | Edit and publish all content and pages, use the media library, handle website submissions, see the newsletter list, delete items (they go to the bin) |
| Super Admin | Everything an Admin can, plus add, edit, disable and unlock staff accounts, read the activity log, and restore items from the bin |

Roles are checked by the server on every request, not just hidden in the admin. Nobody can change their own role or disable their own account, so there is always at least one active Super Admin. Accounts are disabled, never deleted; disabling one signs it out everywhere at once.

### Signing in

FTCCI chose (2 Nov 2026) to let staff sign in **either** with a password **or** with a 6-digit code sent to their email; either one is enough. This differs from the original brief, which asked for a password plus a mandatory second step. See [docs/security-notes.md](docs/security-notes.md).

| Rule | Setting |
|---|---|
| Passwords | At least 12 characters, not containing the email address. Stored as Argon2id hashes |
| Wrong passwords | 5 in a row pause password sign-in for that account for 15 minutes (a code still works) |
| Emailed codes | 6 digits, expire after 10 minutes, 5 tries each, work once; a new code cancels the previous one. At most 5 codes per account per 15 minutes and 20 per day |
| Forgotten password | A link that works once, for 30 minutes; at most 3 per account per hour. Setting the new password signs the account out everywhere |
| Sessions | End after 8 hours without activity (FTCCI chose no fixed maximum length), on sign-out, or when the account is disabled or its password is reset |
| Rate limits per address | 10 password attempts, 5 code requests, 20 code attempts and 5 reset requests per 15 minutes |

The session is a random token in an HttpOnly, SameSite=Strict cookie (Secure and `__Host-` prefixed in production); the database keeps only a SHA-256 of it. Every change must come from the admin's own address (`ADMIN_URL`) and carry the session's CSRF token. Sign-in, code and reset emails are sent straight away and never stored. Sign-in forms answer the same way whether or not an account exists, and a wrong email takes as long to check as a wrong password.

### Activity log and bin

Every sign-in (and failed attempt), publish, unpublish, archive, schedule, restore, deletion, upload, file edit, submission status change, email retry and staff account change is logged with the person, time and address. Autosaves aren't logged; version history covers them. Entries can't be edited or deleted from the admin.

Deleted content and files go to the bin with who deleted them and when. A Super Admin can restore them exactly as they were; a restored item whose web address was taken in the meantime gets a number added to it.

## Project phases

1. Design parity with Figma (done)
2. Forms, server, email and submissions admin (done)
3. Content management: hero, events, news, publications, pages and media library; imports the existing ftcci.in files (done)
4. Staff sign-in, roles, activity log, bin and the dashboard (this phase)
5. Hardening and deployment: HTTPS and security headers, server setup, backups, retention policy and privacy notice
