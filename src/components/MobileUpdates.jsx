import { useState } from "react";
import { news, publications } from "../data/content.js";
import styles from "./MobileUpdates.module.css";

const tabs = ["News", "Publications", "FTCCI Review"];

export default function MobileUpdates() {
  const [tab, setTab] = useState("News");

  const items =
    tab === "News"
      ? news.map((n) => ({ ...n, image: n.mobileImage || n.image, href: "#media" }))
      : tab === "Publications"
      ? publications.slice(0, 4).map((p) => ({ tag: "PDF", date: p.date, title: p.title, image: p.image, href: p.href, external: true }))
      : [];

  return (
    <section className={`${styles.section} mobile-only`} id="updates" aria-labelledby="updates-title">
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
        {items.length === 0 && <p className={styles.empty}>New issues of FTCCI Review will appear here.</p>}
        {items.map((n) => (
          <a
            key={n.title + n.image}
            href={n.href}
            className={styles.item}
            {...(n.external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            <img className={styles.thumb} src={n.image} alt="" loading="lazy" />
            <div className={styles.body}>
              <div className={styles.meta}>
                <span className={styles.tag}>{n.tag}</span>
                <time className={styles.date}>{n.date}</time>
              </div>
              <h3 className={styles.itemTitle}>{n.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
