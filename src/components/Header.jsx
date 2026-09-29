import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { assets, navLinks } from "../data/content.js";
import HallBookingForm from "./HallBookingForm.jsx";
import styles from "./Header.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const { pathname, hash, search } = useLocation();
  useEffect(() => setOpen(false), [pathname, hash, search]);
  useEffect(() => {
    if (open) setExpanded(navLinks.find((l) => l.children && pathname.startsWith(l.to))?.label ?? null);
  }, [open, pathname]);

  useEffect(() => {
    document.body.style.overflow = open || booking ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, booking]);

  const openBooking = () => {
    setOpen(false);
    setBooking(true);
  };

  return (
    <>
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="FTCCI home">
          <span className={styles.logo}>
            <img src={assets.logo} alt="FTCCI emblem" />
          </span>
          <span className={styles.brandText}>
            The Federation of Telangana Chambers
            <br />
            of Commerce and Industry
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? styles.navActive : undefined)}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.search} aria-label="Search">
            <img src={assets.search} alt="" width="46" height="41" />
          </button>
          <button type="button" className={styles.searchMobile} aria-label="Search">
            <img src={assets.searchMobile} alt="" width="34.78" height="31" />
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnGold}`} aria-haspopup="dialog" onClick={openBooking}>
            Hall Booking
          </button>
          <Link to="/membership" className={`${styles.btn} ${styles.btnNavy}`}>Become a Member</Link>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <img src={assets.menu} alt="" width="38" height="32" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`} hidden={!open}>
        <nav aria-label="Mobile" className={styles.accordion}>
          {navLinks.map((l) =>
            l.children ? (
              <div key={l.to} className={styles.group}>
                <button
                  type="button"
                  className={styles.groupBtn}
                  aria-expanded={expanded === l.label}
                  aria-controls={`menu-${l.label}`}
                  onClick={() => setExpanded((e) => (e === l.label ? null : l.label))}
                >
                  {l.label}
                </button>
                {expanded === l.label && (
                  <ul id={`menu-${l.label}`} className={styles.groupPanel}>
                    {l.children.map(([label, to]) => (
                      <li key={to}>
                        <Link to={to} onClick={() => setOpen(false)}>{label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link key={l.to} to={l.to} className={styles.groupBtn} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            )
          )}
        </nav>
        <div className={styles.drawerCtas}>
          <button type="button" className={`${styles.btn} ${styles.btnGold}`} aria-haspopup="dialog" onClick={openBooking}>
            Hall Booking
          </button>
          <Link to="/membership" className={`${styles.btn} ${styles.btnNavy}`}>Become a Member</Link>
        </div>
      </div>
    </header>
    <HallBookingForm open={booking} onClose={() => setBooking(false)} />
    </>
  );
}
