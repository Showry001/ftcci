import { useLoaderData } from "react-router";
import PageHero from "../components/common/PageHero.jsx";
import SubNav from "../components/common/SubNav.jsx";
import Img from "../components/Img.jsx";
import { list } from "../lib/content.server.js";
import { subNav } from "../ui/assets.js";
import styles from "./PublicationsPage.module.css";

// Section headings and anchors, in page order (anchors match the section tabs).
const SECTIONS = [
  { key: "publications", id: "publications", title: "Publications" },
  { key: "activity", id: "activity-reports", title: "FTCCI", accent: "Activity Reports" },
  { key: "annual", id: "annual-reports", title: "FTCCI", accent: "Annual Reports" },
  { key: "research", id: "research", title: "Research and", accent: "Publications" },
];

export async function loader() {
  const { items } = await list("publication", { limit: 100 });
  return { sections: SECTIONS.map((s) => ({ ...s, items: items.filter((p) => p.section === s.key) })).filter((s) => s.items.length) };
}

export const meta = () => [
  { title: "Publications – FTCCI" },
  { name: "description", content: "FTCCI publications, activity reports, annual reports and research studies to download." },
];

export default function PublicationsPage() {
  const { sections } = useLoaderData();
  return (
    <>
      <PageHero crumb="Knowledge > Publications" title="Publications" />
      <SubNav items={subNav.publications} label="Publication types" mobile />
      <div className={styles.page}>
        <div className="container">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-title`}>
              <h2 id={`${s.id}-title`}>
                {s.title}
                {s.accent && <> <span className="accent">{s.accent}</span></>}
              </h2>
              <ul className={styles.grid}>
                {s.items.map((it) => (
                  <li key={it.slug}>
                    <a className={styles.card} href={it.file?.url} download target="_blank" rel="noreferrer">
                      <span className={styles.cover}>
                        <Img className={styles.fit} media={it.cover} alt="" sizes="280px" />
                      </span>
                      <span className={styles.body}>
                        <span className={styles.meta}>{it.meta}</span>
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
