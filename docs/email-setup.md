# Email setup

The website sends two kinds of email:

- **Notifications to FTCCI staff** when someone sends a form (hall booking, membership application, event interest, contact message, confirmed newsletter sign-up).
- **Emails to visitors**: a confirmation with their reference number, or the newsletter "please confirm" link.

All sending settings live in `api/.env`, which is never committed. Never paste passwords into chat, tickets or code.

## 1. Local development (no mailbox needed)

`api/.env` starts with:

```
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
```

`npm --prefix api run dev` then runs a local mail catcher. Every email is saved to `api/.data/mail/` as an `.html` file you can open in a browser and a `.txt` file with the plain-text version. Nothing leaves the computer.

## 2. Testing with a Gmail account

Use a dedicated Gmail account made for testing, not a personal one.

1. Sign in to that Gmail account and open **Google Account → Security**.
2. Turn on **2-Step Verification** (app passwords need it).
3. Open **Google Account → Security → 2-Step Verification → App passwords** (or search "App passwords" in the account settings). Create one named "FTCCI website". Google shows a 16-character password once.
4. Put it in `api/.env` yourself (remove the spaces Google shows between groups):

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=the-test-account@gmail.com
   SMTP_PASS=the16characterapppassword
   MAIL_FROM=FTCCI Website <the-test-account@gmail.com>
   ```

   With Gmail, `MAIL_FROM` must be the same address as `SMTP_USER`, or Gmail rewrites it. Change all four `SMTP_` lines: if `SMTP_HOST` is still `127.0.0.1`, emails keep going to the local catcher.
5. Check the sign-in without sending anything:

   ```bash
   npm --prefix api run mail:check
   ```

   It prints `OK: connected to smtp.gmail.com:465 and signed in as …` or the mail server's reason for refusing.
6. In development the API reloads by itself when `api/.env` changes; its log shows `Email goes out through smtp.gmail.com:465`. Send a form and check that both emails arrive. Each submission's emails and their status are shown in the admin.

Gmail allows roughly 500 emails a day from one account. That's fine for testing but not for the live site. To revoke access, delete the app password in the same settings page.

## 3. Production: FTCCI's own domain

Send from an address on ftcci.in (for example `noreply@ftcci.in` or `website@ftcci.in`), so recipients see FTCCI as the sender and the mail passes authentication checks.

**Option A, FTCCI's existing mail server (cPanel).** Create the mailbox in cPanel → Email Accounts, then use the SMTP details cPanel shows under "Connect Devices" (usually port 465 with SSL). This server is already covered by FTCCI's SPF and DKIM records (see below), so no DNS changes are needed.

**Option B, a transactional email service** (for example Amazon SES in the Mumbai region). This gives better delivery and bounce reports. The service gives you SMTP credentials and the exact DNS records to add.

Either way, set in the server's `api/.env`:

```
SMTP_HOST=…            # from cPanel or the service
SMTP_PORT=465          # or 587; the API then insists on STARTTLS encryption
SMTP_USER=…
SMTP_PASS=…
MAIL_FROM=FTCCI <noreply@ftcci.in>
MAIL_REPLY_TO=info@ftcci.in    # optional: where visitors' replies go
```

### SPF, DKIM and DMARC

These DNS records prove that mail "from ftcci.in" really comes from FTCCI. Without them, confirmations land in spam or are rejected.

What ftcci.in publishes today (checked 29 Oct 2026):

| Record | Current value | Meaning |
|---|---|---|
| SPF (`TXT ftcci.in`) | `v=spf1 include:spf.ipzmarketing.com include:spf.smtpmaster.way2inboxs.com a mx ip4:190.92.174.31 include:spf.mysecurecloudhost.com ip4:190.92.174.99 ip4:190.92.174.27 ~all` | The cPanel host and two marketing senders may send as ftcci.in |
| DKIM (`TXT default._domainkey.ftcci.in`) | `v=DKIM1; k=rsa; p=…` | cPanel signs outgoing mail with this key |
| DMARC (`TXT _dmarc.ftcci.in`) | `v=DMARC1; p=none; … rua=mailto:dmarc-reports@ftcci.in` | Monitoring only: failures are reported, not blocked |

What to do:

1. **Option A (cPanel mailbox):** nothing to add. Send a test email to a Gmail inbox, open it, choose "Show original" and check that SPF, DKIM and DMARC all say PASS.
2. **Option B (another service):** add the service's `include:` to the existing SPF record. Don't create a second SPF record; a domain may have only one. Then add the DKIM CNAME or TXT records the service gives you, and repeat the Gmail "Show original" check.
3. **DMARC:** keep `p=none` while you read the reports sent to `dmarc-reports@ftcci.in` for two to four weeks. Once every legitimate sender passes, move to `p=quarantine`, then `p=reject`. Whoever manages FTCCI's DNS and other mail senders (the marketing services above) should agree on this change.
4. Use `~all` (soft fail) in SPF until DMARC reports are clean. Don't use `+all`.

## Who receives notifications

Each form has its own recipient in `api/.env`:

| Variable | Form |
|---|---|
| `BOOKING_NOTIFY_EMAIL` | Hall booking requests |
| `MEMBERSHIP_NOTIFY_EMAIL` | Membership applications |
| `EVENTS_NOTIFY_EMAIL` | Event registrations of interest |
| `CONTACT_NOTIFY_EMAIL` | Contact page messages |
| `NEWSLETTER_NOTIFY_EMAIL` | Confirmed newsletter sign-ups |

During testing all five point at the project's test inbox.

To switch a form to the real FTCCI desk, change its variable and restart the API. No code changes are needed. Each variable takes one address; use a shared mailbox or a mail-server forwarder to reach several people.

## When sending fails

A submission is always saved first, and the visitor always sees their reference number. If the mail server can't be reached, the email waits and is retried after 1 minute, 5 minutes, 15 minutes, 1 hour, 3 hours, 6 hours and 12 hours, about a day in all. After that it is marked **Failed**. The admin shows a warning in the top bar, and each submission lists its emails with a **Try again** button. Failures are also written to the API log.
