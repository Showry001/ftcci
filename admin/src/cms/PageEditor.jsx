import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useBlocker, useNavigate, useParams } from "react-router-dom";
import { contentTypes } from "../../../shared/content.js";
import { pageViews, viewDocs } from "../../../shared/page-sections.js";
import { api, formatDateTime } from "../api.js";
import { Message, Pill } from "../ui.jsx";
import ui from "../ui.module.css";
import Fields from "./Fields.jsx";
import MediaPicker from "./MediaPicker.jsx";
import { SITE_URL } from "./types.js";
import styles from "./PageEditor.module.css";

const NS = "ftcci-editor";
const AUTOSAVE_MS = 900;
// Preview links last an hour; a fresh one is fetched well before that.
const TOKEN_REFRESH_MS = 45 * 60_000;
const devices = [
  { key: "desktop", label: "Desktop", width: 1440 },
  { key: "tablet", label: "Tablet", width: 820 },
  { key: "phone", label: "Phone", width: 390 },
];
const versionLabel = { save: "Saved", publish: "Published", restore: "Restored", import: "Imported" };
const siteOrigin = new URL(SITE_URL, window.location.href).origin;
const pick = (fields, names) => Object.fromEntries(names.map((n) => [n, fields[n]]));
// Whether any error path ("timeline.3.title") belongs to one of these fields.
const hasErrorIn = (errors, names) => Object.keys(errors ?? {}).some((path) => names.includes(path.split(".")[0]));

function previewUrl(path, token, edit = true) {
  const [pathname, hash] = path.split("#");
  const url = new URL(`${SITE_URL}${pathname}`, window.location.href);
  url.searchParams.set("preview", token);
  if (edit) url.searchParams.set("edit", "1");
  if (hash) url.hash = hash;
  return url.href;
}

// The visual page editor, like Shopify's theme editor: the real page in a frame on the right, its parts
// on the left. Click a part in either place to edit it; changes save as drafts as you type and the
// preview refreshes, and Publish puts everything changed on this page live.
export default function PageEditor() {
  const { view } = useParams();
  if (!pageViews[view]) {
    return (
      <div className={styles.missing}>
        <p>This page doesn't exist.</p>
        <Link to="/pages" className={ui.button}>Back to website pages</Link>
      </div>
    );
  }
  return <Editor key={view} view={view} />;
}

