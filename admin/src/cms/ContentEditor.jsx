import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useBlocker, useLocation, useNavigate, useParams } from "react-router-dom";
import { contentTypes } from "../../../shared/content.js";
import { api, formatDateTime } from "../api.js";
import NotFound from "../pages/NotFound.jsx";
import { Message, PageHead, Pill } from "../ui.jsx";
import ui from "../ui.module.css";
import Fields from "./Fields.jsx";
import MediaPicker from "./MediaPicker.jsx";
import PreviewCard from "./PreviewCard.jsx";
import { SITE_URL, collectionTypes, pageTypes, singular, stateOf } from "./types.js";
import styles from "./Editor.module.css";

const icon = (name) => `${import.meta.env.BASE_URL}icons/${name}.svg`;
const AUTOSAVE_MS = 2500;
const VERSIONS_SHOWN = 6;
const versionLabel = { save: "Saved", publish: "Published", restore: "Restored", import: "Imported" };
// A datetime-local value (the browser's own time zone) for an ISO time.
const localInput = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

// Edits one item of a collection (/content/event/12, /content/event/new) or one page (/pages/about).
export default function ContentEditor({ page = false }) {
  const { type, id } = useParams();
  const meta = page ? pageTypes[type] : collectionTypes[type];
  if (!meta || (id !== undefined && !/^\d+$/.test(id))) return <NotFound />;
  return <Editor key={`${type}/${id ?? "new"}`} type={type} id={id ? Number(id) : null} page={page} meta={meta} />;
}

