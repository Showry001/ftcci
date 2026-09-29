import { useState } from "react";
import PageHero from "../components/common/PageHero.jsx";
import SubNav from "../components/common/SubNav.jsx";
import { coverage, mediaIcons, mediaSubNav, pressKit } from "../data/media.js";
import styles from "./Media.module.css";

const PER_PAGE = 4;

function Meta({ tag, date, small }) {
  return (
    <p className={`${styles.meta} ${small ? styles.metaSm : ""}`}>
      <span>{tag}</span>
      <time>{date}</time>
    </p>
  );
}

export default function Media() {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(coverage.length / PER_PAGE));
  const items = coverage.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const [lead, ...rest] = items;

  return (
    <>
      <PageHero crumb="Home > Media" title="Media" />
      <SubNav items={mediaSubNav} label="Media sections" />

      <section id="press-coverage" className={styles.coverage}>
        <div className="container">
          <h2 className={styles.h2}>Featured Media Coverage</h2>
          <p className={styles.sub}>FTCCI initiatives, policy dialogues, and industrial growth stories in leading publications.</p>

          {lead && (
            <a href="#press-coverage" className={styles.lead}>
              <span className={styles.leadMedia}>
                <img src={lead.image} alt="" loading="lazy" />
              </span>
              <div className={styles.leadBody}>
                <Meta tag={lead.tag} date={lead.date} />
                <h3>{lead.title}</h3>
                <p>{lead.excerpt}</p>
              </div>
            </a>
          )}

          <div className={styles.grid}>
            {rest.map((n) => (
              <a key={n.title} href="#press-coverage" className={styles.card}>
                <span className={styles.cardMedia}>
                  <img src={n.image} alt="" loading="lazy" />
                </span>
                <div className={styles.cardBody}>
                  <Meta tag={n.tag} date={n.date} small />
                  <h3>{n.title}</h3>
                  <p>{n.excerpt}</p>
                </div>
              </a>
            ))}
          </div>

          {/* The design shows 3 pages; the pager reflects however many stories exist. */}
          <nav className={styles.pager} aria-label="Coverage pages">
            {Array.from({ length: Math.max(pages, 1) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={n === page ? styles.pageOn : ""}
                aria-current={n === page ? "page" : undefined}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
              <img src={mediaIcons.doubleArrow} alt="" width="20" height="20" />
            </button>
          </nav>
        </div>
      </section>

      <section id="press-kit" className={styles.kit}>
        <div className="container">
          <h2 className={styles.kitTitle}>Media &amp; Press Assets</h2>
          <p className={styles.kitSub}>Download official organization assets, brand guidelines, and high-resolution media resources.</p>
          <ul className={styles.kitGrid}>
            {pressKit.map((k) => (
              <li key={k.title} className={`${styles.tile} ${k.wide ? styles.tileWide : ""}`}>
                <h3>{k.title}</h3>
                <p>{k.text}</p>
                {/* TODO: link each tile to its asset bundle */}
                <a href="#press-kit" className={styles.dl}>
                  <img src={mediaIcons.download} alt="" width="14" height="14" />
                  Download Assets
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
