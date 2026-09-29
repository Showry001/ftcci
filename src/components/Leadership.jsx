import { leaders } from "../data/content.js";
import CroppedImage from "./CroppedImage.jsx";
import styles from "./Leadership.module.css";

export default function Leadership() {
  return (
    <section className={styles.section} aria-labelledby="leadership-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro}>
          <h2 id="leadership-title" className={styles.title}>
            FTCCI <span>Leadership</span>
          </h2>
          <p className={styles.body}>
            Meet the leadership team steering FTCCI towards stronger industry collaboration, business growth, and a more
            prosperous Telangana.
          </p>
        </div>
        <ul className={styles.cards}>
          {leaders.map((l, i) => (
            <li key={l.name} className={`${styles.card} ${i === 1 ? styles.raised : ""}`}>
              <CroppedImage src={l.image} crop={l.crop} alt={`Portrait of ${l.name}`} className={styles.photo} />
              <div className={styles.caption}>
                <div className={styles.captionInner}>
                  <h3>{l.name}</h3>
                  <p>{l.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
