import { useEffect, useRef, useState } from "react";
import { historyArrow, timeline } from "../data/about.js";
import styles from "./HistoryCarousel.module.css";

// "A Century of Business Leadership": scroll-snap milestone cards with arrows and a year scrubber
// that follows the slide aligned to the left edge.
export default function HistoryCarousel() {
  const trackRef = useRef(null);
  const yearsRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const onScroll = () => {
      const start = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
      const edge = track.getBoundingClientRect().left + start;
      let best = 0;
      let dist = Infinity;
      [...track.children].forEach((slide, i) => {
        const d = Math.abs(slide.getBoundingClientRect().left - edge);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setActive(best);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const years = yearsRef.current;
    const item = years.children[active];
    years.scrollTo({ left: item.offsetLeft - years.firstElementChild.offsetLeft, behavior: "smooth" });
  }, [active]);

  const goTo = (i) => {
    const track = trackRef.current;
    const slide = track.children[Math.max(0, Math.min(timeline.length - 1, i))];
    track.scrollTo({ left: slide.offsetLeft - track.firstElementChild.offsetLeft, behavior: "smooth" });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Our Legacy</p>
          <h2 className={styles.title}>
            A Century of Business <span>Leadership</span>
          </h2>
        </div>
        <div className={styles.arrows}>
          <button type="button" className={styles.prev} onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous milestone">
            <img src={historyArrow} alt="" width="50" height="50" />
          </button>
          <button type="button" onClick={() => goTo(active + 1)} disabled={active === timeline.length - 1} aria-label="Next milestone">
            <img src={historyArrow} alt="" width="50" height="50" />
          </button>
        </div>
      </div>

      <ol className={styles.track} ref={trackRef} aria-label="Milestones">
        {timeline.map((t) => (
          <li key={t.year} className={styles.slide}>
            <div className={styles.photo}>
              <img src={t.image} alt={`FTCCI, ${t.year}`} loading="lazy" />
            </div>
            <div className={styles.panel}>
              <p className={styles.year}>{t.year}</p>
              <div className={styles.copy}>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <ol className={styles.years} ref={yearsRef} aria-label="Jump to year">
        {timeline.map((t, i) => (
          <li key={t.year}>
            <button
              type="button"
              className={i === active ? styles.current : undefined}
              aria-current={i === active ? "step" : undefined}
              onClick={() => goTo(i)}
            >
              <span className={styles.yearLabel}>{t.year}</span>
              <span className={styles.dot} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
