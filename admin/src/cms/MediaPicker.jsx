import { useEffect, useRef, useState } from "react";
import { api, query } from "../api.js";
import { Message, Pagination, SearchBox } from "../ui.jsx";
import MediaThumb, { mediaKindLabel } from "./MediaThumb.jsx";
import styles from "./Media.module.css";

// Lets staff reuse a file that is already in the media library. Only the kinds the field accepts are listed.
export default function MediaPicker({ kinds, onPick, onClose }) {
  const dialog = useRef(null);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => dialog.current.showModal(), []);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let live = true;
    setError("");
    api.get(`/media${query({ kind: kinds.join(","), q, page })}`).then(
      (d) => live && setData(d),
      (e) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [kinds, q, page]);

  const what = kinds.map((k) => (k === "pdf" ? "PDFs" : `${k}s`)).join(" and ");

  return (
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="media-picker-title" onClose={onClose}>
      <div className={styles.dialogHead}>
        <h2 id="media-picker-title">Choose from the media library</h2>
        <button type="button" className={styles.close} onClick={() => dialog.current.close()} aria-label="Close">✕</button>
      </div>
      <p className={styles.dialogIntro}>Showing {what}. Pick one to use it here.</p>
      <div className={styles.dialogFilters}>
        <SearchBox label="Search the media library" value={search} onChange={setSearch} />
      </div>
      {error && <Message tone="error">{error}</Message>}
      <div className={styles.grid}>
        {data?.items.map((m) => (
          <button
            key={m.id}
            type="button"
            className={styles.card}
            onClick={() => {
              onPick(m);
              dialog.current.close();
            }}
          >
            <MediaThumb m={m} sizes="200px" />
            <span className={styles.cardTitle}>{m.title || m.name}</span>
            <span className={styles.cardKind}>
              {mediaKindLabel(m)}
              {m.kind === "video" && m.status !== "ready" ? (m.status === "failed" ? " · failed" : " · processing") : ""}
            </span>
          </button>
        ))}
      </div>
      {data && data.items.length === 0 && <p className={styles.empty}>{q ? "Nothing matches this search." : `There are no ${what} in the library yet. Close this and upload one.`}</p>}
      {!data && !error && <p className={styles.empty}>Loading…</p>}
      {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />}
    </dialog>
  );
}
