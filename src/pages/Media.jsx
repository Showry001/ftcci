import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import PageHero from "../components/common/PageHero.jsx";
import SubNav, { useTab } from "../components/common/SubNav.jsx";
import Img from "../components/Img.jsx";
import { list, single } from "../lib/content.server.js";
import { shortDate } from "../lib/format.js";
import { icons, subNav } from "../ui/assets.js";
import styles from "./Media.module.css";

const mediaIcons = icons.media;
const mediaSubNav = subNav.media;

export async function loader({ request }) {
  const [page, articles] = await Promise.all([single("media", request), list("article", { limit: 100 })]);
  return { pressKit: page.pressKit, coverage: articles.items };
}

export const meta = () => [{ title: "Media – FTCCI" }, { name: "description", content: "FTCCI in the news, press releases and the FTCCI press kit." }];

const PER_PAGE = 4;

function Meta({ tag, date, small }) {
  return (
    <p className={`${styles.meta} ${small ? styles.metaSm : ""}`}>
      <span>{tag}</span>
      <time dateTime={date}>{shortDate(date)}</time>
    </p>
  );
}

export default function Media() {
  const { coverage, pressKit } = useLoaderData();
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(coverage.length / PER_PAGE));
  const items = coverage.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const [lead, ...rest] = items;
  const tab = useTab(mediaSubNav.map((i) => i.href.slice(1)));

  return (
    <>
      <PageHero crumb="Home > Media" title="Media" />
      <SubNav items={mediaSubNav} label="Media sections" tabs />

      {tab === "press-coverage" && (
        <section className={styles.coverage}>
          <div className="container">
            <h2 className={styles.h2}>Featured Media Coverage</h2>
            <p className={styles.sub}>FTCCI initiatives, policy dialogues, and industrial growth stories in leading publications.</p>

            {lead && (
              <Link to={`/media/news/${lead.slug}`} className={styles.lead}>
                <span className={styles.leadMedia}>
                  <Img media={lead.image} alt="" sizes="(min-width: 1200px) 620px, 100vw" />
                </span>
                <div className={styles.leadBody}>
                  <Meta tag={lead.tag} date={lead.date} />
                  <h3>{lead.title}</h3>
                </div>
              </Link>
            )}

            <div className={styles.grid}>
              {rest.map((n) => (
                <Link key={n.slug} to={`/media/news/${n.slug}`} className={styles.card}>
                  <span className={styles.cardMedia}>
                    <Img media={n.image} alt="" sizes="(min-width: 1200px) 400px, 100vw" />
                  </span>
                  <div className={styles.cardBody}>
                    <Meta tag={n.tag} date={n.date} small />
                    <h3>{n.title}</h3>
                    {n.excerpt && <p>{n.excerpt}</p>}
                  </div>
                </Link>
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
      )}

      {tab === "press-kit" && (
        <section className={styles.kit}>
          <div className="container">
            <h2 className={styles.kitTitle}>Media &amp; Press Assets</h2>
            <p className={styles.kitSub}>Download official organization assets, brand guidelines, and high-resolution media resources.</p>
            <ul className={styles.kitGrid}>
              {pressKit.map((k) => (
                <li key={k.title} className={styles.tile}>
                  <h3>{k.title}</h3>
                  {k.text && <p>{k.text}</p>}
                  <a href={k.file?.url} download target="_blank" rel="noreferrer" className={styles.dl}>
                    <img src={mediaIcons.download} alt="" width="14" height="14" />
                    Download Assets
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
