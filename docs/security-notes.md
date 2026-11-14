# Security notes

Decisions that affect security, who made them, and what reduces the risk. The final security checklist in Phase 5 builds on this file.

## Decisions that differ from the original brief

### 1. Sign-in with a password *or* an emailed code (2 Nov 2026)

- **Brief:** "Login with email + password plus mandatory 2FA."
- **Chosen by FTCCI:** staff sign in with either a password or a 6-digit code sent to their email. Either one is enough on its own.
- **Risk:** this is one factor, not two. Anyone who learns a staff password, or can read a staff member's inbox, can sign in as them.
- **What reduces it:**
  - 5 wrong passwords pause password sign-in for 15 minutes.
  - Codes expire after 10 minutes, allow 5 tries and work once. At most 5 codes per account per 15 minutes and 20 per day.
  - Per-address rate limits on every sign-in form.
  - Passwords are at least 12 characters, stored as Argon2id.
  - Sign-in emails go only to the account's own address.
  - An email is sent whenever a password is changed or reset.
  - Every sign-in and failed attempt is in the activity log with its IP address.
  - A Super Admin can disable an account, which ends its sessions at once.
- **To restore the brief's rule later:** require a code after a correct password. The pieces already exist (`api/src/staff/accounts.ts`).
- **Recommended:** staff email accounts should themselves use two-step verification, since inbox access is enough to sign in.

### 2. No fixed maximum session length (2 Nov 2026)

- **Brief:** "session expiry and idle timeout."
- **Chosen by FTCCI:** a session ends only after 8 hours without activity. While someone keeps working, it never expires.
- **Risk:** a session left open on a shared or lost computer stays usable for as long as it keeps being used.
- **What reduces it:**
  - The 8-hour idle limit, enforced by the server.
  - "Sign out on other devices" under My account.
  - Disabling an account, or resetting its password, ends all its sessions.
  - The cookie is HttpOnly, SameSite=Strict and, in production, Secure with the `__Host-` prefix.

### 3. Uploads are checked by type, not virus-scanned (29 Oct 2026)

- **Chosen by FTCCI:** no ClamAV.
- **What reduces it:**
  - Only signed-in staff can upload.
  - The real type is read from the file's contents and checked against a short allow-list (JPG, PNG, WebP, GIF, AVIF, PDF, MP4, MOV, WebM).
  - Images are re-encoded, which drops anything hidden in them.
  - Files are served from their own folder with `X-Content-Type-Options: nosniff`. Nginx must send the same header in production (Phase 5).

## Other measures in place

- **No default credentials.** The first Super Admin is created with `npm --prefix api run admin:create`, which refuses to run once an active Super Admin exists.
- **Roles are enforced by the server** on every request. Nobody can change their own role or disable themselves.
- **CSRF:**
  - every change must come from `ADMIN_URL`'s origin;
  - it must carry the session's CSRF token;
  - the cookie is SameSite=Strict;
  - only JSON (or multipart for uploads) is accepted.
- **Sessions:**
  - The database stores only a SHA-256 of the session token, and only HMACs of sign-in codes and hashes of reset tokens.
  - Reset links put the token after `#`, so it never reaches server logs.
  - The token is also removed from the address bar once the page loads.
- **Answers don't reveal accounts.** Sign-in, code and reset forms give the same answer whether or not an account exists. A wrong email takes as long to check as a wrong password.
- **No secrets at rest:**
  - sign-in codes and reset links are sent straight away and never stored in the email outbox;
  - logs redact the `Cookie` header and never contain codes or tokens.
- **Audit:** the activity log records sign-ins, failed attempts, lockouts, and every publish, deletion, restore, upload and account change. The admin has no way to edit or delete entries.
- **Page editor preview:** the website's preview bridge only runs inside a frame opened with a signed preview link and `edit=1`. It accepts messages only from the admin's address and only from its parent frame, and sends messages only there. The messages carry part names and "reload" requests, never content or credentials; drafts come from the server through the signed, one-hour link. In edit mode, links that would leave the page and form submissions are blocked.
- **Soft delete:** deleted content and files go to a bin that a Super Admin can restore from. Accounts are disabled, never deleted.

## For Phase 5

- HTTPS, HSTS and the rest of the security headers, served by Nginx.
- Rate limits are kept in memory, so they assume one API instance. Set `TRUST_PROXY` behind Nginx so they see visitors' addresses.
- No retention period has been set for the activity log yet; it will be part of the retention policy.
- An optional IP allow-list for `/admin` at the Nginx level, if FTCCI wants the admin reachable only from its office.
