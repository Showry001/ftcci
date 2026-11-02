import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { contentTypes } from "../../../shared/content.js";
import { api, formatDateTime } from "../api.js";
import { Message, PageHead, Pill } from "../ui.jsx";
import { pageTypes, stateOf } from "./types.js";
import styles from "./PagesIndex.module.css";

const icon = (name) => `${import.meta.env.BASE_URL}icons/${name}.svg`;

// The fixed pages and blocks of the website, each edited as one document.
export default function PagesIndex() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    api.get("/pages").then(
      (d) => live && setItems(Object.fromEntries(d.items.map((p) => [p.type, p]))),
      (e) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, []);

  return (
    <>
      <PageHead title="Website pages" intro="Text, photos and files on the fixed pages of the website. Changes go live when you publish them." />
      {error && <Message tone="error">{error}</Message>}
      <ul className={styles.grid}>
        {Object.entries(pageTypes).map(([type, meta]) => {
          const doc = items?.[type];
          const state = doc ? stateOf(doc) : null;
          return (
            <li key={type} className={styles.card}>
              <div className={styles.head}>
                <h2>
                  <Link to={`/pages/${type}`}>{contentTypes[type].label}</Link>
                </h2>
                {state && <Pill tone={state.tone}>{state.label}</Pill>}
              </div>
              <p className={styles.intro}>{meta.intro}</p>
              <p className={styles.meta}>
                {doc?.publishAt
                  ? `Changes publish ${formatDateTime(doc.publishAt)}`
                  : doc?.published && doc.hasChanges
                    ? "Has changes not published yet"
                    : doc?.publishedAt
                      ? `Published ${formatDateTime(doc.publishedAt)}`
                      : items && "Not published yet"}
              </p>
              <span className={styles.edit} aria-hidden="true">
                <img src={icon("edit")} alt="" width="20" height="20" /> Edit
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
