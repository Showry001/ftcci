import PageHero from "../components/common/PageHero.jsx";
import SubNav from "../components/common/SubNav.jsx";
import { publicationSections, publicationsSubNav } from "../data/publications.js";
import styles from "./PublicationsPage.module.css";

function Cover({ item }) {
  if (!item.crop) return <img className={styles.fit} src={item.image} alt="" loading="lazy" />;
  const [h, top] = item.crop;
  return <img className={styles.cropped} style={{ height: `${h}%`, top: `${top}%` }} src={item.image} alt="" loading="lazy" />;
}

export default function PublicationsPage() {
  return (
    <>
      <PageHero crumb="Knowledge > Publications" title="Publications" />
      <SubNav items={publicationsSubNav} label="Publication types" />
      <div className={styles.page}>
        <div className="container">
          {publicationSections.map((s) => (
            <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-title`}>
              <h2 id={`${s.id}-title`}>{s.title}</h2>
              <ul className={styles.grid}>
                {s.items.map((it, i) => (
                  <li key={i}>
                    <a
                      className={styles.card}
                      href={it.href || "#download"}
                      {...(it.href ? { target: "_blank", rel: "noreferrer" } : {})}
                    >
                      <span className={styles.cover}>
                        <Cover item={it} />
                      </span>
                      <span className={styles.body}>
                        <time>{it.date}</time>
                        <strong>{it.title}</strong>
                        <span className={styles.dl}>Download PDF --&gt;</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
