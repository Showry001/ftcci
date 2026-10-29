import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { displayValue, forms } from "../../../shared/forms.js";
import { api, formatDateTime } from "../api.js";
import { useSummary } from "../Layout.jsx";
import { sectionBySlug, statuses } from "../sections.js";
import { Message, PageHead, Pill } from "../ui.jsx";
import ui from "../ui.module.css";
import NotFound from "./NotFound.jsx";
import styles from "./SubmissionDetail.module.css";

const dateValue = (iso) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

function emailState(e) {
  if (e.status === "sent") return { tone: "sent", label: "Sent" };
  if (e.status === "failed") return { tone: "failed", label: "Failed" };
  return e.attempts > 0 ? { tone: "retrying", label: "Retrying" } : { tone: "queued", label: "Queued" };
}

// One submission: everything the visitor sent, its status, internal notes and the emails it triggered.
export default function SubmissionDetail() {
  const { type, reference } = useParams();
  const section = sectionBySlug[type];
  const { refresh } = useSummary();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    api.get(`/submissions/${encodeURIComponent(reference)}`).then(
      (d) => {
        if (!live) return;
        setData(d);
        setNotes(d.submission.notes);
      },
      (e) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [reference]);

  if (!section) return <NotFound />;
  if (error && !data) return <NotFound message={error} />;
  if (!data) return <Message>Loading…</Message>;

  const { submission: s, emails } = data;
  const fields = forms[section.form].fields;

  async function save(change, message) {
    setBusy(true);
    setSaved("");
    setError("");
    try {
      const next = await api.patch(`/submissions/${encodeURIComponent(reference)}`, change);
      setData(next);
      setSaved(message);
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function retry(id) {
    setBusy(true);
    setError("");
    try {
      const { email } = await api.post(`/emails/${id}/retry`);
      setData((d) => ({ ...d, emails: d.emails.map((e) => (e.id === id ? email : e)) }));
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link to={`/submissions/${type}`} className={styles.back}>← {section.title}</Link>
      <PageHead title={s.reference} intro={`${forms[section.form].title} from ${s.name}, received ${formatDateTime(s.created_at)}`} />

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="details-title">
          <h2 id="details-title">Details sent</h2>
          <dl className={styles.fields}>
            {Object.entries(fields).map(([name, spec]) => {
              const raw = s.data[name];
              const value = spec.kind === "date" && raw ? dateValue(raw) : displayValue(section.form, name, raw);
              if (!value) return null;
              return (
                <div key={name}>
                  <dt>{spec.label}</dt>
                  <dd>
                    {spec.kind === "email" ? <a href={`mailto:${value}`}>{value}</a> : spec.kind === "phone" ? <a href={`tel:${value.replace(/[^\d+]/g, "")}`}>{value}</a> : value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <div className={styles.side}>
          <section className={styles.card} aria-labelledby="status-title">
            <h2 id="status-title">Status</h2>
            <p className={styles.help}>Mark it Contacted once you have replied, and Closed when nothing more is needed.</p>
            <div className={styles.statuses} role="group" aria-labelledby="status-title">
              {statuses.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  aria-pressed={s.status === st.value}
                  disabled={busy}
                  onClick={() => s.status !== st.value && save({ status: st.value }, `Marked as ${st.label}.`)}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.card} aria-labelledby="notes-title">
            <h2 id="notes-title">Internal notes</h2>
            <p className={styles.help}>Only FTCCI staff see these notes.</p>
            <label className="visually-hidden" htmlFor="notes">Internal notes</label>
            <textarea id="notes" rows={5} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Called on 30 Oct, hall held until Friday" />
            <button type="button" className={styles.primaryButton} disabled={busy || notes === s.notes} onClick={() => save({ notes }, "Notes saved.")}>
              Save notes
            </button>
          </section>

          {(saved || error) && <Message tone={error ? "error" : "success"}>{error || saved}</Message>}

          <section className={styles.card} aria-labelledby="emails-title">
            <h2 id="emails-title">Emails</h2>
            <ul className={styles.emails}>
              {emails.map((e) => {
                const state = emailState(e);
                return (
                  <li key={e.id}>
                    <div className={styles.emailHead}>
                      <span className={ui.primary}>{e.kind.endsWith("_notify") ? "Notification to FTCCI" : "Confirmation to sender"}</span>
                      <Pill tone={state.tone}>{state.label}</Pill>
                    </div>
                    <span className={ui.secondary}>To {e.to_address}</span>
                    {e.status === "sent" && e.sent_at && <span className={ui.secondary}>Sent {formatDateTime(e.sent_at)}</span>}
                    {e.status !== "sent" && e.status !== "failed" && e.attempts > 0 && (
                      <span className={ui.secondary}>Tried {e.attempts} time{e.attempts > 1 ? "s" : ""}; next try {formatDateTime(e.next_attempt_at)}</span>
                    )}
                    {e.last_error && <span className={styles.error}>Last error: {e.last_error}</span>}
                    {e.status === "failed" && (
                      <button type="button" className={styles.retry} disabled={busy} onClick={() => retry(e.id)}>Try again</button>
                    )}
                  </li>
                );
              })}
              {emails.length === 0 && <li className={ui.secondary}>No emails were sent for this submission.</li>}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
