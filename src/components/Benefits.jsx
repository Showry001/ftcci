import { assets, benefits } from "../data/content.js";
import styles from "./Benefits.module.css";

export default function Benefits() {
  return (
    <section className={`${styles.section} desktop-only`} id="membership" aria-labelledby="benefits-title">
      <div className={styles.bg} aria-hidden="true">
        <img src={assets.benefitsBg} alt="" />
      </div>
      <div className={styles.gradient} aria-hidden="true" />
      <div className={styles.inner}>
        <figure className={styles.media}>
          <img src={assets.businessSummit} alt="FTCCI leaders at the Business Summit" loading="lazy" />
          <figcaption className={styles.badge}>
            <span className={styles.badgeEyebrow}>HYDERABAD CHAMBER OF COMMERCE</span>
            <span className={styles.badgeTitle}>BUSINESS SUMMIT 2024</span>
            <span className={styles.badgeSub}>Building Partnerships, Driving Growth</span>
          </figcaption>
        </figure>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>JOIN OUR NETWORK</p>
          <h2 id="benefits-title" className={styles.title}>Member Benefits</h2>
          <p className={styles.lead}>Be known as a leader in Telangana business with the network and resources to succeed.</p>
          <ul className={styles.grid}>
            {benefits.map((b) => (
              <li key={b.label} className={styles.item}>
                <span className={styles.iconTile}>
                  <img src={b.icon} alt="" width="15.12" height="15.12" />
                </span>
                {b.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