function Editor({ view }) {
  const page = pageViews[view];
  const types = viewDocs(view);
  const navigate = useNavigate();

  const [docs, setDocs] = useState(null);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [media, setMedia] = useState({});
  const [dirty, setDirtyState] = useState({});
  const [saveState, setSaveState] = useState("");
  const [saveError, setSaveError] = useState("");
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [device, setDevice] = useState("desktop");
  const [token, setToken] = useState("");
  const [previewPath, setPreviewPath] = useState(page.path);
  const [onPage, setOnPage] = useState(null);
  const [picker, setPicker] = useState(null);
  const [pane, setPane] = useState("sections");
  const [stage, setStage] = useState({ width: 0, height: 0 });

  // Refs hold the latest values for saves started by timers, messages and navigation.
  const docsRef = useRef({});
  const dataRef = useRef({});
  const dirtyRef = useRef({});
  const revisions = useRef({});
  const timers = useRef({});
  const queues = useRef({});
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const pendingFocus = useRef(null);

  const post = (message) => frameRef.current?.contentWindow?.postMessage({ ns: NS, ...message }, siteOrigin);
  const setDirty = (type, value) => {
    dirtyRef.current = { ...dirtyRef.current, [type]: value };
    setDirtyState(dirtyRef.current);
  };
  const anyDirty = () => Object.values(dirtyRef.current).some(Boolean);
  const applyDoc = useCallback((loaded) => {
    const { data: _data, media: loadedMedia, ...rest } = loaded;
    docsRef.current = { ...docsRef.current, [loaded.type]: rest };
    setDocs(docsRef.current);
    setMedia((m) => ({ ...m, ...loadedMedia }));
  }, []);
  const replaceData = (type, value) => {
    dataRef.current = { ...dataRef.current, [type]: value };
    setData(dataRef.current);
  };

  // Load every document the page shows, then one preview link that covers them all.
  useEffect(() => {
    let live = true;
    Promise.all(types.map((t) => api.get(`/content/${t}`)))
      .then(async (views) => {
        if (!live) return;
        for (const v of views) {
          applyDoc(v);
          replaceData(v.type, v.data);
        }
        const res = await api.post("/content/preview", { ids: views.map((v) => v.id) });
        if (live) setToken(res.token);
      })
      .catch((e) => live && setLoadError(e.message));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    const timer = setInterval(() => {
      api.post("/content/preview", { ids: types.map((t) => docsRef.current[t].id) }).then((res) => {
        pendingFocus.current = selected;
        setToken(res.token);
      }, () => {});
    }, TOKEN_REFRESH_MS);
    return () => clearInterval(timer);
  }, [token, selected]);

  // Messages from the preview: which parts it shows, and which part was clicked.
  useEffect(() => {
    const labels = Object.fromEntries(page.sections.map((s) => [s.id, s.label]));
    const onMessage = (e) => {
      if (e.origin !== siteOrigin || e.source !== frameRef.current?.contentWindow || e.data?.ns !== NS) return;
      if (e.data.type === "ready" && Array.isArray(e.data.sections)) {
        setOnPage(e.data.sections);
        post({ type: "labels", labels });
        if (pendingFocus.current) {
          post({ type: "focus", section: pendingFocus.current });
          pendingFocus.current = null;
        }
      }
      if (e.data.type === "select" && page.sections.some((s) => s.id === e.data.section)) {
        setSelected(e.data.section);
        setPane("sections");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The preview is drawn at the chosen device's width and scaled down to fit.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setStage({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, [Boolean(docs)]);

  // Saves run one at a time per document, a moment after the last change.
  const saveNow = async (type) => {
    if (!dirtyRef.current[type]) return docsRef.current[type];
    const sent = revisions.current[type];
    setSaveState("saving");
    try {
      const v = await api.put(`/content/doc/${docsRef.current[type].id}`, { data: dataRef.current[type] });
      applyDoc(v);
      setErrors((e) => ({ ...e, [type]: {} }));
      if (revisions.current[type] === sent) setDirty(type, false);
      setSaveState("saved");
      post({ type: "refresh" });
      return v;
    } catch (e) {
      setErrors((x) => ({ ...x, [type]: e.fields ?? {} }));
      setSaveError(e.message);
      setSaveState("error");
      throw e;
    }
  };
  const save = (type) => {
    clearTimeout(timers.current[type]);
    const run = (queues.current[type] ?? Promise.resolve()).then(() => saveNow(type));
    queues.current[type] = run.catch(() => {});
    return run;
  };
  const saveAll = async () => {
    for (const t of types) if (dirtyRef.current[t]) await save(t);
  };
  const edit = (type) => (next) => {
    revisions.current[type] = (revisions.current[type] ?? 0) + 1;
    replaceData(type, next);
    setDirty(type, true);
    setSaveState("");
    clearTimeout(timers.current[type]);
    timers.current[type] = setTimeout(() => save(type).catch(() => {}), AUTOSAVE_MS);
  };

  useEffect(() => {
    const warn = (e) => {
      if (anyDirty()) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  // Leaving with changes still waiting to save: save them first.
  const blocker = useBlocker(useCallback(({ currentLocation, nextLocation }) => anyDirty() && currentLocation.pathname !== nextLocation.pathname, []));
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    saveAll().then(() => blocker.proceed(), () => blocker.reset());
  }, [blocker.state]);

  // Videos are compressed after upload; check back until they are ready.
  const processing = Object.values(media).filter((m) => m.kind === "video" && m.status === "processing").map((m) => m.id);
  useEffect(() => {
    if (!processing.length) return;
    const timer = setInterval(() => {
      for (const mediaId of processing) {
        api.get(`/media/${mediaId}`).then((m) => m.status !== "processing" && setMedia((all) => ({ ...all, [m.id]: m })), () => {});
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [processing.join(",")]);

  const choose = (section) => {
    setSelected(section.id);
    const path = section.path ?? page.path;
    if (path !== previewPath) {
      pendingFocus.current = section.id;
      setPreviewPath(path);
    } else {
      post({ type: "focus", section: section.id });
    }
  };

  const publish = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await saveAll();
      const failed = [];
      for (const t of types) {
        const d = docsRef.current[t];
        if (d.published && !d.hasChanges) continue;
        try {
          applyDoc(await api.post(`/content/doc/${d.id}/publish`));
        } catch (e) {
          setErrors((x) => ({ ...x, [t]: e.fields ?? {} }));
          failed.push({ type: t, message: e.message, fields: e.fields ?? {} });
        }
      }
      post({ type: "refresh" });
      if (failed.length) {
        const first = failed[0];
        const section = page.sections.find((s) => s.doc === first.type && hasErrorIn(first.fields, s.fields));
        if (section) choose(section);
        setMessage({ tone: "error", text: `Not everything was published. ${first.message}` });
      } else {
        setMessage({ tone: "success", text: "Published. The website shows your changes within a minute." });
      }
    } catch (e) {
      setMessage({ tone: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const restore = async (type, version) => {
    if (!window.confirm(`Restore the version of the ${contentTypes[type].label.toLowerCase()} from ${formatDateTime(version.created_at)}? The current draft is kept in the history, and the website changes only when you publish.`)) return;
    setBusy(true);
    setMessage(null);
    try {
      if (dirtyRef.current[type]) await save(type);
      const v = await api.post(`/content/doc/${docsRef.current[type].id}/restore`, { versionId: version.id });
      applyDoc(v);
      replaceData(type, v.data);
      setDirty(type, false);
      post({ type: "refresh" });
      setMessage({ tone: "success", text: "Version restored. Publish to put it on the website." });
    } catch (e) {
      setMessage({ tone: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <div className={styles.missing}>
        <Message tone="error">{loadError}</Message>
        <Link to="/pages" className={ui.button}>Back to website pages</Link>
      </div>
    );
  }
  if (!docs || types.some((t) => !docs[t])) return <p className={styles.loading}>Loading the page…</p>;

  const toPublish = types.filter((t) => !docs[t].published || docs[t].hasChanges || dirty[t]);
  const section = page.sections.find((s) => s.id === selected);
  // On tablets and phones the preview simply fills the screen at its real width.
  const narrow = window.matchMedia("(max-width: 1023px)").matches;
  const width = narrow && stage.width ? stage.width : devices.find((d) => d.key === device).width;
  const scale = stage.width ? Math.min(1, stage.width / width) : 1;
  const status =
    saveState === "saving" ? "Saving…"
    : saveState === "error" ? `Not saved: ${saveError}`
    : anyDirty() ? "Unsaved changes"
    : saveState === "saved" ? "All changes saved"
    : "";

  return (
    <div className={styles.editor}>
      <header className={styles.bar}>
        <Link to="/pages" className={styles.exit}>
          ← <span>Website pages</span>
        </Link>
        <label className={styles.pagePicker}>
          <span className="visually-hidden">Page</span>
          <select value={view} onChange={(e) => navigate(`/pages/${e.target.value}`)}>
            {Object.entries(pageViews).map(([key, v]) => (
              <option key={key} value={key}>{v.label}</option>
            ))}
          </select>
        </label>
        <div className={styles.devices} role="group" aria-label="Preview size">
          {devices.map((d) => (
            <button key={d.key} type="button" aria-pressed={device === d.key} onClick={() => setDevice(d.key)}>
              {d.label}
            </button>
          ))}
        </div>
        <span className={styles.status} role="status">{status}</span>
        <Pill tone={toPublish.length ? "orange" : "green"}>{toPublish.length ? "Unpublished changes" : "Published"}</Pill>
        <a className={`${ui.button} ${styles.newTab}`} href={token ? previewUrl(previewPath, token, false) : undefined} target="_blank" rel="noreferrer">
          Preview ↗
        </a>
        <button type="button" className={`${ui.button} ${ui.primaryButton}`} onClick={publish} disabled={busy || !toPublish.length}>
          {busy ? "Publishing…" : "Publish"}
        </button>
      </header>

      <div className={styles.panes} role="group" aria-label="Show">
        <button type="button" aria-pressed={pane === "sections"} onClick={() => setPane("sections")}>Edit</button>
        <button type="button" aria-pressed={pane === "preview"} onClick={() => setPane("preview")}>Preview</button>
      </div>

      <div className={styles.body} data-pane={pane}>
        <aside className={styles.panel}>
          {message && (
            <div className={styles.message}>
              <Message tone={message.tone}>{message.text}</Message>
            </div>
          )}
          {section ? (
            <SectionPanel
              section={section}
              doc={section.doc && docs[section.doc]}
              data={section.doc && data[section.doc]}
              errors={(section.doc && errors[section.doc]) || {}}
              media={media}
              visible={!onPage || onPage.includes(section.id)}
              device={device}
              busy={busy}
              onBack={() => setSelected(null)}
              onChange={section.doc && edit(section.doc)}
              addMedia={(m) => setMedia((all) => ({ ...all, [m.id]: m }))}
              openPicker={setPicker}
              onRestore={(version) => restore(section.doc, version)}
            />
          ) : (
            <nav aria-label={`Parts of the ${page.label.toLowerCase()}`}>
              <h1 className={styles.panelTitle}>{page.label}</h1>
              <p className={styles.hint}>Click a part here or on the page to edit it. Changes are saved as you type; the website changes when you publish.</p>
              <ul className={styles.sections}>
                {page.sections.map((s) => {
                  const hasError = s.doc && hasErrorIn(errors[s.doc], s.fields);
                  const hidden = onPage && !onPage.includes(s.id) && !s.path;
                  return (
                    <li key={s.id}>
                      <button type="button" className={styles.sectionButton} onClick={() => choose(s)}>
                        <span>
                          {s.label}
                          {s.link && <small>Edited in its own section</small>}
                          {hidden && !s.link && <small>Not visible in this view</small>}
                        </span>
                        {hasError && <span className={styles.errorDot} aria-label="Needs attention" />}
                        <span aria-hidden="true">›</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </aside>

        <div className={styles.stage} ref={stageRef}>
          {token && (
            <div className={styles.frameWrap} style={{ width: width * scale, height: stage.height }}>
              <iframe
                ref={frameRef}
                title={`Preview of the ${page.label.toLowerCase()}`}
                src={previewUrl(previewPath, token)}
                className={styles.frame}
                style={{ width, height: stage.height / scale, transform: `scale(${scale})` }}
              />
            </div>
          )}
        </div>
      </div>

      {picker && <MediaPicker kinds={picker.kinds} onPick={picker.onPick} onClose={() => setPicker(null)} />}
    </div>
  );
}

function SectionPanel({ section, doc, data, errors, media, visible, device, busy, onBack, onChange, addMedia, openPicker, onRestore }) {
  const [showVersions, setShowVersions] = useState(false);
  return (
    <div className={styles.section}>
      <button type="button" className={styles.back} onClick={onBack}>
        ← All parts
      </button>
      <h1 className={styles.panelTitle}>{section.label}</h1>
      {section.note && <p className={styles.hint}>{section.note}</p>}
      {!visible && <p className={styles.notice}>This part isn't shown in the {device} preview. Try another size above.</p>}

      {section.link ? (
        <Link to={section.link} className={`${ui.button} ${ui.primaryButton}`}>
          Open {section.label.toLowerCase()} ↗
        </Link>
      ) : (
        <>
          <div className={styles.fields}>
            <Fields
              fields={pick(contentTypes[section.doc].fields, section.fields)}
              value={data}
              onChange={onChange}
              ctx={{ errors, media, addMedia, openPicker, hidden: section.hidden?.(data) }}
            />
          </div>
          <div className={styles.docInfo}>
            <p>
              {contentTypes[section.doc].label}
              {doc.publishedAt ? ` · last published ${formatDateTime(doc.publishedAt)}` : " · not published yet"}
            </p>
            {doc.versions.length > 0 && (
              <button type="button" className={styles.linkButton} onClick={() => setShowVersions((s) => !s)} aria-expanded={showVersions}>
                {showVersions ? "Hide earlier versions" : "Earlier versions"}
              </button>
            )}
            {showVersions && (
              <ol className={styles.versions}>
                {doc.versions.map((v) => (
                  <li key={v.id}>
                    <span>
                      <strong>{versionLabel[v.action] ?? v.action}</strong> {formatDateTime(v.created_at)}
                    </span>
                    <button type="button" className={styles.linkButton} disabled={busy} onClick={() => onRestore(v)}>
                      Restore
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </div>
  );
}
