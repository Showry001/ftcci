import { assets, publications } from "../data/content.js";
import useCarousel from "./useCarousel.js";
import styles from "./Publications.module.css";

export default function Publications() {
  const c = useCarousel();
  return (
    <section className={`${styles.section} desktop-only`} id="knowledge" aria-labelledby="pubs-title">
      <div className="container">
        <h2 id="pubs-title" className={styles.title}>Publications</h2>
        <div className={styles.introRow}>
          <p className={styles.lead}>
            Explore reports, policy papers, industry insights, and business publications that support informed
            decision-making and economic growth.
          </p>
          <div className={styles.arrows}>
            <button type="button" onClick={c.prev} disabled={!c.canPrev} aria-label="Previous publications">
              <img src={assets.pubArrowPrev} alt="" />
            </button>
            <button type="button" onClick={c.next} disabled={!c.canNext} aria-label="Next publications">
              <img src={assets.pubArrowNext} alt="" />
            </button>
          </div>
        </div>
        <div className={styles.track} ref={c.trackRef}>
          {publications.map((p, i) => (
            <article key={i} className={styles.card}>
              <div className={styles.cover}>
                <img src={p.image} alt={`${p.title} cover`} loading="lazy" />
              </div>
              <div className={styles.body}>
                <time>{p.date}</time>
                <h3>{p.title}</h3>
                <a href={p.href} target="_blank" rel="noreferrer">Download PDF --&gt;</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
