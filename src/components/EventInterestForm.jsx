import { useEffect, useState } from "react";
import { forms, validate, yesNo } from "../../shared/forms.js";
import { FormError, firstError, prepareProof, sendForm } from "../lib/api.js";
import FormDialog, { Field, Honeypot, Toggles } from "./FormDialog.jsx";
import styles from "./FormDialog.module.css";

const order = ["name", "email", "mobile", "organisation", "designation", "member", "attendees", "message"];
const empty = { name: "", email: "", mobile: "", organisation: "", designation: "", member: "", attendees: "1", message: "" };
const limits = forms.eventInterest.fields;

// "Register Interest" on an event page. FTCCI's events team follows up with the details.
export default function EventInterestForm({ open, onClose, event, eventTitle }) {
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
  const input = (name, extra = {}) => ({
    id: `ei-${name}`,
    name,
    value: v[name],
    onChange: set(name),
    maxLength: limits[name].max,
    className: `${styles.input} ${styles.inputLg}`,
    "aria-invalid": error?.field === name || undefined,
    "aria-describedby": error?.field === name ? "ei-error" : undefined,
    ...extra,
  });

  const showError = (errors, message) => {
    const field = firstError(errors, order);
    setError({ field, message: field ? errors[field] : message });
    if (field) requestAnimationFrame(() => document.getElementById(`ei-${field}`)?.focus());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const { ok, values, errors } = validate("eventInterest", { ...v, event, eventTitle });
    if (!ok) return showError(errors);
    setSending(true);
    try {
      const res = await sendForm("event-interest", values, hp);
      setReference(res.reference);
    } catch (err) {
      showError(err instanceof FormError ? err.fields : {}, err.message);
    } finally {
      setSending(false);
    }
  };

  const close = () => {
    onClose();
    setError(null);
    if (reference) {
      setV(empty);
      setReference("");
    }
  };

  return (
    <FormDialog
      id="ei"
      title="Register Interest"
      open={open}
      onClose={close}
      sent={Boolean(reference)}
      sending={sending}
      error={error?.message}
      onSubmit={onSubmit}
      done={
        <>
          <p className={styles.doneTitle}>Thank you for registering</p>
          <p className={styles.hint}>
            Our events team will send the details of {eventTitle} to {v.email}.
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
      <p className={styles.hint}>{eventTitle}</p>
      <div className={`${styles.grid2} ${styles.stack}`}>
        <Field id="ei-name" label="Full Name *" strong>
          <input {...input("name", { required: true, placeholder: "Your name", autoComplete: "name" })} />
        </Field>
        <Field id="ei-email" label="Email *" strong>
          <input {...input("email", { type: "email", required: true, maxLength: 254, placeholder: "name@company.com", autoComplete: "email" })} />
        </Field>
        <Field id="ei-mobile" label="Mobile *" strong>
          <input {...input("mobile", { type: "tel", required: true, maxLength: 20, placeholder: "+91 XXXXX XXXXX", autoComplete: "tel" })} />
        </Field>
        <Field id="ei-attendees" label="Number of Attendees *" strong>
          <input {...input("attendees", { type: "number", required: true, min: limits.attendees.min, max: limits.attendees.max, inputMode: "numeric" })} />
        </Field>
        <Field id="ei-organisation" label="Organisation" strong>
          <input {...input("organisation", { placeholder: "Company / organisation", autoComplete: "organization" })} />
        </Field>
        <Field id="ei-designation" label="Designation" strong>
          <input {...input("designation", { placeholder: "e.g. Director", autoComplete: "organization-title" })} />
        </Field>
      </div>
      <div className={styles.divided}>
        <Toggles id="ei-member" label="FTCCI Member?" items={yesNo} value={v.member}
          onPick={(x) => setV((s) => ({ ...s, member: s.member === x ? "" : x }))} />
      </div>
      <Field id="ei-message" label="Message" strong className={styles.section}>
        <textarea {...input("message", { rows: 2, placeholder: "Anything you'd like the events team to know", className: `${styles.input} ${styles.inputLg} ${styles.textarea}` })} />
      </Field>
    </FormDialog>
  );
}
