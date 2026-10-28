import { Link } from "react-router-dom";
import { assets, eventSchedule, featuredEvent as f } from "../data/content.js";
import styles from "./Events.module.css";

// The mobile frame uses outline icons; desktop uses the filled ones.
function Icon({ src, mobileSrc, className }) {
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobileSrc} />
      <img className={className} src={src} alt="" />
    </picture>
  );
}

export default function Events() {
  return (
    <section className={styles.section} id="events" aria-labelledby="events-title">
      <div className={styles.grid}>
        <h2 id="events-title" className={styles.title}>
          Upcoming <span>Events</span>
        </h2>
        <Link to="/events" className={styles.outline}>See all events</Link>

        <article className={styles.featured}>
          <img className={styles.featuredImg} src={f.image} alt="" loading="lazy" />
          <div className={styles.overlay}>
            <h3 className={styles.name}>{f.title}</h3>
            <div className={styles.overlayRow}>
              <div className={styles.metaList}>
                <p className={styles.meta}>
                  <Icon src={assets.iconCalendar} mobileSrc={assets.iconCalendarMobile} />
                  {f.date}
                </p>
                <p className={styles.meta}>
                  <Icon src={assets.iconLocation} mobileSrc={assets.iconLocationMobile} />
                  {f.venue}
                </p>
              </div>
              <Link to={f.href} className={styles.cta}>View details →</Link>
            </div>
          </div>
        </article>

        <ul className={styles.schedule}>
          {eventSchedule.map((e) => (
            <li key={e.title} className={styles.row}>
              <p className={styles.when}>
                <strong>{e.date}</strong>
                <span>{e.time}</span>
              </p>
              <img className={styles.thumb} src={e.image} alt="" loading="lazy" />
              <div className={styles.what}>
                <h3>{e.title}</h3>
                <p>
                  <Icon src={assets.iconPin} mobileSrc={assets.iconPinMobile} />
                  {e.venue}
                </p>
              </div>
              <Link to={e.href} className={styles.join} aria-label={`Join now: ${e.title}`}>
                JOIN NOW
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
