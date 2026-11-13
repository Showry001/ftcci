import { Link } from "react-router";
import { longDate, scheduleDate, time12, timeRange } from "../lib/format.js";
import { assets } from "../ui/assets.js";
import Img from "./Img.jsx";
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

// Home "Upcoming Events": a featured card and the next few events. When nothing is scheduled yet, the
// most recent events are shown instead.
export default function Events({ upcoming, recent }) {
  const events = upcoming.length ? upcoming : recent;
  if (!events.length) return null;
  const f = events.find((e) => e.featured) ?? events[0];
  const schedule = events.filter((e) => e !== f).slice(0, 4);
  return (
    <section className={styles.section} id="events" aria-labelledby="events-title">
      <div className={styles.grid}>
        <h2 id="events-title" className={styles.title}>
          {upcoming.length ? "Upcoming" : "Recent"} <span>Events</span>
        </h2>
        <Link to="/events" className={styles.outline}>See all events</Link>

        <article className={styles.featured}>
          <Img className={styles.featuredImg} media={f.image} alt="" sizes="(min-width: 1200px) 620px, 100vw" />
          <div className={styles.overlay}>
            <h3 className={styles.name}>{f.title}</h3>
            <div className={styles.overlayRow}>
              <div className={styles.metaList}>
                <p className={styles.meta}>
                  <Icon src={assets.iconCalendar} mobileSrc={assets.iconCalendarMobile} />
                  {longDate(f.date)}
                  {f.startTime && ` · ${timeRange(f.startTime, f.endTime)}`}
                </p>
                {f.venue && (
                  <p className={styles.meta}>
                    <Icon src={assets.iconLocation} mobileSrc={assets.iconLocationMobile} />
                    {f.venue}
                  </p>
                )}
              </div>
              <Link to={`/events/${f.slug}`} className={styles.cta}>View details →</Link>
            </div>
          </div>
        </article>

        <ul className={styles.schedule}>
          {schedule.map((e) => (
            <li key={e.slug} className={styles.row}>
              <p className={styles.when}>
                <strong>{scheduleDate(e.date)}</strong>
                <span>{time12(e.startTime, true)}</span>
              </p>
              <Img className={styles.thumb} media={e.image} alt="" sizes="120px" />
              <div className={styles.what}>
                <h3>{e.title}</h3>
                {e.venue && (
                  <p>
                    <Icon src={assets.iconPin} mobileSrc={assets.iconPinMobile} />
                    {e.venue}
                  </p>
                )}
              </div>
              <Link to={`/events/${e.slug}`} className={styles.join} aria-label={`${upcoming.length ? "Join now" : "View"}: ${e.title}`}>
                {upcoming.length ? "JOIN NOW" : "VIEW"}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
