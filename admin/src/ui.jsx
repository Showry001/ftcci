import { icons } from "./sections.js";
import styles from "./ui.module.css";

export function PageHead({ title, intro, children }) {
  return (
    <div className={styles.head}>
      <div>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
      {children}
    </div>
  );
}

export function SearchBox({ value, onChange, label }) {
  return (
    <label className={styles.search}>
      <img src={icons.search} alt="" width="17" height="17" />
      <span className="visually-hidden">{label}</span>
      <input type="search" value={value} placeholder="Search" maxLength={100} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className={styles.select}>
      <span className="visually-hidden">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <img src={icons.chevron} alt="" width="8" height="14" />
    </label>
  );
}

const tones = { new: "blue", contacted: "orange", closed: "green", pending: "orange", confirmed: "green", unsubscribed: "grey", sent: "green", failed: "red", queued: "blue", retrying: "orange" };
export function Pill({ tone, children }) {
  return <span className={`${styles.pill} ${styles[tones[tone] ?? tone]}`}>{children}</span>;
}

export function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages === 1) return null;
  const shown = [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  return (
    <nav className={styles.pages} aria-label="Pages">
      <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
        <img src={icons.prev} alt="" width="6" height="10" />
      </button>
      {shown.map((p, i) => (
        <span key={p} className={styles.pageGroup}>
          {i > 0 && p - shown[i - 1] > 1 && <span className={styles.gap}>…</span>}
          <button type="button" aria-current={p === page ? "page" : undefined} onClick={() => onPage(p)}>
            {p}
          </button>
        </span>
      ))}
      <button type="button" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page">
        <img src={icons.next} alt="" width="6" height="10" className={styles.flip} />
      </button>
    </nav>
  );
}

export function Message({ tone = "info", children }) {
  return <p className={`${styles.message} ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>{children}</p>;
}

