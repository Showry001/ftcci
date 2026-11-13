import { useEffect, useState } from "react";
import { api, formatDateTime } from "../api.js";
import { stateOf } from "../cms/types.js";
import MediaThumb from "../cms/MediaThumb.jsx";
import { Message, PageHead, Pill } from "../ui.jsx";
import ui from "../ui.module.css";
import styles from "./Bin.module.css";

// Deleted content and files (Super Admins only). Restoring puts an item back as it was.
export default function Bin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => api.get("/bin").then(setData, (e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  async function restore(path, confirm, done) {
    if (!window.confirm(confirm)) return;
    setError("");
    setNotice("");
    try {
      await api.post(path);
      setNotice(done);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <PageHead title="Bin" intro="Items and files staff have deleted. Nothing here is on the website. Restore one to put it back exactly as it was." />
      {error && <Message tone="error">{error}</Message>}
      {notice && <Message tone="success">{notice}</Message>}

      <h2 className={styles.heading}>Content</h2>
      <div className={`${ui.card} ${styles.card}`}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Before it was deleted</th>
              <th scope="col">Deleted</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.documents.map((d) => {
              const state = stateOf(d);
              return (
                <tr key={d.id}>
                  <td data-label="Item"><span className={ui.primary}>{d.label}</span></td>
                  <td data-label="Before it was deleted"><Pill tone={state.tone}>{state.label}</Pill></td>
                  <td data-label="Deleted">
                    <span>{formatDateTime(d.deleted_at)}</span>
                    {d.deleted_by && <span className={ui.secondary}>by {d.deleted_by}</span>}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={ui.view}
                      onClick={() =>
                        restore(
                          `/bin/documents/${d.id}/restore`,
                          d.status === "draft" ? `Restore ${d.label} as a draft?` : `Restore ${d.label}? It goes back on the website straight away, as it was.`,
                          `${d.label} is restored.`,
                        )
                      }
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data && data.documents.length === 0 && <p className={ui.empty}>No deleted content.</p>}
        {!data && !error && <p className={ui.empty}>Loading…</p>}
      </div>

      <h2 className={styles.heading}>Files</h2>
      <div className={`${ui.card} ${styles.card}`}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">Deleted</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.media.map((m) => (
              <tr key={m.id}>
                <td data-label="File">
                  <div className={styles.file}>
                    <MediaThumb m={m} sizes="96px" className={styles.thumb} />
                    <span className={ui.primary}>{m.title || m.name}</span>
                  </div>
                </td>
                <td data-label="Deleted">
                  <span>{formatDateTime(m.deletedAt)}</span>
                  {m.deletedBy && <span className={ui.secondary}>by {m.deletedBy}</span>}
                </td>
                <td>
                  <button type="button" className={ui.view} onClick={() => restore(`/bin/media/${m.id}/restore`, `Restore ${m.title || m.name} to the media library?`, `${m.title || m.name} is back in the media library.`)}>
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.media.length === 0 && <p className={ui.empty}>No deleted files.</p>}
      </div>
    </>
  );
}
