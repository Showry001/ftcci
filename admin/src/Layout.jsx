import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { api } from "./api.js";
import { RequireStaff, roleLabel, useAuth } from "./auth.jsx";
import { sections } from "./sections.js";
import styles from "./Layout.module.css";

const navIcon = (name) => <img src={`${import.meta.env.BASE_URL}icons/${name}.svg`} alt="" width="20" height="20" />;
const adminNav = [
  { to: "/staff", label: "Staff accounts", icon: navIcon("nav-staff") },
  { to: "/activity", label: "Activity log", icon: navIcon("nav-activity") },
  { to: "/bin", label: "Bin", icon: <BinIcon /> },
];
const contentNav = [
  { to: "/content/event", label: "Events", icon: navIcon("nav-calendar") },
  { to: "/content/article", label: "News & Press", icon: navIcon("nav-news") },
  { to: "/content/publication", label: "Publications", icon: navIcon("nav-book") },
  { to: "/content/review", label: "FTCCI Review", icon: <DocumentIcon /> },
  { to: "/content/vacancy", label: "Careers", icon: <BriefcaseIcon /> },
  { to: "/pages", label: "Website pages", icon: <PagesIcon /> },
  { to: "/media", label: "Media Library", icon: navIcon("nav-media") },
];

const SummaryContext = createContext({ summary: null, refresh: () => {} });
export const useSummary = () => useContext(SummaryContext);

// Sidebar and top bar from the Figma admin screens (2538:43797, 2538:44033). Only working sections are
// listed; the Administration group is for Super Admins.
export default function Layout() {
  return (
    <RequireStaff>
      <Shell />
    </RequireStaff>
  );
}

function NavList({ items }) {
  return (
    <ul className={styles.nav}>
      {items.map((item) => (
        <li key={item.to}>
          <NavLink to={item.to} end={item.end} className={({ isActive }) => (isActive ? styles.active : undefined)}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function Shell() {
  const { user } = useAuth();
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
            <NavList items={[{ to: "/", end: true, label: "Dashboard", icon: navIcon("nav-dashboard") }]} />
            <p className={styles.groupLabel}>Website content</p>
            <NavList items={contentNav} />
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
            <NavList items={[{ to: "/newsletter", label: "Newsletter", icon: <MailIcon /> }]} />
            {user.role === "super_admin" && (
              <>
                <p className={styles.groupLabel}>Administration</p>
                <NavList items={adminNav} />
              </>
            )}
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
            {summary?.failedEmails > 0 && (
              <p className={styles.alert} role="status">
                {summary.failedEmails} email{summary.failedEmails > 1 ? "s" : ""} could not be sent. Open the submission to retry.
              </p>
            )}
            <UserMenu />
          </header>
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </SummaryContext.Provider>
  );
}

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

// The signed-in person (Figma top bar: initials, name and role), with My account and Sign out.
function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className={styles.user} ref={ref}>
      <button type="button" className={styles.userButton} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
        <span className={styles.avatar} aria-hidden="true">{initials(user.name)}</span>
        <span className={styles.userText}>
          <strong>{user.name}</strong>
          <span>{roleLabel[user.role]}</span>
        </span>
      </button>
      {open && (
        <div className={styles.userMenu}>
          <Link to="/account">My account</Link>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      )}
    </div>
  );
}

// Line icons in the stroke style of the Figma sidebar icons.
const stroke = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "#fff", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

function DocumentIcon() {
  return (
    <svg {...stroke}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg {...stroke}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </svg>
  );
}

function PagesIcon() {
  return (
    <svg {...stroke}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </svg>
  );
}

function BinIcon() {
  return (
    <svg {...stroke}>
      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}
