import { useState } from "react";
import { assets, formPerks } from "../data/content.js";
import Arrow from "./Arrow.jsx";
import styles from "./NewsletterForm.module.css";

const fields = [
  { name: "firstName", placeholder: "First Name *", icon: "👤", required: true, type: "text", autoComplete: "given-name" },
  { name: "lastName", placeholder: "Last Name *", icon: "👤", required: true, type: "text", autoComplete: "family-name" },
  { name: "phone", placeholder: "Phone Number *", icon: "📞", required: true, type: "tel", autoComplete: "tel" },
  { name: "email", placeholder: "Email Address *", icon: "✉", required: true, type: "email", autoComplete: "email" },
  { name: "business", placeholder: "Business / Occupation", icon: "🏢", required: false, type: "text", autoComplete: "organization" },
];

export default function NewsletterForm() {
  const [values, setValues] = useState({});
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    if (!consent) {
      setStatus({ ok: false, msg: "Please agree to receive updates to continue." });
      return;
    }
    // TODO: connect to the FTCCI mailing-list endpoint.
    setStatus({ ok: true, msg: `Thanks ${values.firstName}! You're subscribed to FTCCI updates.` });
    setValues({});
    setConsent(false);
  };

  return (
    <section className={styles.card} aria-labelledby="stay-connected-title">
      <div className={styles.left}>
        <p className={styles.eyebrow}>Stay Connected</p>
        <h2 id="stay-connected-title" className={styles.title}>
          Stay Connected with <span>FTCCI</span>
        </h2>
        <p className={styles.lead}>
          Get updates on FTCCI events, industry developments, business opportunities and initiatives.
        </p>
        <ul className={styles.perks}>
          {formPerks.map((p, i) => (
            <li key={p}>
              <img src={assets.checks[i]} alt="" width="14.3" height="14.3" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.row3}>
          {fields.slice(0, 3).map((f) => (
            <Field key={f.name} f={f} values={values} setValues={setValues} />
          ))}
        </div>
        <div className={styles.row2}>
          {fields.slice(3).map((f) => (
            <Field key={f.name} f={f} values={values} setValues={setValues} />
          ))}
        </div>
        <div className={styles.bottom}>
          <label className={styles.consent}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I agree to receive marketing emails and event updates from FTCCI. Consent is not a condition of purchase.</span>
          </label>
          <button type="submit" className={styles.submit}>
            Join FTCCI Updates <Arrow tone="navy" />
          </button>
        </div>
        {status && (
          <p className={status.ok ? styles.ok : styles.err} role="status">{status.msg}</p>
        )}
      </form>
    </section>
  );
}

function Field({ f, values, setValues }) {
  return (
    <label className={styles.field}>
      <span className="visually-hidden">{f.placeholder.replace(" *", "")}</span>
      <span className={styles.icon} aria-hidden="true">{f.icon}</span>
      <input
        type={f.type}
        name={f.name}
        placeholder={f.placeholder}
        required={f.required}
        autoComplete={f.autoComplete}
        value={values[f.name] || ""}
        onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
      />
    </label>
  );
}
