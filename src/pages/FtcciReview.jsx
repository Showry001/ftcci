import { useEffect, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import PageHero from "../components/common/PageHero.jsx";
import Pagination from "../components/common/Pagination.jsx";
import Img from "../components/Img.jsx";
import useReader from "../components/useReader.jsx";
import { list } from "../lib/content.server.js";
import { reviewDate } from "../lib/format.js";
import { icons } from "../ui/assets.js";
import styles from "./FtcciReview.module.css";

const PER_PAGE = 12;

// The archive is filtered and paged on the server; the address keeps the filters (?year=&q=&page=).
export async function loader({ request }) {
  const params = new URL(request.url).searchParams;
  const year = Number(params.get("year")) || undefined;
  const q = (params.get("q") ?? "").slice(0, 100);
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [found, newest] = await Promise.all([list("review", { year, q, page, limit: PER_PAGE }), list("review", { limit: 1 })]);
  const oldest = newest.total ? await list("review", { limit: 1, page: newest.total }) : null;
  const first = Number(newest.items[0]?.date.slice(0, 4));
  const last = Number(oldest?.items[0]?.date.slice(0, 4));
  const years = first ? Array.from({ length: first - last + 1 }, (_, i) => first - i) : [];
  return { issues: found.items, total: found.total, page, year: year ?? null, q, years };
}

export const meta = () => [
  { title: "FTCCI Review – FTCCI" },
  { name: "description", content: "Every weekly issue of the FTCCI Review, to read online or download as PDF." },
];

export default function FtcciReview() {
  const { issues, total, page, year, q, years } = useLoaderData();
  const [, setParams] = useSearchParams();
  const [query, setQuery] = useState(q);
  const [reader, openReader] = useReader();
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const go = (next) => {
    const merged = { year: year ?? "", q, page: "", ...next };
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== "" && v !== null && v !== 1)), { preventScrollReset: true, replace: true });
  };

  // Search a moment after the last key press.
  useEffect(() => {
    if (query === q) return;
    const t = setTimeout(() => go({ q: query.trim() }), 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <>
      <PageHero crumb="Knowledge > FTCCI Review" title="FTCCI Review" />
      <section className={styles.filters}>
        <div className="container">
          <label className={styles.search}>
            <img src={icons.knowledge.search} alt="" width="20" height="20" />
            <span className="visually-hidden">Search issues</span>
            <input type="search" placeholder="Search issues by month or year" maxLength={100} value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className={styles.chips} role="group" aria-label="Filter by year">
            {[null, ...years].map((y) => (
              <button
                key={y ?? "all"}
                type="button"
                aria-pressed={year === y}
                className={`${styles.chip} ${year === y ? styles.chipOn : ""}`}
                onClick={() => go({ year: y ?? "" })}
              >
                {y ?? "All years"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.gridSection}>
        <div className="container">
          {issues.length === 0 ? (
            <p className={styles.empty}>No issues match your search.</p>
          ) : (
            <ul className={styles.grid}>
              {issues.map((r) => (
                <li key={r.slug} className={styles.card}>
                  <span className={styles.badge}>{r.date.slice(0, 4)}</span>
                  <Img className={styles.cover} media={r.cover} alt={`FTCCI Review, ${reviewDate(r.date)} cover`} sizes="300px" />
                  <div className={styles.bottom}>
                    <h3>{reviewDate(r.date)}</h3>
                    <p>
                      Weekly issue ·{" "}
                      <a href={r.file?.url} download target="_blank" rel="noreferrer" className={styles.download}>
                        Download PDF
                      </a>
                    </p>
                    <button
                      type="button"
                      className={styles.read}
                      aria-haspopup="dialog"
                      onClick={() => openReader({ src: r.file.url, title: `FTCCI Review – ${reviewDate(r.date)}` })}
                    >
                      Read Issue <img src={icons.knowledge.reviewArrow} alt="" width="18" height="18" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Pagination page={Math.min(page, pages)} pages={pages} onChange={(p) => go({ page: p })} />
        </div>
      </section>
      {reader}
    </>
  );
}
