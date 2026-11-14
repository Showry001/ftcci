import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { viewForDoc } from "../../../shared/page-sections.js";
import { api, formatDateTime, query } from "../api.js";
import { Message, PageHead, Pagination, SearchBox, Select } from "../ui.jsx";
import ui from "../ui.module.css";
import { fileSize, uploadMedia } from "./media.js";
import MediaThumb, { mediaKindLabel } from "./MediaThumb.jsx";
import { collectionTypes, mediaTabs, typeLabel } from "./types.js";
import styles from "./Media.module.css";

const icon = (name) => `${import.meta.env.BASE_URL}icons/${name}.svg`;
const kinds = [
  { value: "", label: "All types" },
  { value: "image", label: "Images" },
  { value: "pdf", label: "PDFs" },
  { value: "video", label: "Videos" },
];
const editorPath = (d) => (collectionTypes[d.type] ? `/content/${d.type}/${d.id}` : `/pages/${viewForDoc(d.type)}`);

// Every image, PDF and video on the website (Figma "Manage Media", 2538:44446).
export default function MediaLibrary() {
  const [params, setParams] = useSearchParams();
  const used = params.get("used") ?? "";
  const kind = params.get("kind") ?? "";
  const q = params.get("q") ?? "";
  const page = Number(params.get("page")) || 1;
  const [search, setSearch] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search, page: "" }), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let live = true;
    setError("");
    api.get(`/media${query({ used, kind, q, page })}`).then(
      (d) => live && setData(d),
      (e) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [used, kind, q, page, reload]);

  function update(next) {
    const merged = { used, kind, q, page: String(page), ...next };
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v && v !== "1")));
  }

  return (
    <>
      <PageHead title="Media Library" intro="Upload, organise and manage images and files for your website. Files used on a page can't be deleted until they are replaced there." />
      <nav className={styles.tabs} aria-label="Show files used on">
        {mediaTabs.map((t) => (
          <button key={t.label} type="button" aria-pressed={used === t.used} onClick={() => update({ used: t.used, page: "" })}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className={styles.layout}>
        <section className={styles.panel} aria-label="Files">
          <div className={ui.filters}>
            <SearchBox label="Search files" value={search} onChange={setSearch} />
            <Select label="Type" value={kind} onChange={(v) => update({ kind: v, page: "" })} options={kinds} />
          </div>
          {error && <Message tone="error">{error}</Message>}
          <div className={styles.grid}>
            {data?.items.map((m) => (
              <div key={m.id} className={styles.card} aria-current={selected?.id === m.id || undefined}>
                <button type="button" className={styles.cardSelect} onClick={() => setSelected(m)} aria-label={`Open ${m.title || m.name}`}>
                  <MediaThumb m={m} />
                </button>
                <span className={styles.cardTitle}>{m.title || m.name}</span>
                <span className={styles.cardKind}>
                  {mediaKindLabel(m)} · {m.usedIn ? `Used in ${m.usedIn}` : "Not used"}
                </span>
                {m.url && (
                  <a className={styles.download} href={m.url} download={m.name} aria-label={`Download ${m.title || m.name}`}>
                    <img src={icon("download")} alt="" width="20" height="20" />
                  </a>
                )}
              </div>
            ))}
          </div>
          {data && data.items.length === 0 && <p className={styles.empty}>{q || kind || used ? "No files match these filters." : "The library is empty. Upload the first file."}</p>}
          {!data && !error && <p className={styles.empty}>Loading…</p>}
          {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => update({ page: String(p) })} />}
        </section>

        <aside className={styles.side}>
          <Uploader
            onDone={(m) => {
              setSelected(m);
              setReload((r) => r + 1);
            }}
          />
          {selected && (
            <Details
              key={selected.id}
              id={selected.id}
              onChange={() => setReload((r) => r + 1)}
              onDeleted={() => {
                setSelected(null);
                setReload((r) => r + 1);
              }}
            />
          )}
        </aside>
      </div>
    </>
  );
}

function Uploader({ onDone }) {
  const input = useRef(null);
  const [progress, setProgress] = useState(null);
  const [problem, setProblem] = useState("");
  const [done, setDone] = useState("");

  async function upload(files) {
    setProblem("");
    setDone("");
    const failed = [];
    let last = null;
    for (const [i, file] of files.entries()) {
      setProgress({ index: i + 1, count: files.length, percent: 0 });
      try {
        last = await uploadMedia(file, { onProgress: (percent) => setProgress({ index: i + 1, count: files.length, percent }) });
      } catch (e) {
        failed.push(`${file.name}: ${e.message}`);
      }
    }
    setProgress(null);
    input.current.value = "";
    if (failed.length) setProblem(failed.join(" "));
    const uploaded = files.length - failed.length;
    if (uploaded) {
      setDone(`${uploaded} file${uploaded > 1 ? "s" : ""} added.${last.kind === "video" ? " Videos are compressed in the background; this takes a few minutes." : ""}`);
      onDone(last);
    }
  }

  return (
    <section className={styles.sideCard} aria-labelledby="upload-title">
      <h2 id="upload-title" className={styles.sideTitle}>
        <img src={icon("monitor")} alt="" width="20" height="16" /> Upload files
      </h2>
      <div className={styles.sideBody}>
        <div className={styles.drop}>
          <img src={icon("upload")} alt="" width="22" height="17" />
          <span>Upload images, PDFs or videos</span>
          <small>Images: JPG, PNG or WebP up to 20 MB (1200 px wide or more looks best). PDFs up to 100 MB. Videos: MP4, MOV or WebM up to 200 MB.</small>
          <button type="button" className={styles.choose} onClick={() => input.current.click()} disabled={progress !== null}>
            Choose files
          </button>
          <input
            ref={input}
            type="file"
            multiple
            hidden
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf,video/mp4,video/quicktime,video/webm"
            onChange={(e) => e.target.files.length && upload([...e.target.files])}
          />
        </div>
        {progress && (
          <p className={styles.progress} role="status">
            Uploading {progress.count > 1 ? `${progress.index} of ${progress.count}` : ""}… {progress.percent}%
            <progress max="100" value={progress.percent} />
          </p>
        )}
        {problem && <Message tone="error">{problem}</Message>}
        {done && <Message tone="success">{done}</Message>}
      </div>
    </section>
  );
}

function Details({ id, onChange, onDeleted }) {
  const [m, setM] = useState(null);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let live = true;
    api.get(`/media/${id}`).then(
      (d) => {
        if (!live) return;
        setM(d);
        setTitle(d.title ?? "");
        setAlt(d.alt ?? "");
      },
      (e) => live && setMessage({ tone: "error", text: e.message }),
    );
    return () => {
      live = false;
    };
  }, [id]);

  if (!m) return message ? <Message tone="error">{message.text}</Message> : null;

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const next = await api.patch(`/media/${id}`, m.kind === "image" ? { title, alt } : { title });
      setM((old) => ({ ...old, ...next }));
      setMessage({ tone: "success", text: "Saved. Published pages show the new text within a minute." });
      onChange();
    } catch (err) {
      setMessage({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${m.title || m.name}”? It moves to the bin, where a Super Admin can restore it.`)) return;
    setBusy(true);
    setMessage(null);
    try {
      await api.delete(`/media/${id}`);
      onDeleted();
    } catch (err) {
      setMessage({ tone: "error", text: err.message });
      setBusy(false);
    }
  }

  return (
    <section className={styles.sideCard} aria-labelledby="details-title">
      <h2 id="details-title" className={styles.sideTitle}>
        <img src={icon("monitor")} alt="" width="20" height="16" /> Selected file
      </h2>
      <form className={styles.sideBody} onSubmit={save}>
        {m.kind === "video" && m.url ? (
          <video className={styles.preview} src={m.url} poster={m.poster ?? undefined} controls preload="metadata" />
        ) : (
          <MediaThumb m={m} sizes="440px" className={styles.preview} />
        )}
        <dl className={styles.facts}>
          <div>
            <dt>File</dt>
            <dd>{m.name}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>
              {mediaKindLabel(m)} · {fileSize(m.bytes)}
              {m.width ? ` · ${m.width} × ${m.height} px` : ""}
            </dd>
          </div>
          <div>
            <dt>Uploaded</dt>
            <dd>{formatDateTime(m.createdAt)}</dd>
          </div>
          {m.kind === "video" && m.status !== "ready" && (
            <div>
              <dt>Status</dt>
              <dd>{m.status === "failed" ? `Processing failed${m.error ? `: ${m.error}` : ""}. Upload the video again.` : "Being compressed. It can be used once this finishes."}</dd>
            </div>
          )}
        </dl>
        <label className={styles.field}>
          <span>Title</span>
          <input value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="Enter media title" />
          <small>Helps you find the file here. Shown as the link text for downloads.</small>
        </label>
        {m.kind === "image" && (
          <label className={styles.field}>
            <span>Alt text</span>
            <textarea value={alt} maxLength={300} rows={3} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the photo" />
            <small>Describe the photo for people who can't see it. Leave empty only for decorative images.</small>
          </label>
        )}
        <div className={styles.actions}>
          <button type="submit" className={`${ui.button} ${ui.primaryButton}`} disabled={busy}>
            Save
          </button>
          {m.url && (
            <a className={ui.button} href={m.url} target="_blank" rel="noreferrer">
              Open file
            </a>
          )}
          <button type="button" className={styles.trash} onClick={remove} disabled={busy || m.usedBy.length > 0} aria-label="Delete file" title={m.usedBy.length ? "Replace this file where it is used before deleting it" : "Delete file"}>
            <img src={icon("delete")} alt="" width="24" height="24" />
          </button>
        </div>
        {message && <Message tone={message.tone}>{message.text}</Message>}
        <div className={styles.usage}>
          <h3>Used in</h3>
          {m.usedBy.length ? (
            <ul>
              {m.usedBy.map((d) => (
                <li key={d.id}>
                  <Link to={editorPath(d)}>{d.title}</Link> <span>{typeLabel(d.type)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Not used anywhere. It can be deleted.</p>
          )}
        </div>
      </form>
    </section>
  );
}
