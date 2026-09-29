import styles from "./SectionTitle.module.css";

// Eyebrow (gold, uppercase) + Neue Montreal heading with a gold accent word.
export default function SectionTitle({ eyebrow, title, accent, as: Tag = "h2", light = false, className = "" }) {
  return (
    <div className={`${styles.wrap} ${className}`}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <Tag className={`${styles.title} ${light ? styles.light : ""}`}>
        {title}
        {accent && <> <span>{accent}</span></>}
      </Tag>
    </div>
  );
}
