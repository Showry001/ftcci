import { Suspense, lazy, useRef, useState } from "react";
import { fileSize, uploadMedia } from "./media.js";
import styles from "./Fields.module.css";

// The rich text editor is large, so it loads only on forms that use it.
const RichText = lazy(() => import("./RichText.jsx"));
const icon = (name) => `${import.meta.env.BASE_URL}icons/${name}.svg`;
const WIDE = new Set(["list", "group", "strings", "richtext", "image", "file", "video"]);
const isWide = (spec) => WIDE.has(spec.kind) || (spec.kind === "text" && spec.multiline);
const idFor = (path) => `f-${path.replace(/\./g, "-")}`;

// Renders a set of fields from shared/content.js. `ctx` carries errors (by path), the media items
// referenced so far, the media picker and any top-level fields to hide.
export default function Fields({ fields, value, onChange, path = "", ctx }) {
  const set = (name) => (v) => onChange({ ...value, [name]: v });
  return (
    <div className={styles.grid}>
      {Object.entries(fields).map(([name, spec]) => {
        const at = path ? `${path}.${name}` : name;
        if (ctx.hidden?.includes(at)) return null;
        return (
          <div key={name} className={isWide(spec) ? styles.wide : undefined}>
            <Field spec={spec} value={value?.[name]} onChange={set(name)} path={at} ctx={ctx} />
          </div>
        );
      })}
    </div>
  );
}

function Field({ spec, value, onChange, path, ctx }) {
  const id = idFor(path);
  const error = ctx.errors[path];
  const label = `${spec.label}${spec.required ? " *" : ""}`;
  const describedBy = [error && `${id}-error`, spec.help && `${id}-help`].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy };

  if (spec.kind === "group") {
    return (
      <fieldset className={styles.group}>
        <legend>{spec.label}</legend>
        <Fields fields={spec.fields} value={value ?? {}} onChange={onChange} path={path} ctx={ctx} />
      </fieldset>
    );
  }
  if (spec.kind === "list") return <ListInput spec={spec} value={value ?? []} onChange={onChange} path={path} ctx={ctx} />;

  let input;
  switch (spec.kind) {
    case "text":
      input = spec.multiline ? (
        <textarea {...common} className={styles.textarea} rows={4} maxLength={spec.max} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...common} className={styles.input} maxLength={spec.max} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      );
      break;
    case "richtext":
      input = (
        <Suspense fallback={<p className={styles.help}>Loading the editor…</p>}>
          <RichText id={id} value={value} onChange={onChange} invalid={Boolean(error)} />
        </Suspense>
      );
      break;
    case "date":
    case "time":
      input = (
        <span className={styles.withIcon}>
          <img src={icon(spec.kind === "date" ? "input-calendar" : "input-clock")} alt="" width="17" height="17" />
          <input {...common} type={spec.kind} className={styles.input} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} />
        </span>
      );
      break;
    case "url":
    case "email":
    case "phone":
      input = (
        <input
          {...common}
          type={spec.kind === "email" ? "email" : spec.kind === "phone" ? "tel" : "text"}
          inputMode={spec.kind === "url" ? "url" : undefined}
          placeholder={spec.kind === "url" ? "https://… or /page" : undefined}
          className={styles.input}
          maxLength={spec.kind === "url" ? 500 : 254}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "choice":
    case "icon":
      input = (
        <span className={styles.select}>
          <select {...common} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
            <option value="">Select…</option>
            {spec.options.map((o) => (
              <option key={o} value={o}>{spec.labels?.[o] ?? o}</option>
            ))}
          </select>
        </span>
      );
      break;
    case "boolean":
      return (
        <label className={styles.check}>
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span>{spec.label}</span>
          {spec.help && <small>{spec.help}</small>}
        </label>
      );
    case "strings":
      input = <StringsInput spec={spec} value={value ?? []} onChange={onChange} id={id} />;
      break;
    case "image":
    case "file":
    case "video":
      input = <MediaInput spec={spec} value={value} onChange={onChange} id={id} ctx={ctx} invalid={Boolean(error)} />;
      break;
    default:
      input = null;
  }

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      {input}
      {spec.help && <p id={`${id}-help`} className={styles.help}>{spec.help}</p>}
      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
    </div>
  );
}

