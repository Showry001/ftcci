import styles from "./PageHero.module.css";

const DEFAULT_BG = `${import.meta.env.BASE_URL}assets/pages/about-hero.png`;

// 461px banner used at the top of every inner page: photo + 84% navy tint, breadcrumb and title.
export default function PageHero({ crumb, title, image = DEFAULT_BG }) {
  return (
    <section className={styles.hero} data-no-reveal>
      <img className={styles.bg} src={image} alt="" aria-hidden="true" />
      <div className={styles.tint} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.crumb}>{crumb}</p>
        <h1 className={styles.title}>{title}</h1>
      </div>
    </section>
  );
}
