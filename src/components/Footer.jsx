import { useState } from "react";
import { Link, useRouteLoaderData } from "react-router";
import { socialPlatforms } from "../../shared/icons.js";
import { validate } from "../../shared/forms.js";
import { assets, legalLinks, pickIcons, quickLinks } from "../ui/assets.js";
import { joinNewsletter, prepareProof } from "../lib/api.js";
import { Honeypot } from "./FormDialog.jsx";
import styles from "./Footer.module.css";

// FTCCI, Federation House, on Google Maps.
const MAP_URL = "https://www.google.com/maps/search/?api=1&query=FTCCI%2C%20Federation%20House%2C%20Red%20Hills%2C%20Hyderabad%20500004";

export default function Footer() {
  const { site } = useRouteLoaderData("site");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    const { ok, values, errors } = validate("newsletterQuick", { email });
    if (!ok) return setStatus({ ok: false, msg: errors.email });
    setSending(true);
    try {
      await joinNewsletter("footer", values, hp);
      setStatus({ ok: true, msg: "Thanks! Check your inbox to confirm your subscription." });
      setEmail("");
    } catch (err) {
      setStatus({ ok: false, msg: err.fields?.email ?? err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.grid}>
        <div className={`${styles.col} ${styles.about}`}>
          <div className={styles.brand}>
            <img src={assets.footerLogo} alt="FTCCI emblem" width="70" height="88" />
            <div>
              <p className={styles.brandName}>FTCCI</p>
              <p className={styles.brandFull}>
                The Federation of Telangana Chambers
                <br />
                of Commerce and Industry
              </p>
            </div>
          </div>
          {site.tagline && <p className={styles.tagline}>{site.tagline}</p>}
          <ul className={styles.social}>
            {site.social.map((s) => (
              <SocialLink key={s.platform} {...s} />
            ))}
          </ul>
        </div>

        <nav className={`${styles.col} ${styles.links}`} aria-label="Quick links">
          <h4>Quick Links</h4>
          <ul>
            {quickLinks.map((l) => (
              <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className={`${styles.col} ${styles.contact}`}>
          <h4>Contact</h4>
          <address>
            <p className={styles.contactRow}>
              <img src={assets.footerLocation} alt="" width="14" height="14" className={styles.pinIcon} />
              <a className={styles.address} href={MAP_URL} target="_blank" rel="noopener noreferrer" aria-label={`${site.address.replace(/\n/g, ", ")} (opens Google Maps in a new tab)`}>
                {site.address}
              </a>
            </p>
            {site.phone && (
              <p className={styles.contactRow}>
                <img src={assets.footerPhone} alt="" width="14" height="14" />
                <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}>{site.phone}</a>
              </p>
            )}
            {site.email && (
              <p className={styles.contactRow}>
                <img src={assets.footerMail} alt="" width="14" height="14" />
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            )}
          </address>
        </div>

        <div className={`${styles.col} ${styles.informed}`}>
          <h4>Stay Informed</h4>
          <p className={styles.informedText}>Get policy updates, event invites, and industry insights directly in your inbox.</p>
          <form className={styles.subscribe} onSubmit={subscribe} onFocus={prepareProof} noValidate>
            <label className="visually-hidden" htmlFor="footer-email">Email address</label>
            <input
              id="footer-email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              aria-invalid={status?.ok === false || undefined}
              aria-describedby={status ? "footer-subscribe-status" : undefined}
              onChange={(e) => { setEmail(e.target.value); setStatus(null); }}
            />
            <Honeypot value={hp} onChange={setHp} />
            <button type="submit" disabled={sending}>{sending ? "Sending…" : "Subscribe"}</button>
            {status && (
              <p id="footer-subscribe-status" className={status.ok ? styles.thanks : styles.problem} role="status">{status.msg}</p>
            )}
          </form>
        </div>
      </div>

      <div className={styles.legal}>
        <p>© {new Date().getFullYear()} Federation of Telangana Chambers of Commerce and Industry. All rights reserved.</p>
        <ul>
          {legalLinks.map((l) => (
            <li key={l}><a href="#privacy">{l}</a></li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

function SocialLink({ platform, href }) {
  const icon = pickIcons.social[platform];
  return (
    <li>
      <a href={href} target="_blank" rel="noreferrer" aria-label={`FTCCI on ${socialPlatforms[platform]}`} className={icon.fullTile ? styles.tileBare : styles.tile}>
        <img src={icon.src} alt="" width={icon.w} height={icon.h} style={{ width: icon.w, height: icon.h }} />
      </a>
    </li>
  );
}
