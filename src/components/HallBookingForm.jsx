import { useEffect, useState } from "react";
import { cateringOptions, equipmentOptions, forms, organisationCategories, todayInIndia, validate } from "../../shared/forms.js";
import { bookingHalls } from "../../shared/halls.js";
import { hallFiles } from "../data/services.js";
import { FormError, firstError, prepareProof, sendForm } from "../lib/api.js";
import FormDialog, { Chips, Field, Honeypot, Toggles } from "./FormDialog.jsx";
import styles from "./FormDialog.module.css";

const steps = ["Hall", "Schedule", "Needs", "Details"];
const stepFields = [
  ["halls"],
  ["date", "from", "to", "purpose", "request"],
  ["equipment", "catering", "category"],
  ["company", "address", "pin", "phone", "fax", "email", "website", "gst", "member", "contact", "cell", "office", "residence"],
];
const order = stepFields.flat();

const empty = {
  halls: [], date: "", from: "", to: "", purpose: "", request: "",
  equipment: [], catering: [], category: "",
  company: "", address: "", pin: "", phone: "", fax: "", email: "", website: "", gst: "",
  member: "", contact: "", cell: "", office: "", residence: "",
};

const limits = forms.hallBooking.fields;
const companyFields = [
  { name: "pin", label: "PIN", placeholder: "500 004", inputMode: "numeric", autoComplete: "postal-code", maxLength: 7 },
  { name: "phone", label: "Phone (STD)", placeholder: "040-XXXXX", type: "tel", autoComplete: "tel", maxLength: 20 },
  { name: "fax", label: "Fax (STD)", placeholder: "040-XXXXX", type: "tel", maxLength: 20 },
  { name: "email", label: "Email *", placeholder: "info@company.com", type: "email", required: true, autoComplete: "email", maxLength: 254 },
  { name: "website", label: "Website", placeholder: "www.company.com", inputMode: "url", autoComplete: "url", maxLength: 200 },
  { name: "gst", label: "GST No.", placeholder: "36XXXXX", maxLength: 15 },
];
const contactFields = [
  { name: "cell", label: "Cell", placeholder: "+91 XXXXX", type: "tel", autoComplete: "tel", maxLength: 20 },
  { name: "office", label: "Office", placeholder: "040-XXXXX", type: "tel", maxLength: 20 },
  { name: "residence", label: "Residence", placeholder: "040-XXXXX", type: "tel", maxLength: 20 },
];

