import { Link } from "react-router-dom";
import { assets } from "../data/content.js";
import styles from "./PrivilegeCard.module.css";

export default function PrivilegeCard() {
  return (
    <section className={styles.section} id="services" aria-labelledby="privilege-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Exclusive Benefits</p>
          <h2 id="privilege-title" className={styles.title}>FTCCI Privilege Card</h2>
          <div className={styles.cardMobile}>
            <img src={assets.privilegeCard} alt="FTCCI Privilege Card" loading="lazy" />
          </div>
          <p className={styles.body}>
            Enjoy exclusive savings and benefits across healthcare, diagnostics, pharmacy, wellness, dining and lifestyle
            services through FTCCI's growing partner network.
          </p>
          <div className={styles.ctas}>
            <Link to="/membership#apply" className={styles.primary}>Apply Now</Link>
            <Link to="/membership#benefits" className={styles.secondary}>Know More</Link>
          </div>
        </div>
        <div className={styles.cardDesktop}>
          <img src={assets.privilegeCard} alt="FTCCI Privilege Card" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
