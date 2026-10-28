import { Link } from "react-router-dom";
import { assets, venueHighlights, venues } from "../data/content.js";
import useMarquee from "./useMarquee.js";
import CroppedImage from "./CroppedImage.jsx";
import Dots from "./Dots.jsx";
import styles from "./Venues.module.css";

export default function Venues() {
  const m = useMarquee(venues.length);
  return (
    <section className={`${styles.section} desktop-only`} id="venues" aria-labelledby="venues-title">
      <div className="container">
        <div className={styles.top}>
          <div className={styles.copy}>
            <h2 id="venues-title" className={styles.title}>
              The Right Space for Your Next <span>Business Event</span>
            </h2>
            <p className={styles.lead}>
              From conferences and seminars to meetings, exhibitions, and industry forums, FTCCI offers professional
              venues designed to host impactful business gatherings.
            </p>
            <ul className={styles.list}>
              {venueHighlights.map((h, i) => (
                <li key={h}>
                  <img src={i === 0 ? assets.venueCheckFirst : assets.venueCheck} alt="" width="20" height="20" />
                  {h}
                </li>
              ))}
            </ul>
            <Link to="/services#hall-booking" className={styles.cta}>Book a Hall&nbsp;&nbsp;→</Link>
          </div>
          <img className={styles.featured} src={assets.venueFeatured} alt="K.L.N. Prasad Auditorium" loading="lazy" />
        </div>

        <div className={styles.track} ref={m.trackRef}>
          <div className={styles.strip} ref={m.stripRef}>
            {[...venues, ...venues].map((v, i) => (
              <article key={i} className={styles.card} aria-hidden={i >= venues.length || undefined}>
                <CroppedImage
                  src={v.image}
                  crop={v.crop}
                  alt={v.name}
                  className={styles.photo}
                  style={v.crop?.box ? { height: v.crop.box } : undefined}
                />
                <div className={styles.caption}>
                  <h3>{v.name}</h3>
                  <p>{v.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <Dots count={m.pages} active={m.page} onSelect={m.goTo} tone="gold" label="Venue slides" />
      </div>
    </section>
  );
}
