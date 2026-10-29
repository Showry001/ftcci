import { useEffect, useState } from "react";
import { businessLines, constitutions, forms, memberServices, membershipPanels, membershipTypes, validate } from "../../shared/forms.js";
import { FormError, firstError, prepareProof, sendForm } from "../lib/api.js";
import FormDialog, { Chips, Field, Honeypot, Toggles } from "./FormDialog.jsx";
import styles from "./FormDialog.module.css";

const steps = ["Organisation", "Business", "Address", "Contact"];
const stepFields = [
  ["organisation", "constitution", "established", "panel", "membershipType"],
  ["business", "activities", "services", "gst", "regNo", "iec"],
  ["address", "city", "pin", "phone", "email", "website"],
  ["repName", "repDesignation", "repEmail", "repMobile", "message"],
];
const order = stepFields.flat();
const empty = Object.fromEntries(order.map((f) => [f, ["business", "services"].includes(f) ? [] : ""]));
const limits = forms.membership.fields;
const panelLabel = Object.fromEntries(membershipPanels.map((p) => [p.value, p.label]));

// Short online membership application. The membership desk collects the signed form, PAN, bank details
// and documents afterwards, so none of those are asked for here.
export default function MembershipForm({ open, onClose }) {
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
    id: `ma-${name}`,
    name,
    value: v[name],
    onChange: set(name),
    maxLength: limits[name].max,
    className: `${styles.input} ${styles.inputLg}`,
    "aria-invalid": error?.field === name || undefined,
    "aria-describedby": error?.field === name ? "ma-error" : undefined,
    ...extra,
  });

  const goTo = (i) => {
    setError(null);
    setStep(i);
  };
  const showError = (errors, message) => {
    const field = firstError(errors, order);
    if (field) setStep(stepFields.findIndex((f) => f.includes(field)));
    setError({ field, message: field ? errors[field] : message });
    if (field) requestAnimationFrame(() => document.getElementById(`ma-${field}`)?.focus());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const last = step === steps.length - 1;
    const { ok, values, errors } = validate("membership", v, last ? {} : { fields: stepFields[step] });
    if (!ok) return showError(errors);
    if (!last) return goTo(step + 1);

    setSending(true);
    try {
      const res = await sendForm("membership", values, hp);
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
      setStep(0);
      setReference("");
    }
  };

  return (
    <FormDialog
      id="ma"
      title="Membership Application"
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
          <p className={styles.doneTitle}>Application received</p>
          <p className={styles.hint}>
            Thank you, {v.repName}. Our membership desk will contact you at {v.repEmail} about the documents and fees
            needed to complete your application.
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
          <Field id="ma-organisation" label="Name of the Organisation *" strong>
            <input {...input("organisation", { required: true, placeholder: "Organisation / Company name", autoComplete: "organization" })} />
          </Field>
          <div className={`${styles.grid2} ${styles.stack} ${styles.section}`}>
            <Field id="ma-constitution" label="Constitution of Business *" strong>
              <select {...input("constitution", { required: true })}>
                <option value="" disabled>Select</option>
                {constitutions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field id="ma-established" label="Year Established" strong>
              <input {...input("established", { inputMode: "numeric", maxLength: 4, placeholder: "e.g. 1998" })} />
            </Field>
          </div>
          <div className={styles.section}>
            <Chips id="ma-panel" label="Membership Category *" items={membershipPanels.map((p) => p.value)}
              labelOf={(x) => panelLabel[x]} isOn={(x) => v.panel === x} onPick={(x) => pick("panel", x)} />
          </div>
          <div className={styles.divided}>
            <Toggles id="ma-membershipType" label="Membership Type" items={membershipTypes} value={v.membershipType}
              onPick={(x) => pick("membershipType", x)} />
          </div>
          <p className={styles.note}>Life membership: the admission fee plus ten times the annual subscription, valid for 15 years.</p>
        </>
      )}

      {step === 1 && (
        <>
          <Chips id="ma-business" label="Main Line of Business *" items={businessLines}
            isOn={(x) => v.business.includes(x)} onPick={(x) => toggle("business", x)} />
          <Field id="ma-activities" label="Business Activities *" strong className={styles.section}>
            <textarea
              {...input("activities", {
                required: true,
                rows: 3,
                placeholder: "Be specific, e.g. “Manufacture of PVC pipes” rather than “Trading”",
                className: `${styles.input} ${styles.inputLg} ${styles.textarea}`,
              })}
            />
          </Field>
          <div className={styles.section}>
            <Chips id="ma-services" label="Additional Services Required" items={memberServices}
              isOn={(x) => v.services.includes(x)} onPick={(x) => toggle("services", x)} />
          </div>
          <div className={`${styles.grid3} ${styles.section}`}>
            <Field id="ma-gst" label="GST No." strong>
              <input {...input("gst", { maxLength: 15, placeholder: "36XXXXX" })} />
            </Field>
            <Field id="ma-regNo" label="Company Regn. No." strong>
              <input {...input("regNo", { placeholder: "CIN / Regn. No." })} />
            </Field>
            <Field id="ma-iec" label="Import Export Code" strong>
              <input {...input("iec", { maxLength: 10, placeholder: "10 characters" })} />
            </Field>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Field id="ma-address" label="Registered Office Address *" strong>
            <textarea
              {...input("address", {
                required: true,
                rows: 2,
                placeholder: "Door no., building, street, area",
                autoComplete: "street-address",
                className: `${styles.input} ${styles.inputLg} ${styles.textarea}`,
              })}
            />
          </Field>
          <div className={`${styles.grid3} ${styles.section}`}>
            <Field id="ma-city" label="Town / City *" strong>
              <input {...input("city", { required: true, placeholder: "Hyderabad", autoComplete: "address-level2" })} />
            </Field>
            <Field id="ma-pin" label="PIN *" strong>
              <input {...input("pin", { required: true, inputMode: "numeric", maxLength: 7, placeholder: "500 004", autoComplete: "postal-code" })} />
            </Field>
            <Field id="ma-phone" label="Office Phone" strong>
              <input {...input("phone", { type: "tel", maxLength: 20, placeholder: "040-XXXXX", autoComplete: "tel" })} />
            </Field>
          </div>
          <div className={`${styles.grid2} ${styles.stack} ${styles.section}`}>
            <Field id="ma-email" label="Organisation Email *" strong>
              <input {...input("email", { type: "email", required: true, maxLength: 254, placeholder: "info@company.com", autoComplete: "email" })} />
            </Field>
            <Field id="ma-website" label="Website" strong>
              <input {...input("website", { inputMode: "url", maxLength: 200, placeholder: "www.company.com", autoComplete: "url" })} />
            </Field>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p className={styles.hint}>The person who will represent your organisation at FTCCI</p>
          <div className={`${styles.grid2} ${styles.stack}`}>
            <Field id="ma-repName" label="Representative Name *" strong>
              <input {...input("repName", { required: true, placeholder: "Full name", autoComplete: "name" })} />
            </Field>
            <Field id="ma-repDesignation" label="Designation *" strong>
              <input {...input("repDesignation", { required: true, placeholder: "e.g. Managing Director", autoComplete: "organization-title" })} />
            </Field>
            <Field id="ma-repEmail" label="Email *" strong>
              <input {...input("repEmail", { type: "email", required: true, maxLength: 254, placeholder: "name@company.com", autoComplete: "email" })} />
            </Field>
            <Field id="ma-repMobile" label="Mobile *" strong>
              <input {...input("repMobile", { type: "tel", required: true, maxLength: 20, placeholder: "+91 XXXXX XXXXX", autoComplete: "tel" })} />
            </Field>
          </div>
          <Field id="ma-message" label="Anything else we should know" strong className={styles.section}>
            <textarea {...input("message", { rows: 2, className: `${styles.input} ${styles.inputLg} ${styles.textarea}` })} />
          </Field>
          <p className={styles.note}>
            The membership desk will contact you to collect the signed application form, documents and fees.
          </p>
        </>
      )}
    </FormDialog>
  );
}
