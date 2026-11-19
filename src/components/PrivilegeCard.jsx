import { Link } from "react-router";
import Img from "./Img.jsx";
import styles from "./PrivilegeCard.module.css";

// Heading, text and buttons come from the page editor (home page, Privilege Card). A button shows only
// when it has both a label and a link.
export default function PrivilegeCard({ image, copy, primary, secondary }) {
  return (
    <section className={styles.section} id="services" aria-labelledby="privilege-title" data-edit="home.privilegeCard">
      <div className={styles.inner}>
        <div className={styles.copy}>
          {copy?.eyebrow && <p className={styles.eyebrow}>{copy.eyebrow}</p>}
          <h2 id="privilege-title" className={styles.title}>{copy?.title}</h2>
          <div className={styles.cardMobile}>
            <Img media={image} alt="FTCCI Privilege Card" sizes="(min-width: 1200px) 560px, 100vw" />
          </div>
          {copy?.text && <p className={styles.body}>{copy.text}</p>}
          {(primary?.label && primary.href) || (secondary?.label && secondary.href) ? (
            <div className={styles.ctas}>
              {primary?.label && primary.href && <Link to={primary.href} className={styles.primary}>{primary.label}</Link>}
              {secondary?.label && secondary.href && <Link to={secondary.href} className={styles.secondary}>{secondary.label}</Link>}
            </div>
          ) : null}
        </div>
        <div className={styles.cardDesktop}>
          <Img media={image} alt="FTCCI Privilege Card" sizes="(min-width: 1200px) 560px, 100vw" />
        </div>
      </div>
    </section>
  );
}
