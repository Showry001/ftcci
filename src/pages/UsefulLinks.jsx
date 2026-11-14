import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import PageHero from "../components/common/PageHero.jsx";
import { single } from "../lib/content.server.js";
import { icons } from "../ui/assets.js";
import styles from "./UsefulLinks.module.css";

export async function loader({ request }) {
  return { linkDirectory: (await single("knowledge", request)).linkDirectory };
}

export const meta = () => [
  { title: "Useful Links – FTCCI" },
  { name: "description", content: "Government, regulatory, trade and industry websites useful to FTCCI members." },
];

export default function UsefulLinks() {
  const { linkDirectory } = useLoaderData();
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return linkDirectory;
    return linkDirectory
      .map((g) => ({ ...g, links: g.links.filter((l) => `${l.title} ${l.text} ${g.group}`.toLowerCase().includes(term)) }))
      .filter((g) => g.links.length);
  }, [q, linkDirectory]);

  return (
    <>
      <PageHero crumb="Knowledge > Links" title="Useful Links" />
      <section className={styles.section} data-edit="knowledge.linkDirectory">
        <div className="container">
          <label className={styles.search}>
            <img src={icons.knowledge.search} alt="" width="20" height="20" />
            <span className="visually-hidden">Search links</span>
            <input type="search" placeholder="Search Links" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className={styles.groups}>
            {groups.length === 0 && <p className={styles.empty}>No links match “{q}”.</p>}
            {groups.map((g) => (
              <section key={g.group} className={styles.group} aria-labelledby={`g-${g.group}`}>
                <h2 id={`g-${g.group}`}>{g.group}</h2>
                <ul className={styles.cards}>
                  {g.links.map((l) => (
                    <li key={l.title}>
                      <a href={l.href} target="_blank" rel="noreferrer" className={styles.card}>
                        <span className={styles.cardHead}>
                          <strong>{l.title}</strong>
                          <img src={icons.knowledge.upRightSm} alt="" width="12" height="12" />
                        </span>
                        {l.text && <span className={styles.cardText}>{l.text}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
