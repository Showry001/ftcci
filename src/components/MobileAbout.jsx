import { Link } from "react-router-dom";
import Arrow from "./Arrow.jsx";
import styles from "./MobileAbout.module.css";

export default function MobileAbout() {
  return (
    <section className={`${styles.section} mobile-only`} id="about-mobile" aria-labelledby="m-about-title">
      <h2 id="m-about-title" className={styles.title}>A Century of Empowering Business</h2>
      <p className={styles.body}>
        Established in 1917, FTCCI has represented and supported trade and industry for more than a century, working
        with businesses and government to strengthen Telangana's economic development.
      </p>
      <div className={styles.cards}>
        <article className={styles.card}>
          <h3>Vision</h3>
          <p>A globally competitive, innovative and sustainable business ecosystem for Telangana.</p>
        </article>
        <article className={styles.card}>
          <h3>Mission</h3>
          <p>Empowering businesses through advocacy, knowledge, networking and strategic collaboration.</p>
        </article>
      </div>
      <Link to="/about" className={styles.btn}>
        About FTCCI <Arrow tone="navy" />
      </Link>
    </section>
  );
}