function Editor({ type, id, page, meta }) {
  const spec = contentTypes[type];
  const isNew = !page && id === null;
  const navigate = useNavigate();
  const location = useLocation();
  const listPath = page ? "/pages" : `/content/${type}`;

  const [doc, setDoc] = useState(null);
  const [data, setData] = useState(isNew ? {} : null);
  const [slug, setSlug] = useState("");
  const [media, setMedia] = useState({});
  const [errors, setErrors] = useState(location.state?.errors ?? {});
  const [message, setMessage] = useState(location.state?.message ? { tone: location.state.tone ?? "success", text: location.state.message } : null);
  const [loadError, setLoadError] = useState("");
  const [dirty, setDirtyState] = useState(false);
  const [saveState, setSaveState] = useState("");
  const [saveError, setSaveError] = useState("");
  const [busy, setBusy] = useState("");
  const [picker, setPicker] = useState(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [allVersions, setAllVersions] = useState(false);

  // Refs hold the latest values for saves started by timers and navigation.
  const docRef = useRef(null);
  const dataRef = useRef(data);
  const slugRef = useRef("");
  const dirtyRef = useRef(false);
  const revision = useRef(0);
  const queue = useRef(Promise.resolve());
  dataRef.current = data;
  slugRef.current = slug;

  const setDirty = (value) => {
    dirtyRef.current = value;
    setDirtyState(value);
  };
  const applyDoc = useCallback((view) => {
    const { data: _data, media: viewMedia, ...rest } = view;
    docRef.current = rest;
    setDoc(rest);
    setMedia((m) => ({ ...m, ...viewMedia }));
  }, []);
  const loadDoc = useCallback(
    (view) => {
      applyDoc(view);
      setData(view.data);
      setSlug(view.slug ?? "");
      setDirty(false);
    },
    [applyDoc],
  );

  // Load the item, then drop any message carried over from the previous screen.
  useEffect(() => {
    if (location.state) navigate(".", { replace: true, state: null });
    if (isNew) return;
    let live = true;
    api.get(page ? `/content/${type}` : `/content/doc/${id}`).then(
      (view) => {
        if (!live) return;
        if (view.type !== type) return setLoadError("We couldn't find that item.");
        loadDoc(view);
      },
      (e) => live && setLoadError(e.message),
    );
    return () => {
      live = false;
    };
  }, []);

  // Saves run one at a time, in order. New items are created on their first save.
  const saveNow = async () => {
    const sent = revision.current;
    const current = docRef.current;
    const body = { data: dataRef.current };
    if (current?.slug && slugRef.current !== current.slug) body.slug = slugRef.current;
    setSaveState("saving");
    try {
      const view = current ? await api.put(`/content/doc/${current.id}`, body) : await api.post(`/content/${type}`, body);
      applyDoc(view);
      if (body.slug) setSlug(view.slug);
      setErrors({});
      if (revision.current === sent) setDirty(false);
      setSaveState("saved");
      return view;
    } catch (e) {
      setErrors(e.fields ?? {});
      setSaveError(e.message);
      setSaveState("error");
      throw e;
    }
  };
  const save = () => {
    const run = queue.current.then(saveNow);
    queue.current = run.catch(() => {});
    return run;
  };

  // After a new item is first saved, move to its own address so later saves update it.
  const goToSaved = (view, state) => {
    dirtyRef.current = false;
    navigate(`/content/${type}/${view.id}`, { replace: true, state });
  };

  const edit = (next) => {
    revision.current += 1;
    setData(next);
    setDirty(true);
    setSaveState("");
  };
  const editSlug = (value) => {
    revision.current += 1;
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
    setDirty(true);
    setSaveState("");
  };

  // Existing items save themselves a moment after the last change. This never changes the website.
  useEffect(() => {
    if (!dirty || !doc) return;
    const t = setTimeout(() => save().catch(() => {}), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [data, slug, dirty, doc]);

  useEffect(() => {
    const warn = (e) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  // Leaving with unsaved changes: save existing items first; ask before dropping a new one.
  const blocker = useBlocker(useCallback(({ currentLocation, nextLocation }) => dirtyRef.current && currentLocation.pathname !== nextLocation.pathname, []));
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (docRef.current) save().then(() => blocker.proceed(), () => blocker.reset());
    else if (window.confirm("This item hasn't been saved yet. Leave and lose what you entered?")) blocker.proceed();
    else blocker.reset();
  }, [blocker.state]);

  // Videos are compressed after upload; check back until they are ready.
  const processing = Object.values(media).filter((m) => m.kind === "video" && m.status === "processing").map((m) => m.id);
  useEffect(() => {
    if (!processing.length) return;
    const t = setInterval(() => {
      for (const mediaId of processing) {
        api.get(`/media/${mediaId}`).then((m) => m.status !== "processing" && setMedia((all) => ({ ...all, [m.id]: m })), () => {});
      }
    }, 5000);
    return () => clearInterval(t);
  }, [processing.join(",")]);

  async function run(name, task) {
    setBusy(name);
    setMessage(null);
    try {
      await task();
    } catch (e) {
      setErrors(e.fields ?? {});
      setMessage({ tone: "error", text: e.message });
    } finally {
      setBusy("");
    }
  }

  const saveDraft = () =>
    run("save", async () => {
      const view = await save();
      if (isNew) return goToSaved(view, { message: "Saved as a draft. It isn't on the website until you publish it." });
      setMessage({ tone: "success", text: doc?.published ? "Changes saved. Publish them to update the website." : "Saved as a draft." });
    });

  const publish = () =>
    run("publish", async () => {
      const startedAt = revision.current;
      const saved = dirtyRef.current || isNew ? await save() : docRef.current;
      let view;
      try {
        view = await api.post(`/content/doc/${saved.id}/publish`);
      } catch (e) {
        if (isNew) return goToSaved(saved, { tone: "error", message: e.message, errors: e.fields });
        throw e;
      }
      const text = view.status === "archived" ? "Changes published. The item stays in the archive." : "Published. It is now on the website.";
      if (isNew) return goToSaved(view, { message: text });
      applyDoc(view);
      if (revision.current === startedAt) loadDoc(view);
      setMessage({ tone: "success", text });
    });

  const preview = () => {
    // Open the tab now: browsers block pop-ups opened after waiting for the server.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    return run("preview", async () => {
      try {
        const saved = dirtyRef.current || isNew ? await save() : docRef.current;
        const { token, slug: savedSlug } = await api.post(`/content/doc/${saved.id}/preview`);
        const url = `${SITE_URL}${page ? meta.path : meta.path({ slug: savedSlug })}?preview=${encodeURIComponent(token)}`;
        if (tab) tab.location.href = url;
        const text = tab ? "Preview opened in a new tab. The link works for one hour." : "Your browser blocked the preview tab. Allow pop-ups for this site and try again.";
        if (isNew) return goToSaved(saved, { message: text, tone: tab ? "success" : "error" });
        setMessage({ tone: tab ? "success" : "error", text });
      } catch (e) {
        tab?.close();
        throw e;
      }
    });
  };

  const act = (action, { body, confirm, done }) => {
    if (confirm && !window.confirm(confirm)) return;
    return run(action, async () => {
      if (dirtyRef.current) await save();
      const view = await api.post(`/content/doc/${docRef.current.id}/${action}`, body ?? null);
      if (action === "restore") loadDoc(view);
      else applyDoc(view);
      if (action === "schedule") setScheduleAt("");
      setMessage({ tone: "success", text: done });
    });
  };

  const remove = () => {
    if (!window.confirm(`Delete “${doc.title || `this ${singular(type).toLowerCase()}`}”? It's removed from the website and moved to the bin, where a Super Admin can restore it.`)) return;
    return run("delete", async () => {
      await api.delete(`/content/doc/${doc.id}`);
      dirtyRef.current = false;
      navigate(listPath, { state: { message: `Deleted “${doc.title}”.` } });
    });
  };

  if (loadError) return <NotFound message={loadError} />;
  if (!data) return <Message>Loading…</Message>;

  const ctx = {
    errors,
    media,
    addMedia: (view) => setMedia((m) => ({ ...m, [view.id]: view })),
    openPicker: setPicker,
    hidden: meta.hidden?.(data),
  };
  const state = doc ? stateOf(doc) : { tone: "orange", label: "Not saved yet" };
  const live = doc?.published;
  const canPreview = page || meta.preview;
  const sitePath = page ? meta.path : doc && meta.path(doc);
  const versions = doc?.versions ?? [];
  const title = isNew ? meta.add : page ? spec.label : doc?.title || `Untitled ${singular(type).toLowerCase()}`;
  const intro = isNew ? meta.addIntro : page ? meta.intro : null;
  const changesToPublish = !live || doc.hasChanges || dirty;
  const otherErrors = Object.keys(errors).filter((k) => k !== "slug" && k !== "publishAt").length;

  return (
    <>
      <Link to={listPath} className={styles.back}>
        ← {page ? "All pages" : `All ${meta.title.toLowerCase()}`}
      </Link>
      <PageHead title={title} intro={intro} />

      <div className={styles.layout}>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            saveDraft();
          }}
          noValidate
        >
          <div className={styles.fields}>
            <Fields fields={spec.fields} value={data} onChange={edit} ctx={ctx} />
            {doc?.slug && meta.preview && (
              <div className={styles.slug}>
                <label htmlFor="f-slug">Web address</label>
                <div className={styles.slugInput}>
                  <span>{meta.path({ slug: "" })}</span>
                  <input id="f-slug" value={slug} maxLength={100} onChange={(e) => editSlug(e.target.value)} aria-invalid={errors.slug ? true : undefined} aria-describedby="f-slug-help" />
                </div>
                <p id="f-slug-help" className={styles.help}>
                  Lowercase letters, numbers and hyphens. Changing it breaks links that were already shared.
                </p>
                {errors.slug && <p className={styles.error}>{errors.slug}</p>}
              </div>
            )}
          </div>

          <div className={styles.bar}>
            {otherErrors > 0 && (
              <p className={styles.barError} role="alert">
                {otherErrors === 1 ? "One field needs" : `${otherErrors} fields need`} attention. They are highlighted in red.
              </p>
            )}
            <div className={styles.buttons}>
              <button type="submit" className={ui.button} disabled={Boolean(busy)}>
                {busy === "save" ? "Saving…" : "Save Draft"}
              </button>
              {canPreview && (
                <button type="button" className={ui.button} onClick={preview} disabled={Boolean(busy)}>
                  <img src={icon("preview")} alt="" width="22" height="14" /> Preview
                </button>
              )}
              <button type="button" className={`${ui.button} ${ui.primaryButton}`} onClick={publish} disabled={Boolean(busy) || !changesToPublish}>
                <img src={icon("send")} alt="" width="20" height="20" />
                {busy === "publish" ? "Publishing…" : live ? (changesToPublish ? "Publish changes" : "Published") : "Publish"}
              </button>
              <span className={styles.saveState} role="status">
                {saveState === "saving" ? "Saving…" : saveState === "error" ? `Not saved: ${saveError}` : dirty ? (doc ? "Unsaved changes" : "Not saved yet") : saveState === "saved" ? "All changes saved" : ""}
              </span>
            </div>
            {message && <Message tone={message.tone}>{message.text}</Message>}
          </div>
        </form>

        <aside className={styles.side}>
          {!page && (
            <section className={styles.card} aria-labelledby="live-preview">
              <h2 id="live-preview" className={styles.cardTitle}>
                <img src={icon("monitor")} alt="" width="20" height="16" /> Live Preview
              </h2>
              <div className={styles.cardBody}>
                <PreviewCard type={type} data={data} media={media} />
              </div>
            </section>
          )}

          <section className={styles.card} aria-labelledby="publishing">
            <h2 id="publishing" className={styles.cardTitle}>Publishing</h2>
            <div className={styles.cardBody}>
              <p className={styles.state}>
                <Pill tone={state.tone}>{state.label}</Pill>
                {doc?.publishedAt && live && <span>Last published {formatDateTime(doc.publishedAt)}</span>}
              </p>
              <p className={styles.note}>
                {!doc
                  ? "Save or publish to keep this item."
                  : doc.status === "archived"
                    ? "Archived: it is no longer listed on the website, but its page and files still open from old links."
                    : live
                      ? doc.hasChanges
                        ? "Some changes aren't on the website yet. Publish them when they are ready."
                        : "The website shows the latest version."
                      : "Not on the website yet. Publish it when it's ready."}
              </p>

              {doc?.publishAt ? (
                <div className={styles.schedule}>
                  <p>
                    {live ? "Changes publish" : "Publishes"} automatically on <strong>{formatDateTime(doc.publishAt)}</strong>.
                  </p>
                  <button type="button" className={ui.button} disabled={Boolean(busy)} onClick={() => act("schedule", { body: { at: null }, done: "Schedule cancelled." })}>
                    Cancel schedule
                  </button>
                </div>
              ) : (
                doc &&
                changesToPublish && (
                  <div className={styles.schedule}>
                    <label htmlFor="schedule-at">Publish later</label>
                    <div className={styles.scheduleRow}>
                      <input
                        id="schedule-at"
                        type="datetime-local"
                        value={scheduleAt}
                        min={localInput(new Date(Date.now() + 2 * 60_000))}
                        onChange={(e) => setScheduleAt(e.target.value)}
                        aria-invalid={errors.publishAt ? true : undefined}
                      />
                      <button
                        type="button"
                        className={ui.button}
                        disabled={!scheduleAt || Boolean(busy)}
                        onClick={() => act("schedule", { body: { at: new Date(scheduleAt).toISOString() }, done: "Scheduled. It publishes automatically at the chosen time." })}
                      >
                        Schedule
                      </button>
                    </div>
                    {errors.publishAt && <p className={styles.error}>{errors.publishAt}</p>}
                  </div>
                )
              )}

              {doc && (
                <div className={styles.more}>
                  {live && sitePath && (
                    <a className={ui.button} href={`${SITE_URL}${sitePath}`} target="_blank" rel="noreferrer">
                      <img src={icon("eye")} alt="" width="15" height="11" /> View on website
                    </a>
                  )}
                  {!page && doc.status === "published" && (
                    <button
                      type="button"
                      className={ui.button}
                      disabled={Boolean(busy)}
                      onClick={() =>
                        act("archive", {
                          confirm: "Archive this item? It leaves the website's lists but its page still opens from old links.",
                          done: "Archived.",
                        })
                      }
                    >
                      Archive
                    </button>
                  )}
                  {!page && doc.status === "archived" && (
                    <button type="button" className={ui.button} disabled={Boolean(busy)} onClick={() => act("unarchive", { done: "Back on the website." })}>
                      Unarchive
                    </button>
                  )}
                  {!page && live && (
                    <button
                      type="button"
                      className={ui.button}
                      disabled={Boolean(busy)}
                      onClick={() =>
                        act("unpublish", {
                          confirm: "Take this item off the website? It stays here as a draft.",
                          done: "Taken off the website. It is now a draft.",
                        })
                      }
                    >
                      Unpublish
                    </button>
                  )}
                  {!page && (
                    <button type="button" className={`${ui.button} ${ui.dangerButton}`} disabled={Boolean(busy)} onClick={remove}>
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {versions.length > 0 && (
            <section className={styles.card} aria-labelledby="versions">
              <h2 id="versions" className={styles.cardTitle}>Version history</h2>
              <div className={styles.cardBody}>
                <p className={styles.note}>Restoring a version replaces the draft. The website changes only when you publish.</p>
                <ol className={styles.versions}>
                  {(allVersions ? versions : versions.slice(0, VERSIONS_SHOWN)).map((v) => (
                    <li key={v.id}>
                      <span>
                        <strong>{versionLabel[v.action] ?? v.action}</strong>
                        {formatDateTime(v.created_at)}
                      </span>
                      <button
                        type="button"
                        className={styles.restore}
                        disabled={Boolean(busy)}
                        onClick={() =>
                          act("restore", {
                            body: { versionId: v.id },
                            confirm: `Restore the version from ${formatDateTime(v.created_at)}? Your current draft is kept in the history.`,
                            done: "Version restored. Publish it to put it on the website.",
                          })
                        }
                      >
                        Restore
                      </button>
                    </li>
                  ))}
                </ol>
                {versions.length > VERSIONS_SHOWN && (
                  <button type="button" className={styles.restore} onClick={() => setAllVersions((a) => !a)}>
                    {allVersions ? "Show fewer" : `Show all ${versions.length}`}
                  </button>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>

      {picker && <MediaPicker kinds={picker.kinds} onPick={picker.onPick} onClose={() => setPicker(null)} />}
    </>
  );
}