// Four-step hall requisition modal opened from the header's "Hall Booking" button and the Services page.
export default function HallBookingForm({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState(empty);
  const [hp, setHp] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (open) prepareProof();
  }, [open]);
  useEffect(() => setError(null), [v]);

  const set = (name) => (e) => setV((s) => ({ ...s, [name]: e.target.value }));
  const toggle = (name, item) =>
    setV((s) => ({ ...s, [name]: s[name].includes(item) ? s[name].filter((x) => x !== item) : [...s[name], item] }));
  const pick = (name, item) => setV((s) => ({ ...s, [name]: s[name] === item ? "" : item }));
  const input = (name, extra = {}) => ({
    id: `hb-${name}`,
    name,
    value: v[name],
    onChange: set(name),
    maxLength: limits[name].max,
    "aria-invalid": error?.field === name || undefined,
    "aria-describedby": error?.field === name ? "hb-error" : undefined,
    ...extra,
  });

  const goTo = (i) => {
    setError(null);
    setStep(i);
  };

  // Shows the first problem, on its own step, and puts the cursor there.
  const showError = (errors, message) => {
    const field = firstError(errors, order);
    if (field) setStep(stepFields.findIndex((f) => f.includes(field)));
    setError({ field, message: field ? errors[field] : message });
    if (field) requestAnimationFrame(() => document.getElementById(`hb-${field}`)?.focus());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const last = step === steps.length - 1;
    const { ok, values, errors } = validate("hallBooking", v, last ? {} : { fields: stepFields[step] });
    if (!ok) return showError(errors);
    if (!last) return goTo(step + 1);

    setSending(true);
    try {
      const res = await sendForm("hall-booking", values, hp);
      setReference(res.reference);
    } catch (err) {
      showError(err instanceof FormError ? err.fields : {}, err.message);
    } finally {
      setSending(false);
    }
  };

  // Called by the buttons, backdrop, Escape and the native "close" event — safe to run more than once.
  const close = () => {
    onClose();
    setError(null);
    if (reference) {
      setV(empty);
      setStep(0);
      setReference("");
    }
  };

  const day = v.date ? new Date(`${v.date}T00:00`).toLocaleDateString("en-IN", { weekday: "long" }) : "—";

  return (
    <FormDialog
      id="hb"
      title="Hall Requisition Form"
      open={open}
      onClose={close}
      steps={steps}
      step={step}
      onStep={goTo}
      sent={Boolean(reference)}
      sending={sending}
      error={error?.message}
      onSubmit={onSubmit}
      done={
        <>
          <p className={styles.doneTitle}>Request received</p>
          <p className={styles.hint}>
            Thank you, {v.contact}. Our bookings team will check hall availability and contact you at {v.email}. This is an
            enquiry, not a confirmed booking.
          </p>
          <p className={styles.reference}>
            <span>Your reference number</span>
            <strong>{reference}</strong>
          </p>
          <p className={styles.hint}>A confirmation email with this number is on its way to you.</p>
        </>
      }
    >
      <Honeypot value={hp} onChange={setHp} />
      {step === 0 && (
        <>
          <fieldset className={styles.fieldset}>
            <legend className={styles.hint}>Select one or more halls for your event</legend>
            <div className={styles.halls}>
              {bookingHalls.map((h, i) => (
                <div key={h.name} className={styles.hall}>
                  <label className={styles.hallPick}>
                    <input
                      type="checkbox"
                      id={i === 0 ? "hb-halls" : undefined}
                      className="visually-hidden"
                      checked={v.halls.includes(h.name)}
                      onChange={() => toggle("halls", h.name)}
                    />
                    <span className={styles.box} aria-hidden="true" />
                    <span>
                      <span className={styles.hallName}>{h.name}</span>
                      <span className={styles.hallCap}>Cap: {h.seats ?? h.area}</span>
                    </span>
                  </label>
                  <button
                    type="button"
                    className={styles.info}
                    popovertarget={`hb-tariff-${i}`}
                    aria-label={`Capacity and tariff: ${h.name}`}
                  >
                    <InfoIcon />
                  </button>
                  <TariffCard id={`hb-tariff-${i}`} hall={h} />
                </div>
              ))}
            </div>
          </fieldset>
          <p className={styles.note}>* Eatables not allowed in Auditorium</p>
          <a className={styles.requisition} href={hallFiles.form.href} download target="_blank" rel="noreferrer">
            Hall Requisition Form
          </a>
        </>
      )}

      {step === 1 && (
        <>
          <p className={styles.hint}>Pick your event date and time slot</p>
          <div className={styles.grid2}>
            <Field id="hb-date" label="Date *">
              <input {...input("date", { type: "date", required: true, min: todayInIndia() })} className={styles.input} />
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
          <Chips id="hb-equipment" label="Equipment Required" items={equipmentOptions}
            isOn={(x) => v.equipment.includes(x)} onPick={(x) => toggle("equipment", x)} />
          <Chips id="hb-catering" label="Catering / Serving" items={cateringOptions}
            isOn={(x) => v.catering.includes(x)} onPick={(x) => toggle("catering", x)}>
            <p className={`${styles.note} ${styles.noteTight}`}>* Eatables not allowed in Auditorium</p>
          </Chips>
          <Chips id="hb-category" label="Organisation Category" items={organisationCategories}
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
            <Toggles id="hb-member" label="FTCCI Member?" items={["yes", "no"]} value={v.member} onPick={(x) => pick("member", x)} />
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
    </FormDialog>
  );
}

// Figma "carbon:information" icon
function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M17 22v-8h-4v2h2v6h-3v2h8v-2h-3zM16 8a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 8z" />
      <path d="M16 30a14 14 0 1 1 14-14 14 14 0 0 1-14 14zm0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4z" />
    </svg>
  );
}

// Capacity and tariff card shown from a hall's "i" button (Figma frames 2082:11014 and siblings).
function TariffCard({ id, hall }) {
  return (
    <div id={id} popover="auto" className={styles.tariff} role="dialog" aria-labelledby={`${id}-title`}>
      <div className={styles.tariffHead}>
        <p id={`${id}-title`}>{hall.name}</p>
        <button type="button" popovertarget={id} popovertargetaction="hide" aria-label="Close">
          ×
        </button>
      </div>
      <div className={styles.tariffBody}>
        <div>
          <p className={styles.tariffLabel}>{hall.seats ? "Seating Capacity" : "Area"}</p>
          <p className={styles.tariffValue}>{hall.seats ? `${hall.seats} nos.` : hall.area}</p>
        </div>
        <div>
          <p className={styles.tariffLabel}>Floor</p>
          <p className={styles.tariffValue}>{hall.floor}</p>
        </div>
        <hr />
        <div>
          <p className={styles.tariffLabel}>Refundable Caution Deposit</p>
          <p className={styles.tariffValue}>{hall.deposit}/-</p>
        </div>
        <div>
          <p className={styles.tariffLabel}>Tariff</p>
          <div className={styles.rates}>
            <span>for 4hrs</span>
            <span>for 8hrs</span>
            <strong>{hall.h4}/-</strong>
            <strong>{hall.h8}/-</strong>
          </div>
        </div>
      </div>
      <p className={styles.tariffNote}>Amounts in ₹, plus 18% GST. FTCCI members get 20% off hall charges.</p>
    </div>
  );
}
