import { useState } from "react";
import styles from "./Auth.module.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

// The frame shared by the sign-in, forgotten-password and new-password pages (Figma 2538:43752).
export default function AuthLayout({ title, intro, children }) {
  return (
    <div className={styles.page}>
      <img className={`${styles.circle} ${styles.circleTop}`} src={asset("auth/circle-top.svg")} alt="" width="410" height="410" />
      <img className={`${styles.circle} ${styles.circleTop2}`} src={asset("auth/circle-top-2.svg")} alt="" width="410" height="410" />
      <img className={`${styles.circle} ${styles.circleBottom}`} src={asset("auth/circle-bottom.svg")} alt="" width="913" height="977" />
      <img className={`${styles.circle} ${styles.circleBottom2}`} src={asset("auth/circle-bottom-2.svg")} alt="" width="913" height="977" />
      <div className={styles.brand}>
        <img src={asset("logo.png")} alt="FTCCI emblem" width="70" height="75" />
        <p>The Federation of Telangana Chambers of Commerce and Industry</p>
      </div>
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Welcome Back</h1>
          <p>Sign in to your FTCCI account to access your dashboard.</p>
        </div>
        <section className={styles.card} aria-labelledby="auth-title">
          <h2 id="auth-title">{title}</h2>
          {intro && <p className={styles.intro}>{intro}</p>}
          {children}
        </section>
      </main>
    </div>
  );
}

export function EmailInput({ value, onChange, readOnly = false }) {
  return (
    <div className={styles.field}>
      <label htmlFor="email">Email Address</label>
      <span className={styles.inputWrap}>
        <img src={asset("auth/mail.svg")} alt="" width="31" height="31" />
        <input id="email" type="email" autoComplete="username" required maxLength={254} readOnly={readOnly} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Enter your email" />
      </span>
    </div>
  );
}

export function PasswordInput({ id, label, value, onChange, autoComplete, placeholder, describedBy, invalid }) {
  const [shown, setShown] = useState(false);
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <span className={styles.inputWrap}>
        <img src={asset("auth/lock.svg")} alt="" width="28" height="28" />
        <input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          required
          maxLength={200}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
        <button type="button" className={styles.reveal} onClick={() => setShown((s) => !s)} aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown}>
          <img src={asset(shown ? "icons/eye.svg" : "auth/eye-closed.svg")} alt="" width="22" height="22" />
        </button>
      </span>
    </div>
  );
}
