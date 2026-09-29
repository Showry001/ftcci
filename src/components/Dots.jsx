import styles from "./Dots.module.css";

// Pill + dot pagination used by the Events (amber) and Venues (gold) carousels.
export default function Dots({ count, active, onSelect, tone = "amber", label }) {
  if (count <= 1) return null;
  return (
    <div className={styles.dots} role="tablist" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`Slide ${i + 1}`}
          className={`${styles.dot} ${i === active ? styles[tone] : ""}`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
