import { useEffect, useRef, useState } from "react";
import { bookingCatering, bookingCategories, bookingEquipment, bookingHalls } from "../data/services.js";
import styles from "./HallBookingForm.module.css";

const steps = ["Hall", "Schedule", "Needs", "Details"];

const empty = {
  halls: [], date: "", from: "", to: "", purpose: "", request: "",
  equipment: [], catering: [], category: "",
  company: "", address: "", pin: "", phone: "", fax: "", email: "", website: "", gst: "",
  member: "", contact: "", cell: "", office: "", residence: "",
};

const companyFields = [
  { name: "pin", label: "PIN", placeholder: "500 004", inputMode: "numeric", autoComplete: "postal-code" },
  { name: "phone", label: "Phone (STD)", placeholder: "040-XXXXX", type: "tel", autoComplete: "tel" },
  { name: "fax", label: "Fax (STD)", placeholder: "040-XXXXX", type: "tel" },
  { name: "email", label: "Email *", placeholder: "info@company.com", type: "email", required: true, autoComplete: "email" },
  { name: "website", label: "Website", placeholder: "www.company.com", inputMode: "url", autoComplete: "url" },
  { name: "gst", label: "GST No.", placeholder: "36XXXXX" },
];
const contactFields = [
  { name: "cell", label: "Cell", placeholder: "+91 XXXXX", type: "tel", autoComplete: "tel" },
  { name: "office", label: "Office", placeholder: "040-XXXXX", type: "tel" },
  { name: "residence", label: "Residence", placeholder: "040-XXXXX", type: "tel" },
];

const today = () => new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD

