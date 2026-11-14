import { useState } from "react";
import { Link } from "react-router";
import { reviewDate, shortDate } from "../lib/format.js";
import Img from "./Img.jsx";
import styles from "./MobileUpdates.module.css";

const tabs = ["News", "Publications", "FTCCI Review"];

export default function MobileUpdates({ articles, publications, reviews }) {
  const [tab, setTab] = useState("News");

  const items =
    tab === "News"
      ? articles.slice(0, 4).map((n) => ({ tag: n.tag, date: shortDate(n.date), title: n.title, image: n.image, to: `/media/news/${n.slug}` }))
      : tab === "Publications"
      ? publications.slice(0, 4).map((p) => ({ tag: "PDF", date: p.meta, title: p.title, image: p.cover, href: p.file?.url }))
      : reviews.slice(0, 4).map((r) => ({ tag: "PDF", date: reviewDate(r.date), title: "FTCCI Review", image: r.cover, href: r.file?.url }));

  return (
    <section className={`${styles.section} mobile-only`} id="updates" aria-labelledby="updates-title" data-edit="link.article">
      <h2 id="updates-title" className={styles.title}>
        Latest <span>Updates</span>
      </h2>
      <div className={styles.tabs} role="tablist" aria-label="Update type">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`${styles.tab} ${tab === t ? styles.active : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className={styles.list} role="tabpanel">
        {items.length === 0 && <p className={styles.empty}>New {tab === "News" ? "stories" : tab === "Publications" ? "publications" : "issues of FTCCI Review"} will appear here.</p>}
        {items.map((n) => {
          const body = (
            <>
              <Img className={styles.thumb} media={n.image} alt="" sizes="120px" />
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span className={styles.tag}>{n.tag}</span>
                  <span className={styles.date}>{n.date}</span>
                </div>
                <h3 className={styles.itemTitle}>{n.title}</h3>
              </div>
            </>
          );
          return n.to ? (
            <Link key={n.to} to={n.to} className={styles.item}>{body}</Link>
          ) : (
            <a key={n.href} href={n.href} className={styles.item} target="_blank" rel="noreferrer">{body}</a>
          );
        })}
      </div>
    </section>
  );
}