function Mover({ index, count, onMove, onRemove, label }) {
  return (
    <span className={styles.mover}>
      <button type="button" onClick={() => onMove(index, index - 1)} disabled={index === 0} aria-label={`Move ${label} up`}>↑</button>
      <button type="button" onClick={() => onMove(index, index + 1)} disabled={index === count - 1} aria-label={`Move ${label} down`}>↓</button>
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`}>✕</button>
    </span>
  );
}

const move = (arr, from, to) => {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

function StringsInput({ spec, value, onChange, id }) {
  return (
    <div className={styles.strings}>
      {value.map((s, i) => (
        <div key={i} className={styles.stringRow}>
          <input id={i === 0 ? id : undefined} className={styles.input} maxLength={spec.max} value={s} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`${spec.label}, entry ${i + 1}`} />
          <Mover index={i} count={value.length} label={`entry ${i + 1}`} onMove={(a, b) => onChange(move(value, a, b))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
        </div>
      ))}
      {value.length < spec.maxItems && (
        <button type="button" className={styles.add} onClick={() => onChange([...value, ""])}>+ Add entry</button>
      )}
    </div>
  );
}

// First short text in an item, to label it when collapsed.
const summaryOf = (spec, item) => {
  for (const [name, f] of Object.entries(spec.fields)) {
    if ((f.kind === "text" || f.kind === "email" || f.kind === "phone") && item?.[name]) return item[name];
    if (f.kind === "choice" && item?.[name]) return f.labels?.[item[name]] ?? item[name];
  }
  return "";
};

function ListInput({ spec, value, onChange, path, ctx }) {
  const [open, setOpen] = useState(() => new Set(value.length <= 4 ? value.map((_, i) => i) : []));
  const hasError = (i) => Object.keys(ctx.errors).some((k) => k.startsWith(`${path}.${i}.`));
  const toggle = (i) => setOpen((s) => {
    const next = new Set(s);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });
  const add = () => {
    onChange([...value, {}]);
    setOpen((s) => new Set(s).add(value.length));
  };
  return (
    <fieldset className={styles.list}>
      <legend>
        {spec.label} <span className={styles.count}>({value.length})</span>
      </legend>
      {spec.help && <p className={styles.help}>{spec.help}</p>}
      {ctx.errors[path] && <p className={styles.error}>{ctx.errors[path]}</p>}
      {value.map((item, i) => {
        const isOpen = open.has(i) || hasError(i);
        const name = summaryOf(spec, item) || `Entry ${i + 1}`;
        return (
          <div key={i} className={`${styles.item} ${hasError(i) ? styles.itemError : ""}`}>
            <div className={styles.itemHead}>
              <button type="button" className={styles.itemToggle} aria-expanded={isOpen} onClick={() => toggle(i)}>
                <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span> {i + 1}. {name}
              </button>
              <Mover
                index={i}
                count={value.length}
                label={name}
                onMove={(a, b) => onChange(move(value, a, b))}
                onRemove={() => window.confirm(`Remove “${name}”?`) && onChange(value.filter((_, j) => j !== i))}
              />
            </div>
            {isOpen && (
              <div className={styles.itemBody}>
                <Fields fields={spec.fields} value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} path={`${path}.${i}`} ctx={ctx} />
              </div>
            )}
          </div>
        );
      })}
      {value.length < spec.maxItems && (
        <button type="button" className={styles.add} onClick={add}>+ Add to {spec.label.toLowerCase()}</button>
      )}
    </fieldset>
  );
}

const ACCEPT = { image: "image/jpeg,image/png,image/webp,image/gif,image/avif", pdf: "application/pdf", video: "video/mp4,video/quicktime,video/webm" };
const kindsFor = (spec) => (spec.kind === "file" ? (spec.accept ?? ["pdf", "image"]) : [spec.kind]);

function MediaInput({ spec, value, onChange, id, ctx, invalid }) {
  const fileRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [problem, setProblem] = useState("");
  const kinds = kindsFor(spec);
  const m = value ? ctx.media[value] : null;

  const upload = async (file) => {
    setProblem("");
    setProgress(0);
    try {
      const view = await uploadMedia(file, { expect: kinds, onProgress: setProgress });
      ctx.addMedia(view);
      onChange(view.id);
    } catch (err) {
      setProblem(err.message);
    } finally {
      setProgress(null);
      fileRef.current.value = "";
    }
  };

  return (
    <div className={`${styles.media} ${invalid ? styles.mediaInvalid : ""}`}>
      {m ? (
        <div className={styles.mediaCurrent}>
          {m.kind === "image" && <img src={m.url} srcSet={m.srcset} sizes="160px" alt={m.alt} />}
          {m.kind === "video" && (m.poster ? <img src={m.poster} alt="" /> : <span className={styles.fileBadge}>Video</span>)}
          {m.kind === "pdf" && <span className={styles.fileBadge}>PDF</span>}
          <div>
            <strong>{m.title || m.name}</strong>
            <small>
              {m.kind === "video" && m.status === "processing" ? "Being compressed… it can be published once ready." : m.kind === "video" && m.status === "failed" ? "Processing failed. Upload the video again." : `${m.kind.toUpperCase()} · ${fileSize(m.bytes)}`}
            </small>
          </div>
        </div>
      ) : value ? (
        <p className={styles.help}>This file is no longer in the media library.</p>
      ) : (
        <button type="button" className={styles.drop} onClick={() => fileRef.current.click()}>
          <img src={icon("upload")} alt="" width="22" height="17" />
          <span>Upload {kinds.map((k) => (k === "pdf" ? "PDF" : k)).join(" or ")}</span>
          <small>{spec.kind === "video" ? "MP4, MOV or WebM up to 200 MB" : kinds.length > 1 ? "PDF up to 100 MB, or an image up to 20 MB" : kinds[0] === "image" ? "JPG, PNG or WebP up to 20 MB, ideally 1200 px wide or more" : "PDF up to 100 MB"}</small>
        </button>
      )}
      {progress !== null && (
        <p className={styles.progress} role="status">
          Uploading… {progress}%<progress max="100" value={progress} />
        </p>
      )}
      {problem && <p className={styles.error} role="alert">{problem}</p>}
      <div className={styles.mediaActions}>
        <input ref={fileRef} id={id} type="file" hidden accept={kinds.map((k) => ACCEPT[k]).join(",")} onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
        <button type="button" className={styles.small} onClick={() => fileRef.current.click()} disabled={progress !== null}>{m ? "Replace" : "Upload"}</button>
        <button type="button" className={styles.small} onClick={() => ctx.openPicker({ kinds, onPick: (view) => { ctx.addMedia(view); onChange(view.id); } })}>Choose from library</button>
        {value && <button type="button" className={styles.small} onClick={() => onChange(null)}>Remove</button>}
      </div>
    </div>
  );
}
