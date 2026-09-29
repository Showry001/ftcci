import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHero from "../components/common/PageHero.jsx";
import { eventIcons, pastEvents, upcomingEvents } from "../data/events.js";
import styles from "./Events.module.css";

export function EventCard({ e }) {
  const body = (
    <>
      <div className={styles.media}>
        <img src={e.image} alt="" loading="lazy" />
        <span className={styles.tag}>{e.tag}</span>
      </div>
      <div className={styles.body}>
        <h3>{e.title}</h3>
        <p className={styles.subtitle}>{e.subtitle}</p>
        <p className={styles.meta}>
          <img src={eventIcons.calendar} alt="" width="17" height="17" />
          {e.date}
        </p>
        <p className={styles.meta}>
          <img src={eventIcons.pin} alt="" width="17" height="17" />
          {e.venue}
        </p>
      </div>
    </>
  );
  const to = e.slug ? `/events/${e.slug}` : e.href;
  return to ? (
    <Link to={to} className={styles.card}>{body}</Link>
  ) : (
    <article className={styles.card}>{body}</article>
  );
}

export default function Events() {
  const [params, setParams] = useSearchParams();
  const [tab, setTabState] = useState(params.get("tab") === "past" ? "past" : "upcoming");
  useEffect(() => setTabState(params.get("tab") === "past" ? "past" : "upcoming"), [params]);
  const setTab = (t) => setParams(t === "past" ? { tab: "past" } : {}, { replace: true });
  const list = tab === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <>
      <PageHero crumb="Home > Events" title="Events & Conference" />
      <section className={styles.section}>
        <div className="container">
          <div className={styles.toggle} role="tablist" aria-label="Event timeframe">
            <button type="button" role="tab" aria-selected={tab === "upcoming"} className={tab === "upcoming" ? styles.on : ""} onClick={() => setTab("upcoming")}>
              Upcoming Events
            </button>
            <button type="button" role="tab" aria-selected={tab === "past"} className={tab === "past" ? styles.on : ""} onClick={() => setTab("past")}>
              Past Events
            </button>
          </div>
          <div className={styles.grid} role="tabpanel">
            {list.length === 0 && <p className={styles.empty}>Past events will appear here once they are published.</p>}
            {list.map((e, i) => (
              <EventCard key={i} e={e} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
