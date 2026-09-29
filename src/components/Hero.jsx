import { assets } from "../data/content.js";
import { Link } from "react-router-dom";
import Arrow from "./Arrow.jsx";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title" data-no-reveal>
      {/* Figma fill: VIDEO + 40% black overlay */}
      <video className={styles.video} src={assets.heroVideo} autoPlay muted loop playsInline aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <h1 id="hero-title" className={styles.title}>
          Empowering Industries. <span>Shaping Telangana's Future.</span>
        </h1>
        <div className={styles.ctas}>
          <Link to="/membership" className={`${styles.btn} ${styles.btnGold}`}>
            Become a Member <Arrow tone="navy" />
          </Link>
          <Link to="/about" className={`${styles.btn} ${styles.btnNavy}`}>
            Explore FTCCI <Arrow tone="white" />
          </Link>
        </div>
      </div>
    </section>
  );
}
