import { useEffect, useRef } from "react";
import styles from "./FormDialog.module.css";

// Modal form shell in the Hall Requisition Form style (Figma "hall booking form", node 44:2908):
// navy header, optional step tabs and dots, then Back / Next / Submit. Forms own their fields and state.
export default function FormDialog({
  id,
  title,
  open,
  onClose,
  steps = [],
  step = 0,
  onStep,
  sent,
  sending,
  error,
  onSubmit,
  done,
  children,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Escape fires "cancel" right away while "close" can lag, so sync state from "cancel" too.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const d = dialogRef.current;
    const onCancel = () => closeRef.current();
    d.addEventListener("cancel", onCancel);
    return () => d.removeEventListener("cancel", onCancel);
  }, []);

  const multi = steps.length > 1;
  const last = step === steps.length - 1 || !multi;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
    >
      <form className={styles.card} onSubmit={onSubmit} aria-busy={sending || undefined}>
        <div className={styles.head}>
          <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
          <div className={styles.headRight}>
            {multi && <span className={styles.badge}>Step {step + 1} / {steps.length}</span>}
            <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {multi && (
          <div className={styles.tabs} style={{ "--steps": steps.length }}>
            {steps.map((s, i) => {
              const isDone = sent || i < step;
              return (
                <button
                  key={s}
                  type="button"
                  className={`${styles.tab} ${i === step && !sent ? styles.tabActive : ""} ${isDone ? styles.tabDone : ""}`}
                  aria-current={i === step && !sent ? "step" : undefined}
                  disabled={!isDone || sent || sending}
                  onClick={() => onStep(i)}
                >
                  {isDone ? `✓ ${s}` : s}
                </button>
              );
            })}
          </div>
        )}

        {sent ? (
          <div key="sent" className={styles.body} role="status">
            {done}
          </div>
        ) : (
          <div key={step} className={styles.body}>
            {children}
          </div>
        )}

        {error && (
          <p id={`${id}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.foot}>
          {sent || !multi ? (
            <span />
          ) : (
            <button type="button" className={styles.back} disabled={step === 0 || sending} onClick={() => onStep(step - 1)}>
              ← Back
            </button>
          )}
          {multi && (
            <div className={styles.dots} aria-hidden="true">
              {steps.map((s, i) => (
                <span
                  key={s}
                  className={`${styles.dot} ${i === step && !sent ? styles.dotActive : ""} ${sent || i < step ? styles.dotDone : ""}`}
                />
              ))}
            </div>
          )}
          {sent ? (
            <button type="button" className={styles.next} onClick={onClose}>Close</button>
          ) : last ? (
            <button type="submit" className={styles.submit} disabled={sending}>
              {sending ? "Sending…" : <>Submit <span aria-hidden="true">✓</span></>}
            </button>
          ) : (
            <button type="submit" className={styles.next}>Next →</button>
          )}
        </div>
      </form>
    </dialog>
  );
}

export function Field({ id, label, strong, className = "", children }) {
  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={id} className={strong ? styles.labelStrong : styles.label}>{label}</label>
      {children}
    </div>
  );
}

export function Chips({ id, label, items, isOn, onPick, labelOf = (x) => x, children }) {
  return (
    <div className={styles.group}>
      <p id={id} className={styles.label}>{label}</p>
      <div className={styles.chips} role="group" aria-labelledby={id}>
        {items.map((x) => (
          <button key={x} type="button" className={styles.chip} aria-pressed={isOn(x)} onClick={() => onPick(x)}>
            {labelOf(x)}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}

export function Toggles({ id, label, items, value, onPick, labelOf = (x) => x }) {
  return (
    <>
      <p id={id} className={styles.labelStrong}>{label}</p>
      <div className={styles.toggles} role="group" aria-labelledby={id}>
        {items.map((x) => (
          <button key={x} type="button" className={styles.toggle} aria-pressed={value === x} onClick={() => onPick(x)}>
            {labelOf(x)}
          </button>
        ))}
      </div>
    </>
  );
}

// A field people never see or reach with the keyboard. Bots that fill every input give themselves away.
export function Honeypot({ value, onChange }) {
  return (
    <div className="visually-hidden" aria-hidden="true">
      <label>
        Leave this field empty
        <input type="text" name="ftcci_hp" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

