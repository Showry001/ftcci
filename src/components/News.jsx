import { Link } from "react-router-dom";
import { featuredNews, news } from "../data/content.js";
import styles from "./News.module.css";

export default function News() {
  return (
    <section className={`${styles.section} desktop-only`} id="media" aria-labelledby="news-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="news-title" className={styles.title}>
            Latest <span>News</span>
          </h2>
          <Link to="/media" className={styles.outline}>View all News</Link>
        </div>
        <div className={styles.grid}>
          <Link to="/media" className={styles.featured}>
            <div className={styles.featuredMedia}>
              <img src={featuredNews.image} alt={featuredNews.title} loading="lazy" />
            </div>
            <div className={styles.featuredBody}>
              <div className={styles.metaRow}>
                <span className={styles.tag}>{featuredNews.tag}</span>
                <time className={styles.date}>{featuredNews.date}</time>
              </div>
              <h3 className={styles.featuredTitle}>{featuredNews.title}</h3>
              <p className={styles.excerpt}>{featuredNews.excerpt}</p>
            </div>
          </Link>
          <div className={styles.list}>
            {news.map((n) => (
              <Link key={n.title} to="/media" className={styles.item}>
                <img className={styles.thumb} src={n.image} alt="" loading="lazy" />
                <div className={styles.itemBody}>
                  <div className={styles.metaRow}>
                    <span className={`${styles.tag} ${styles.tagSm}`}>{n.tag}</span>
                    <time className={`${styles.date} ${styles.dateSm}`}>{n.date}</time>
                  </div>
                  <h3 className={styles.itemTitle}>{n.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
