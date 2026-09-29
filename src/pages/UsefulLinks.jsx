import { useMemo, useState } from "react";
import PageHero from "../components/common/PageHero.jsx";
import { linkArrowSm, linkDirectory, searchIcon } from "../data/knowledge.js";
import styles from "./UsefulLinks.module.css";

export default function UsefulLinks() {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return linkDirectory;
    return linkDirectory
      .map((g) => ({ ...g, links: g.links.filter((l) => `${l.title} ${l.text} ${g.group}`.toLowerCase().includes(term)) }))
      .filter((g) => g.links.length);
  }, [q]);

  return (
    <>
      <PageHero crumb="Knowledge > Links" title="Useful Links" />
      <section className={styles.section}>
        <div className="container">
          <label className={styles.search}>
            <img src={searchIcon} alt="" width="20" height="20" />
            <span className="visually-hidden">Search links</span>
            <input type="search" placeholder="Search Links" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className={styles.groups}>
            {groups.length === 0 && <p className={styles.empty}>No links match “{q}”.</p>}
            {groups.map((g) => (
              <section key={g.group} className={styles.group} aria-labelledby={`g-${g.group}`}>
                <h2 id={`g-${g.group}`}>{g.group}</h2>
                <ul className={styles.cards}>
                  {g.links.map((l) => (
                    <li key={l.title}>
                      <a href={l.href} target="_blank" rel="noreferrer" className={styles.card}>
                        <span className={styles.cardHead}>
                          <strong>{l.title}</strong>
                          <img src={linkArrowSm} alt="" width="12" height="12" />
                        </span>
                        <span className={styles.cardText}>{l.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
