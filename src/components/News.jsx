import { Link } from "react-router";
import { shortDate } from "../lib/format.js";
import Img from "./Img.jsx";
import styles from "./News.module.css";

export default function News({ articles }) {
  if (!articles.length) return null;
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const news = articles.filter((a) => a !== featured).slice(0, 3);
  return (
    <section className={`${styles.section} desktop-only`} id="media" aria-labelledby="news-title" data-edit="link.article">
      <div className="container">
        <div className={styles.head}>
          <h2 id="news-title" className={styles.title}>
            Latest <span>News</span>
          </h2>
          <Link to="/media" className={styles.outline}>View all News</Link>
        </div>
        <div className={styles.grid}>
          <Link to={`/media/news/${featured.slug}`} className={styles.featured}>
            <div className={styles.featuredMedia}>
              <Img media={featured.image} alt={featured.title} sizes="(min-width: 1200px) 620px, 100vw" />
            </div>
            <div className={styles.featuredBody}>
              <div className={styles.metaRow}>
                <span className={styles.tag}>{featured.tag}</span>
                <time className={styles.date} dateTime={featured.date}>{shortDate(featured.date)}</time>
              </div>
              <h3 className={styles.featuredTitle}>{featured.title}</h3>
              {featured.excerpt && <p className={styles.excerpt}>{featured.excerpt}</p>}
            </div>
          </Link>
          <div className={styles.list}>
            {news.map((n) => (
              <Link key={n.slug} to={`/media/news/${n.slug}`} className={styles.item}>
                <Img className={styles.thumb} media={n.image} alt="" sizes="160px" />
                <div className={styles.itemBody}>
                  <div className={styles.metaRow}>
                    <span className={`${styles.tag} ${styles.tagSm}`}>{n.tag}</span>
                    <time className={`${styles.date} ${styles.dateSm}`} dateTime={n.date}>{shortDate(n.date)}</time>
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
