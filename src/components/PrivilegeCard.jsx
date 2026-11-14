import { Link } from "react-router";
import Img from "./Img.jsx";
import styles from "./PrivilegeCard.module.css";

export default function PrivilegeCard({ image }) {
  return (
    <section className={styles.section} id="services" aria-labelledby="privilege-title" data-edit="home.privilegeCard">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Exclusive Benefits</p>
          <h2 id="privilege-title" className={styles.title}>FTCCI Privilege Card</h2>
          <div className={styles.cardMobile}>
            <Img media={image} alt="FTCCI Privilege Card" sizes="(min-width: 1200px) 560px, 100vw" />
          </div>
          <p className={styles.body}>
            Enjoy exclusive savings and benefits across healthcare, diagnostics, pharmacy, wellness, dining and lifestyle
            services through FTCCI's growing partner network.
          </p>
          <div className={styles.ctas}>
            <Link to="/privilege-card" className={styles.primary}>Apply Now</Link>
            <Link to="/privilege-card#benefits" className={styles.secondary}>Know More</Link>
          </div>
        </div>
        <div className={styles.cardDesktop}>
          <Img media={image} alt="FTCCI Privilege Card" sizes="(min-width: 1200px) 560px, 100vw" />
        </div>
      </div>
    </section>
  );
}
