import { useMemo, useState } from "react";
import PageHero from "../components/common/PageHero.jsx";
import Pagination from "../components/common/Pagination.jsx";
import useReader from "../components/useReader.jsx";
import { reviewArrow, reviewIssues, reviewYears, searchIcon } from "../data/knowledge.js";
import styles from "./FtcciReview.module.css";

const PER_PAGE = 12;

export default function FtcciReview() {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState(reviewYears[0]);
  const [page, setPage] = useState(1);
  const [reader, openReader] = useReader();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviewIssues.filter(
      (r) => (year === "All years" || r.year === year) && (!q || r.date.toLowerCase().includes(q))
    );
  }, [query, year]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <>
      <PageHero crumb="Knowledge > FTCCI Review" title="FTCCI Review" />
      <section className={styles.filters}>
        <div className="container">
          <label className={styles.search}>
            <img src={searchIcon} alt="" width="20" height="20" />
            <span className="visually-hidden">Search issues</span>
            <input
              type="search"
              placeholder="Search issues by month or year"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <div className={styles.chips} role="group" aria-label="Filter by year">
            {reviewYears.map((y) => (
              <button
                key={y}
                type="button"
                aria-pressed={year === y}
                className={`${styles.chip} ${year === y ? styles.chipOn : ""}`}
                onClick={() => {
                  setYear(y);
                  setPage(1);
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.gridSection}>
        <div className="container">
          {visible.length === 0 ? (
            <p className={styles.empty}>No issues match your search.</p>
          ) : (
            <ul className={styles.grid}>
              {visible.map((r) => (
                <li key={r.id} className={styles.card}>
                  <span className={styles.badge}>{r.year}</span>
                  <img className={styles.cover} src={r.cover} alt={`FTCCI Review, ${r.date} cover`} loading="lazy" />
                  <div className={styles.bottom}>
                    <h3>{r.date}</h3>
                    <p>
                      Weekly issue ·{" "}
                      <a href={r.pdf} download target="_blank" rel="noreferrer" className={styles.download}>
                        Download PDF
                      </a>
                    </p>
                    <button
                      type="button"
                      className={styles.read}
                      aria-haspopup="dialog"
                      onClick={() => openReader({ src: r.pdf, title: `FTCCI Review – ${r.date}` })}
                    >
                      Read Issue <img src={reviewArrow} alt="" width="18" height="18" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Pagination page={current} pages={pages} onChange={setPage} />
        </div>
      </section>
      {reader}
    </>
  );
}
