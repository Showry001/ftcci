import { Link } from "react-router";
import { pickIcons } from "../ui/assets.js";
import styles from "./QuickActions.module.css";

export default function QuickActions({ actions }) {
  return (
    <section className={`${styles.section} mobile-only`} aria-labelledby="qa-title" data-edit="home.quickActions">
      <p className={styles.eyebrow}>Explore FTCCI Services</p>
      <h2 id="qa-title" className={styles.title}>Quick Actions</h2>
      <div className={styles.grid}>
        {actions.map((q) => (
          <Link key={q.label} to={q.href} className={styles.tile}>
            <img src={pickIcons.quickAction[q.icon]} alt="" width="24" height="24" />
            <span>{q.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
