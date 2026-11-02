import styles from "./KpiStrip.module.css";

export default function KpiStrip({ kpis }) {
  return (
    <section className={styles.section} aria-label="FTCCI at a glance">
      <div className={styles.row}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpi}>
            <strong>{k.value}</strong>
            <span>{k.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
