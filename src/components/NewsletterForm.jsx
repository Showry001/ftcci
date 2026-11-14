import { useState } from "react";
import { validate } from "../../shared/forms.js";
import { assets } from "../ui/assets.js";
import { FormError, firstError, joinNewsletter, prepareProof } from "../lib/api.js";
import Arrow from "./Arrow.jsx";
import { Honeypot } from "./FormDialog.jsx";
import styles from "./NewsletterForm.module.css";

const fields = [
  { name: "firstName", placeholder: "First Name *", icon: "👤", required: true, type: "text", autoComplete: "given-name", maxLength: 100 },
  { name: "lastName", placeholder: "Last Name *", icon: "👤", required: true, type: "text", autoComplete: "family-name", maxLength: 100 },
  { name: "phone", placeholder: "Phone Number *", icon: "📞", required: true, type: "tel", autoComplete: "tel", maxLength: 20 },
  { name: "email", placeholder: "Email Address *", icon: "✉", iconLarge: true, required: true, type: "email", autoComplete: "email", maxLength: 254 },
  { name: "business", placeholder: "Business / Occupation", icon: "🏢", required: false, type: "text", autoComplete: "organization", maxLength: 150 },
];
const order = [...fields.map((f) => f.name), "consent"];

export default function NewsletterForm({ perks }) {
  const [values, setValues] = useState({});
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const fail = (form, errors, msg) => {
    const field = firstError(errors, order);
    setStatus({ ok: false, field, msg: field ? errors[field] : msg });
    if (field) form.elements[field]?.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const { ok, values: clean, errors } = validate("newsletter", { ...values, consent });
    if (!ok) return fail(form, errors);
    setSending(true);
    try {
      await joinNewsletter("home", clean, hp);
      setStatus({ ok: true, msg: `Thanks ${clean.firstName}! Please check your inbox and confirm your email to start receiving FTCCI updates.` });
      setValues({});
      setConsent(false);
    } catch (err) {
      fail(form, err instanceof FormError ? err.fields : {}, err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="stay-connected-title" data-edit="home.stayConnected">
      <div className={styles.left}>
        <p className={styles.eyebrow}>Stay Connected</p>
        <h2 id="stay-connected-title" className={styles.title}>
          Stay Connected with <span>FTCCI</span>
        </h2>
        <p className={styles.lead}>
          Get updates on FTCCI events, industry developments, business opportunities and initiatives.
        </p>
        <ul className={styles.perks}>
          {perks.map((p, i) => (
            <li key={p}>
              <img src={assets.checks[i]} alt="" width="14.3" height="14.3" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      <form className={styles.form} onSubmit={onSubmit} onFocus={prepareProof} noValidate>
        <div className={styles.row3}>
          {fields.slice(0, 3).map((f) => (
            <Field key={f.name} f={f} values={values} setValues={setValues} invalid={status?.field === f.name} />
          ))}
        </div>
        <div className={styles.row2}>
          {fields.slice(3).map((f) => (
            <Field key={f.name} f={f} values={values} setValues={setValues} invalid={status?.field === f.name} />
          ))}
        </div>
        <div className={styles.bottom}>
          <label className={styles.consent}>
            <input name="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
              aria-invalid={status?.field === "consent" || undefined} aria-describedby={status?.field === "consent" ? "newsletter-status" : undefined} />
            <span>I agree to receive marketing emails and event updates from FTCCI. Consent is not a condition of purchase.</span>
          </label>
          <button type="submit" className={styles.submit} disabled={sending}>
            {sending ? "Sending…" : "Join FTCCI Updates"} <Arrow tone="navy" />
          </button>
        </div>
        <Honeypot value={hp} onChange={setHp} />
        {status && (
          <p id="newsletter-status" className={status.ok ? styles.ok : styles.err} role="status">{status.msg}</p>
        )}
      </form>
    </section>
  );
}

function Field({ f, values, setValues, invalid }) {
  return (
    <label className={styles.field}>
      <span className="visually-hidden">{f.placeholder.replace(" *", "")}</span>
      <span className={`${styles.icon} ${f.iconLarge ? styles.iconLarge : ""}`} aria-hidden="true">{f.icon}</span>
      <input
        type={f.type}
        name={f.name}
        placeholder={f.placeholder}
        required={f.required}
        maxLength={f.maxLength}
        autoComplete={f.autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? "newsletter-status" : undefined}
        value={values[f.name] || ""}
        onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
      />
    </label>
  );
}