// Four-step hall requisition modal opened from the header's "Hall Booking" button.
export default function HallBookingForm({ open, onClose }) {
  const dialogRef = useRef(null);
  const [step, setStep] = useState(0);
  const [v, setV] = useState(empty);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Escape fires "cancel" right away while "close" can lag, so sync state from "cancel" too.
  const closeRef = useRef(null);
  useEffect(() => {
    const d = dialogRef.current;
    const onCancel = () => closeRef.current();
    d.addEventListener("cancel", onCancel);
    return () => d.removeEventListener("cancel", onCancel);
  }, []);

  useEffect(() => setError(""), [v]);

  const set = (name) => (e) => setV((s) => ({ ...s, [name]: e.target.value }));
  const toggle = (name, item) =>
    setV((s) => ({ ...s, [name]: s[name].includes(item) ? s[name].filter((x) => x !== item) : [...s[name], item] }));
  const pick = (name, item) => setV((s) => ({ ...s, [name]: s[name] === item ? "" : item }));
  const input = (name, extra = {}) => ({ id: `hb-${name}`, name, value: v[name], onChange: set(name), ...extra });

  const goTo = (i) => {
    setError("");
    setStep(i);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (step === 0 && !v.halls.length) return setError("Select at least one hall to continue.");
    if (step === 1 && v.to <= v.from) return setError("The end time must be after the start time.");
    if (step < steps.length - 1) return goTo(step + 1);
    // TODO: connect to the FTCCI hall-booking endpoint.
    setError("");
    setSent(true);
  };

  // Called by the buttons, backdrop, Escape and the native "close" event — safe to run more than once.
  const close = () => {
    onClose();
    setError("");
    if (sent) {
      setV(empty);
      setStep(0);
      setSent(false);
    }
  };
  closeRef.current = close;

  const day = v.date ? new Date(`${v.date}T00:00`).toLocaleDateString("en-IN", { weekday: "long" }) : "—";
  const last = step === steps.length - 1;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="hb-title"
      onClose={close}
      onClick={(e) => e.target === dialogRef.current && close()}
    >
      <form className={styles.card} onSubmit={onSubmit}>
        <div className={styles.head}>
          <h2 id="hb-title" className={styles.title}>Hall Requisition Form</h2>
          <div className={styles.headRight}>
            <span className={styles.badge}>Step {step + 1} / {steps.length}</span>
            <button type="button" className={styles.close} aria-label="Close" onClick={close}>
              ×
            </button>
          </div>
        </div>

        <div className={styles.tabs}>
          {steps.map((s, i) => {
            const done = sent || i < step;
            return (
              <button
                key={s}
                type="button"
                className={`${styles.tab} ${i === step && !sent ? styles.tabActive : ""} ${done ? styles.tabDone : ""}`}
                aria-current={i === step && !sent ? "step" : undefined}
                disabled={!done || sent}
                onClick={() => goTo(i)}
              >
                {done ? `✓ ${s}` : s}
              </button>
            );
          })}
        </div>

        {sent ? (
          <div key="sent" className={styles.body}>
            <p className={styles.doneTitle}>Request received</p>
            <p className={styles.hint}>
              Thank you{v.contact ? `, ${v.contact}` : ""}. Our bookings team will confirm hall availability
              {v.email ? ` at ${v.email}` : ""} shortly.
            </p>
          </div>
        ) : (
          <div key={step} className={styles.body}>
            {step === 0 && (
              <>
                <fieldset className={styles.fieldset}>
                  <legend className={styles.hint}>Select one or more halls for your event</legend>
                  <div className={styles.halls}>
                    {bookingHalls.map(([name, cap]) => (
                      <label key={name} className={styles.hall}>
                        <input
                          type="checkbox"
                          className="visually-hidden"
                          checked={v.halls.includes(name)}
                          onChange={() => toggle("halls", name)}
                        />
                        <span className={styles.box} aria-hidden="true" />
                        <span>
                          <span className={styles.hallName}>{name}</span>
                          <span className={styles.hallCap}>{cap}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className={styles.note}>* Eatables not allowed in Auditorium</p>
              </>
            )}

            {step === 1 && (
              <>
                <p className={styles.hint}>Pick your event date and time slot</p>
                <div className={styles.grid2}>
                  <Field id="hb-date" label="Date *">
                    <input {...input("date", { type: "date", required: true, min: today() })} className={styles.input} />
                  </Field>
                  <Field id="hb-day" label="Day">
                    <output id="hb-day" className={styles.readonly}>{day}</output>
                  </Field>
                  <Field id="hb-from" label="From *">
                    <input {...input("from", { type: "time", required: true })} className={styles.input} />
                  </Field>
                  <Field id="hb-to" label="To *">
                    <input {...input("to", { type: "time", required: true })} className={styles.input} />
                  </Field>
                </div>
                <Field id="hb-purpose" label="Purpose of Event" className={styles.section}>
                  <textarea
                    {...input("purpose", { rows: 2, placeholder: "Brief description of your event..." })}
                    className={`${styles.input} ${styles.textarea}`}
                  />
                </Field>
                <Field id="hb-request" label="Special Request" className={styles.section}>
                  <input {...input("request", { placeholder: "Any special arrangements..." })} className={styles.input} />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Chips id="hb-equipment" label="Equipment Required" items={bookingEquipment}
                  isOn={(x) => v.equipment.includes(x)} onPick={(x) => toggle("equipment", x)} />
                <Chips id="hb-catering" label="Catering / Serving" items={bookingCatering}
                  isOn={(x) => v.catering.includes(x)} onPick={(x) => toggle("catering", x)}>
                  <p className={`${styles.note} ${styles.noteTight}`}>* Eatables not allowed in Auditorium</p>
                </Chips>
                <Chips id="hb-category" label="Organisation Category" items={bookingCategories}
                  isOn={(x) => v.category === x} onPick={(x) => pick("category", x)} />
              </>
            )}

            {step === 3 && (
              <>
                <Field id="hb-company" label="Name of the Company *" strong>
                  <input
                    {...input("company", { required: true, placeholder: "Organisation / Company name", autoComplete: "organization" })}
                    className={`${styles.input} ${styles.inputLg}`}
                  />
                </Field>
                <Field id="hb-address" label="Address" strong className={styles.section}>
                  <textarea
                    {...input("address", { rows: 2, placeholder: "Full postal address", autoComplete: "street-address" })}
                    className={`${styles.input} ${styles.inputLg} ${styles.textarea}`}
                  />
                </Field>
                <div className={`${styles.grid3} ${styles.section}`}>
                  {companyFields.map(({ name, label, ...rest }) => (
                    <Field key={name} id={`hb-${name}`} label={label} strong>
                      <input {...input(name, rest)} className={`${styles.input} ${styles.inputLg}`} />
                    </Field>
                  ))}
                </div>
                <div className={styles.divided}>
                  <p id="hb-member" className={styles.labelStrong}>FTCCI Member?</p>
                  <div className={styles.toggles} role="group" aria-labelledby="hb-member">
                    {["yes", "no"].map((x) => (
                      <button key={x} type="button" className={styles.toggle} aria-pressed={v.member === x}
                        onClick={() => pick("member", x)}>
                        {x}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.divided}>
                  <Field id="hb-contact" label="Contact Person *" strong>
                    <input
                      {...input("contact", { required: true, placeholder: "Full name", autoComplete: "name" })}
                      className={`${styles.input} ${styles.inputLg}`}
                    />
                  </Field>
                  <div className={`${styles.grid3} ${styles.sectionTight}`}>
                    {contactFields.map(({ name, label, ...rest }) => (
                      <Field key={name} id={`hb-${name}`} label={label} strong>
                        <input {...input(name, rest)} className={`${styles.input} ${styles.inputLg}`} />
                      </Field>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={styles.foot}>
          {sent ? (
            <span />
          ) : (
            <button type="button" className={styles.back} disabled={step === 0} onClick={() => goTo(step - 1)}>
              ← Back
            </button>
          )}
          <div className={styles.dots} aria-hidden="true">
            {steps.map((s, i) => (
              <span
                key={s}
                className={`${styles.dot} ${i === step && !sent ? styles.dotActive : ""} ${sent || i < step ? styles.dotDone : ""}`}
              />
            ))}
          </div>
          {sent ? (
            <button type="button" className={styles.next} onClick={close}>Close</button>
          ) : last ? (
            <button type="submit" className={styles.submit}>
              Submit <span aria-hidden="true">✓</span>
            </button>
          ) : (
            <button type="submit" className={styles.next}>Next →</button>
          )}
        </div>
      </form>
    </dialog>
  );
}

function Field({ id, label, strong, className = "", children }) {
  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={id} className={strong ? styles.labelStrong : styles.label}>{label}</label>
      {children}
    </div>
  );
}

function Chips({ id, label, items, isOn, onPick, children }) {
  return (
    <div className={styles.group}>
      <p id={id} className={styles.label}>{label}</p>
      <div className={styles.chips} role="group" aria-labelledby={id}>
        {items.map((x) => (
          <button key={x} type="button" className={styles.chip} aria-pressed={isOn(x)} onClick={() => onPick(x)}>
            {x}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
