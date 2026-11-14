import { useEffect, useRef } from "react";
import styles from "./KpiStrip.module.css";

const DURATION_MS = 1800;
const NUMBER = /^(\D*)(\d[\d,]*)(.*)$/;

// Rolls a figure like "3,000+" up from zero the first time it scrolls into view. The server sends
// the final value, and it stays as is for people who ask for reduced motion.
function RollingNumber({ value }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const parts = NUMBER.exec(value);
    if (!parts || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, before, digits, after] = parts;
    const target = Number(digits.replace(/,/g, ""));
    const format = (n) => `${before}${digits.includes(",") ? n.toLocaleString("en-IN") : n}${after}`;

    let frame;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          // Ease out: fast at first, settling on the final figure.
          el.textContent = format(Math.round(target * (1 - (1 - t) ** 4)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        el.textContent = format(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [value]);

  // Screen readers get the real figure, not the numbers rolling past.
  return (
    <strong>
      <span className="visually-hidden">{value}</span>
      <span ref={ref} aria-hidden="true">{value}</span>
    </strong>
  );
}

export default function KpiStrip({ kpis }) {
  return (
    <section className={styles.section} aria-label="FTCCI at a glance" data-edit="home.kpis">
      <div className={styles.row}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpi}>
            <RollingNumber value={k.value} />
            <span>{k.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
