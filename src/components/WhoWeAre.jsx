import { assets } from "../data/content.js";
import styles from "./WhoWeAre.module.css";

export default function WhoWeAre() {
  return (
    <section className={styles.section} id="about" aria-labelledby="who-title">
      <img className={styles.bg} src={assets.whoWeAreBg} alt="" aria-hidden="true" />
      <div className={styles.tint} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Who We Are</p>
          <h2 id="who-title" className={styles.title}>
            A Century of Standing Up for <span>Telangana's Enterprise.</span>
          </h2>
          <p className={styles.body}>
            Established in 1917, FTCCI is an apex chamber representing trade and industry across Telangana. It brings
            businesses, industry associations and government together through advocacy, knowledge, networking and
            collaboration.
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
        </div>
        <figure className={styles.media}>
          <img src={assets.membersNetworking} alt="FTCCI members networking at a chamber event" loading="lazy" />
          <figcaption className={styles.quote}>
            <span className={styles.quoteLabel}>Member Voice</span>
            <blockquote>
              FTCCI gives businesses a stronger platform to connect, collaborate, and engage with industry and government.
            </blockquote>
            <cite>FTCCI Member | Telangana</cite>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
