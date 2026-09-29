import { Link, useParams } from "react-router-dom";
import CroppedImage from "../components/CroppedImage.jsx";
import NotFound from "./NotFound.jsx";
import { eventDetails, eventIcons } from "../data/events.js";
import styles from "./EventDetail.module.css";

export default function EventDetail() {
  const { slug } = useParams();
  const ev = eventDetails[slug];
  if (!ev) return <NotFound />;

  const facts = [
    { label: "Date", value: ev.date, icon: eventIcons.detailCalendar },
    { label: "Venue", value: ev.venue, icon: eventIcons.detailPin },
    { label: "Status", value: ev.status, icon: eventIcons.detailStatus },
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.tag}>{ev.tag}</span>
          <h1>{ev.title}</h1>
          <p>{ev.intro}</p>
        </div>
        <CroppedImage src={ev.image} crop={ev.crop} alt={ev.title} className={styles.heroImg} />
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
            <div>
              <h2>About This Event</h2>
              <p className={styles.about}>{ev.about}</p>
              <h2 className={styles.expectTitle}>What to Expect</h2>
              <ul className={styles.expect}>
                {ev.expect.map((x) => (
                  <li key={x}>
                    <img src={eventIcons.check} alt="" width="18.5" height="18.5" />
                    {x}
                  </li>
                ))}
              </ul>
              <a
                className={styles.register}
                href={`mailto:info@ftcci.in?subject=${encodeURIComponent(`Register interest: ${ev.title}`)}`}
              >
                Register Interest <span aria-hidden="true">→</span>
              </a>
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
              {/* TODO: link to the event brochure PDF */}
              <a className={styles.pdf} href="#download">Download PDF</a>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
