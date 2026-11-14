import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pageViews, viewDocs } from "../../../shared/page-sections.js";
import { api, formatDateTime } from "../api.js";
import { Message, PageHead, Pill } from "../ui.jsx";
import styles from "./PagesIndex.module.css";

const icon = (name) => `${import.meta.env.BASE_URL}icons/${name}.svg`;

// The website's fixed pages. Each opens in the visual page editor.
export default function PagesIndex() {
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    api.get("/pages").then(
      (d) => live && setDocs(Object.fromEntries(d.items.map((p) => [p.type, p]))),
      (e) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, []);

  return (
    <>
      <PageHead title="Website pages" intro="Open a page to edit it on the page itself: click any part to change its text, photos and files. Changes go live when you publish." />
      {error && <Message tone="error">{error}</Message>}
      <ul className={styles.grid}>
        {Object.entries(pageViews).map(([key, view]) => {
          const shown = docs && viewDocs(key).map((t) => docs[t]).filter(Boolean);
          const waiting = shown?.some((d) => !d.published || d.hasChanges);
          const latest = shown?.map((d) => d.publishedAt).filter(Boolean).sort().at(-1);
          return (
            <li key={key} className={styles.card}>
              <div className={styles.head}>
                <h2>
                  <Link to={`/pages/${key}`}>{view.label}</Link>
                </h2>
                {shown && <Pill tone={waiting ? "orange" : "green"}>{waiting ? "Unpublished changes" : "Published"}</Pill>}
              </div>
              <p className={styles.intro}>{view.sections.filter((s) => s.doc && s.id !== "site.footer").map((s) => s.label).join(" · ")}</p>
              <p className={styles.meta}>{latest ? `Last published ${formatDateTime(latest)}` : docs && "Not published yet"}</p>
              <span className={styles.edit} aria-hidden="true">
                <img src={icon("edit")} alt="" width="20" height="20" /> Edit page
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
