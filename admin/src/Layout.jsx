import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { api } from "./api.js";
import { sections } from "./sections.js";
import styles from "./Layout.module.css";

const SummaryContext = createContext({ summary: null, refresh: () => {} });
export const useSummary = () => useContext(SummaryContext);

// Sidebar and top bar from the Figma admin screens (2538:43797). Only working sections are listed.
export default function Layout() {
  const [summary, setSummary] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const refresh = useCallback(() => {
    api.get("/summary").then(setSummary, () => setSummary(null));
  }, []);
  useEffect(refresh, [refresh, pathname]);
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <SummaryContext.Provider value={{ summary, refresh }}>
      <div className={styles.shell}>
        <aside id="admin-menu" className={styles.sidebar} data-open={menuOpen || undefined}>
          <div className={styles.brand}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="FTCCI emblem" width="60" height="75" />
            <p>The Federation of Telangana Chambers of Commerce and Industry</p>
          </div>
          <nav aria-label="Admin sections">
            <p className={styles.groupLabel}>Website submissions</p>
            <ul className={styles.nav}>
              {sections.map((s) => (
                <li key={s.slug}>
                  <NavLink to={`/submissions/${s.slug}`} className={({ isActive }) => (isActive ? styles.active : undefined)}>
                    <img src={s.icon} alt="" width="20" height="20" />
                    <span>{s.label}</span>
                    {summary?.new[s.type] > 0 && (
                      <span className={styles.count} aria-label={`${summary.new[s.type]} new`}>{summary.new[s.type]}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
            <hr className={styles.divider} />
            <ul className={styles.nav}>
              <li>
                <NavLink to="/newsletter" className={({ isActive }) => (isActive ? styles.active : undefined)}>
                  <MailIcon />
                  <span>Newsletter</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        {menuOpen && <button type="button" className={styles.scrim} aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

        <div className={styles.main}>
          <header className={styles.topbar}>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls="admin-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span aria-hidden="true" />
              <span className="visually-hidden">Menu</span>
            </button>
            <p className={styles.notice}>
              <strong>Local admin</strong> Opens only on this computer until staff sign-in is added.
            </p>
            {summary?.failedEmails > 0 && (
              <p className={styles.alert} role="status">
                {summary.failedEmails} email{summary.failedEmails > 1 ? "s" : ""} could not be sent. Open the submission to retry.
              </p>
            )}
          </header>
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </SummaryContext.Provider>
  );
}

// Envelope in the stroke style of the Figma sidebar icons.
function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}
