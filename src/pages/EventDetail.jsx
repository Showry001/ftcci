import { useState } from "react";
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from "react-router";
import { todayInIndia } from "../../shared/forms.js";
import EventInterestForm from "../components/EventInterestForm.jsx";
import { CoverImage } from "../components/Img.jsx";
import { isPreview, item } from "../lib/content.server.js";
import { dayMonthYear, timeRange } from "../lib/format.js";
import { icons } from "../ui/assets.js";
import NotFound from "./NotFound.jsx";
import styles from "./EventDetail.module.css";

const eventIcons = icons.event;

export async function loader({ params, request }) {
  const event = await item("event", params.slug, request);
  const ogImage = event.image ? new URL(event.image.url, request.url).href : null;
  return Response.json({ event, ogImage, upcoming: !event.archived && event.date >= todayInIndia() }, isPreview(request) ? { headers: { "Cache-Control": "private, no-store" } } : undefined);
}

export const meta = ({ data }) =>
  data
    ? [
        { title: `${data.event.title} – FTCCI` },
        { name: "description", content: data.event.intro ?? data.event.subtitle ?? data.event.title },
        { property: "og:title", content: data.event.title },
        ...(data.ogImage ? [{ property: "og:image", content: data.ogImage }] : []),
      ]
    : [];

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  throw error;
}

export default function EventDetail() {
  const { event: ev, upcoming } = useLoaderData();
  const [registering, setRegistering] = useState(false);

  const facts = [
    { label: "Date", value: `${dayMonthYear(ev.date)}${ev.startTime ? ` | ${timeRange(ev.startTime, ev.endTime, true)}` : ""}`, icon: eventIcons.detailCalendar },
    ev.venue && { label: "Venue", value: ev.venue, icon: eventIcons.detailPin },
    { label: "Status", value: upcoming ? "Upcoming" : "Past event", icon: eventIcons.detailStatus },
  ].filter(Boolean);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          {ev.category && <span className={styles.tag}>{ev.category}</span>}
          <h1>{ev.title}</h1>
          {(ev.intro || ev.subtitle) && <p>{ev.intro || ev.subtitle}</p>}
        </div>
        <CoverImage media={ev.image} alt={ev.title} className={styles.heroImg} sizes="(min-width: 1200px) 727px, 100vw" loading="eager" />
      </section>

      <section className={styles.body}>
        <div className={styles.inner}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link to="/events">Events</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{ev.title}</span>
          </nav>

          <div className={styles.grid}>
            <div className={styles.aboutBlock}>
              {ev.about && (
                <>
                  <h2>About This Event</h2>
                  <p className={styles.about}>{ev.about}</p>
                </>
              )}
            </div>
            <div className={styles.expectBlock}>
              {ev.expect?.length > 0 && (
                <>
                  <h2 className={styles.expectTitle}>What to Expect</h2>
                  <ul className={styles.expect}>
                    {ev.expect.map((x) => (
                      <li key={x}>
                        <img src={eventIcons.check} alt="" width="18.5" height="18.5" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {upcoming &&
                (ev.registrationUrl ? (
                  <a className={styles.register} href={ev.registrationUrl} target="_blank" rel="noreferrer">
                    Register <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <button type="button" className={styles.register} onClick={() => setRegistering(true)}>
                    Register Interest <span aria-hidden="true">→</span>
                  </button>
                ))}
            </div>

            <aside className={styles.side}>
              <div className={styles.details}>
                <h3>Event Details</h3>
                <dl>
                  {facts.map((f) => (
                    <div key={f.label}>
                      <span className={styles.factIcon}>
                        <img src={f.icon} alt="" width="19" height="19" />
                      </span>
                      <div>
                        <dt>{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
              {ev.brochure && (
                <a className={styles.pdf} href={ev.brochure.url} download target="_blank" rel="noreferrer">Download PDF</a>
              )}
            </aside>
          </div>
        </div>
      </section>
      {upcoming && !ev.registrationUrl && (
        <EventInterestForm open={registering} onClose={() => setRegistering(false)} event={ev.slug} eventTitle={ev.title} />
      )}
    </>
  );
}
