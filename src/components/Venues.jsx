import { useState } from "react";
import { Link } from "react-router";
import { assets } from "../ui/assets.js";
import Img, { CoverImage } from "./Img.jsx";
import Dots from "./Dots.jsx";
import styles from "./Venues.module.css";

const PER_VIEW = 3;

export default function Venues({ highlights, featured, venues }) {
  // Three halls at a time. The strip stays still; the dots move it to the next three.
  const pages = Math.ceil(venues.length / PER_VIEW);
  const [page, setPage] = useState(0);
  const current = Math.min(page, Math.max(0, pages - 1));
  const first = Math.min(current * PER_VIEW, Math.max(0, venues.length - PER_VIEW));
  return (
    <section className={`${styles.section} desktop-only`} id="venues" aria-labelledby="venues-title" data-edit="home.halls">
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
              {highlights.map((h, i) => (
                <li key={h}>
                  <img src={i === 0 ? assets.venueCheckFirst : assets.venueCheck} alt="" width="20" height="20" />
                  {h}
                </li>
              ))}
            </ul>
            <Link to="/services#hall-booking" className={styles.cta}>Book a Hall&nbsp;&nbsp;→</Link>
          </div>
          <Img className={styles.featured} media={featured} sizes="(min-width: 1200px) 600px, 100vw" />
        </div>

        <div className={styles.track}>
          <div className={styles.strip} style={{ "--first": first }}>
            {venues.map((v, i) => (
              <article key={i} className={styles.card}>
                <CoverImage media={v.image} alt={v.name} className={styles.photo} sizes="300px" />
                <div className={styles.caption}>
                  <h3>{v.name}</h3>
                  <p>{v.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <Dots count={pages} active={current} onSelect={setPage} tone="gold" label="Venue slides" />
      </div>
    </section>
  );
}
