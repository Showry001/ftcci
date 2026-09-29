import { useState } from "react";
import { Link } from "react-router-dom";
import { assets, legalLinks, quickLinks, socialLinks } from "../data/content.js";
import styles from "./Footer.module.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    // TODO: connect to the FTCCI newsletter endpoint.
    setDone(true);
    setEmail("");
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
          <p className={styles.tagline}>Championing industry and enabling growth across Telangana since 1917.</p>
          <ul className={styles.social}>
            {socialLinks.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label} className={s.fullTile ? styles.tileBare : styles.tile}>
                  <img src={s.icon} alt="" width={s.w} height={s.h} style={{ width: s.w, height: s.h }} />
                </a>
              </li>
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
              <span>
                FTCCI Bhavan, Red Hills,
                <br />
                Lakdikapul, Hyderabad – 500 004,
                <br />
                Telangana, India
              </span>
            </p>
            <p className={styles.contactRow}>
              <img src={assets.footerPhone} alt="" width="14" height="14" />
              <a href="tel:+914023323426">+91-40-2332 3426</a>
            </p>
            <p className={styles.contactRow}>
              <img src={assets.footerMail} alt="" width="14" height="14" />
              <a href="mailto:info@ftcci.in">info@ftcci.in</a>
            </p>
          </address>
        </div>

        <div className={`${styles.col} ${styles.informed}`}>
          <h4>Stay Informed</h4>
          <p className={styles.informedText}>Get policy updates, event invites, and industry insights directly in your inbox.</p>
          <form className={styles.subscribe} onSubmit={subscribe} noValidate>
            <label className="visually-hidden" htmlFor="footer-email">Email address</label>
            <input
              id="footer-email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setDone(false); }}
            />
            <button type="submit">Subscribe</button>
            {done && <p className={styles.thanks} role="status">Thanks for subscribing!</p>}
          </form>
        </div>
      </div>

      <div className={styles.legal}>
        <p>© 2025 Federation of Telangana Chambers of Commerce and Industry. All rights reserved.</p>
        <ul>
          {legalLinks.map((l) => (
            <li key={l}><a href="#privacy">{l}</a></li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
