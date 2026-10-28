import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHero from "../components/common/PageHero.jsx";
import CroppedImage from "../components/CroppedImage.jsx";
import { eventIcons, pastEvents, pastPeriods, upcomingEvents } from "../data/events.js";
import styles from "./Events.module.css";

export function EventCard({ e }) {
  const body = (
    <>
      <div className={styles.media}>
        <img src={e.image} alt="" loading="lazy" />
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

// Financial year (June–May) an ISO date falls in, as the start year: 2021-05-31 → 2020.
const periodOf = (iso) => {
  const [y, m] = iso.split("-").map(Number);
  return m >= 6 ? y : y - 1;
};
const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function PastEvents() {
  // Open on the most recent period that has events, so the list is never empty on arrival.
  const [period, setPeriod] = useState(() => Math.max(...pastEvents.map((e) => periodOf(e.date))));
  const list = pastEvents.filter((e) => periodOf(e.date) === period);

  return (
    <>
      <div className={styles.periods} role="group" aria-label="Filter by financial year">
        {pastPeriods.map((p) => (
          <button
            key={p.start}
            type="button"
            aria-pressed={period === p.start}
            className={`${styles.period} ${period === p.start ? styles.periodOn : ""}`}
            onClick={() => setPeriod(p.start)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className={styles.empty}>No past events are listed for this period yet.</p>
      ) : (
        <ul className={styles.pastList}>
          {list.map((e) => (
            <li key={e.title} className={styles.pastRow}>
              <CroppedImage src={e.image} crop={e.crop} className={styles.pastImg} />
              <div className={styles.pastBody}>
                <h3>{e.title}</h3>
                <p className={styles.pastDate}>
                  <img src={eventIcons.calendar} alt="" width="17.36" height="17.36" />
                  <time dateTime={e.date}>{formatDate(e.date)}</time>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Events() {
  const [params, setParams] = useSearchParams();
  const past = params.get("tab") === "past";

  return (
    <>
      <PageHero crumb="Home > Events" title="Events & Conference" />
      <section className={`${styles.section} ${past ? styles.pastSection : ""}`}>
        <div className="container">
          <div className={styles.headRow}>
            <h2 className={styles.heading}>{past ? "Past Events" : "Upcoming Events"}</h2>
            <div className={styles.toggle} role="group" aria-label="Show events">
              {[
                ["Upcoming", false],
                ["Past", true],
              ].map(([label, isPast]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={past === isPast}
                  className={past === isPast ? styles.toggleOn : undefined}
                  onClick={() => setParams(isPast ? { tab: "past" } : {})}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {past ? (
            <PastEvents />
          ) : (
            <div className={styles.grid}>
              {upcomingEvents.map((e, i) => (
                <EventCard key={i} e={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
