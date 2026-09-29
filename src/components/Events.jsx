import { Link } from "react-router-dom";
import { assets, events } from "../data/content.js";
import useCarousel from "./useCarousel.js";
import Dots from "./Dots.jsx";
import styles from "./Events.module.css";

export default function Events() {
  const c = useCarousel();
  return (
    <section className={styles.section} id="events" aria-labelledby="events-title">
      <div className={styles.wrap}>
        <div className={styles.head}>
          <h2 id="events-title" className={styles.title}>
            Upcoming <span>Events</span>
          </h2>
          <Link to="/events" className={`${styles.outline} desktop-only`}>See all events</Link>
        </div>

        <div className={styles.stage}>
          <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={c.prev} disabled={!c.canPrev} aria-label="Previous event">
            <img src={assets.eventArrowPrev} alt="" />
          </button>
          <div className={styles.track} ref={c.trackRef}>
            {events.map((e, i) => (
              <article key={i} className={styles.slide} aria-roledescription="slide" aria-label={`${i + 1} of ${events.length}`}>
                <div className={styles.media}>
                  <img src={e.image} alt={e.title} loading="lazy" />
                </div>
                <div className={styles.body}>
                  <p className={styles.org}>{e.organiser}</p>
                  <h3 className={styles.name}>{e.title}</h3>
                  <p className={styles.meta}>
                    <img src={assets.iconCalendar} alt="" width="17.25" height="17.25" />
                    {e.date}
                  </p>
                  <p className={`${styles.meta} ${styles.metaLast}`}>
                    <img src={assets.iconLocation} alt="" width="17.25" height="17.25" />
                    {e.venue}
                  </p>
                  <Link to={e.href} className={styles.cta}>View details →</Link>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={c.next} disabled={!c.canNext} aria-label="Next event">
            <img src={assets.eventArrowNext} alt="" />
          </button>
        </div>
        <Dots count={c.pages} active={c.page} onSelect={c.goTo} tone="amber" label="Event slides" />
      </div>
    </section>
  );
}
