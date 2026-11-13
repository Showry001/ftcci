import { Link, useLoaderData, useSearchParams } from "react-router";
import PageHero from "../components/common/PageHero.jsx";
import Img, { CoverImage } from "../components/Img.jsx";
import { list } from "../lib/content.server.js";
import { dayMonthYear, timeRange } from "../lib/format.js";
import { todayInIndia } from "../../shared/forms.js";
import { icons } from "../ui/assets.js";
import styles from "./Events.module.css";

const eventIcons = icons.event;
const PERIODS = 7;

// Financial year (June–May) an ISO date falls in, as the start year: 2021-05-31 → 2020.
const periodOf = (iso) => {
  const [y, m] = iso.split("-").map(Number);
  return m >= 6 ? y : y - 1;
};

export async function loader({ request }) {
  const params = new URL(request.url).searchParams;
  if (params.get("tab") !== "past") {
    const upcoming = await list("event", { when: "upcoming", limit: 100 });
    return { past: false, events: upcoming.items };
  }
  // Open on the most recent period that has events, so the list is never empty on arrival.
  const latest = await list("event", { when: "past", limit: 1 });
  const current = periodOf(todayInIndia());
  const asked = Number(params.get("year"));
  const period = asked >= current - PERIODS && asked <= current ? asked : latest.items[0] ? periodOf(latest.items[0].date) : current;
  const events = await list("event", { when: "past", from: `${period}-06-01`, to: `${period + 1}-05-31`, limit: 100 });
  return { past: true, period, current, events: events.items };
}

export const meta = () => [
  { title: "Events & Conference – FTCCI" },
  { name: "description", content: "Upcoming FTCCI conferences, expos, forums and member events, and the archive of past events." },
];

function EventCard({ e }) {
  return (
    <Link to={`/events/${e.slug}`} className={styles.card}>
      <div className={styles.media}>
        <Img media={e.image} alt="" sizes="(min-width: 1200px) 400px, 100vw" />
      </div>
      <div className={styles.body}>
        <h3>{e.title}</h3>
        {e.subtitle && <p className={styles.subtitle}>{e.subtitle}</p>}
        <p className={styles.meta}>
          <img src={eventIcons.calendar} alt="" width="17" height="17" />
          {e.date}
          {e.startTime && ` | ${timeRange(e.startTime, e.endTime, true)}`}
        </p>
        {e.venue && (
          <p className={styles.meta}>
            <img src={eventIcons.pin} alt="" width="17" height="17" />
            {e.venue}
          </p>
        )}
      </div>
    </Link>
  );
}

function PastEvents({ events, period, current }) {
  const [, setParams] = useSearchParams();
  const periods = Array.from({ length: PERIODS }, (_, i) => current - i);
  return (
    <>
      <div className={styles.periods} role="group" aria-label="Filter by financial year">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={period === p}
            className={`${styles.period} ${period === p ? styles.periodOn : ""}`}
            onClick={() => setParams({ tab: "past", year: String(p) }, { preventScrollReset: true })}
          >
            June {p} - May {p + 1}
          </button>
        ))}
      </div>
      {events.length === 0 ? (
        <p className={styles.empty}>No past events are listed for this period yet.</p>
      ) : (
        <ul className={styles.pastList}>
          {events.map((e) => {
            const body = (
              <>
                <CoverImage media={e.image} className={styles.pastImg} sizes="240px" />
                <div className={styles.pastBody}>
                  <h3>{e.title}</h3>
                  <p className={styles.pastDate}>
                    <img src={eventIcons.calendar} alt="" width="17.36" height="17.36" />
                    <time dateTime={e.date}>{dayMonthYear(e.date)}</time>
                  </p>
                </div>
              </>
            );
            return (
              <li key={e.slug} className={styles.pastRow}>
                {e.intro || e.about ? <Link to={`/events/${e.slug}`} className={styles.pastLink}>{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function Events() {
  const data = useLoaderData();
  const [, setParams] = useSearchParams();
  const { past } = data;

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
                  onClick={() => setParams(isPast ? { tab: "past" } : {}, { preventScrollReset: true })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {past ? (
            <PastEvents events={data.events} period={data.period} current={data.current} />
          ) : data.events.length ? (
            <div className={styles.grid}>
              {data.events.map((e) => (
                <EventCard key={e.slug} e={e} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              No upcoming events are scheduled right now. <Link to="/events?tab=past">See past events</Link>.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
