import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { auth } from "../api.js";
import { useAuth } from "../auth.jsx";
import AuthLayout, { EmailInput, PasswordInput } from "./AuthLayout.jsx";
import styles from "./Auth.module.css";

// Sign in with a password, or with a 6-digit code sent by email (Figma "Log in page", 2538:43752).
export default function SignIn() {
  const { user, notice, signedIn } = useAuth();
  const location = useLocation();
  const [method, setMethod] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(notice ? { tone: "info", text: notice } : null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeSent) codeRef.current?.focus();
  }, [codeSent]);

  if (user) return <Navigate to={location.state?.from ?? "/"} replace />;

  async function run(task) {
    setBusy(true);
    setMessage(null);
    try {
      await task();
    } catch (e) {
      setMessage({ tone: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  const withPassword = (e) => {
    e.preventDefault();
    run(async () => signedIn(await auth.post("/sign-in/password", { email, password })));
  };
  const sendCode = (e) => {
    e?.preventDefault();
    run(async () => {
      const res = await auth.post("/sign-in/code/request", { email });
      setCodeSent(true);
      setCode("");
      setMessage({ tone: "info", text: res.message });
    });
  };
  const withCode = (e) => {
    e.preventDefault();
    run(async () => signedIn(await auth.post("/sign-in/code", { email, code })));
  };
  const switchTo = (next) => {
    setMethod(next);
    setMessage(null);
    setCodeSent(false);
  };

  return (
    <AuthLayout title="Login">
      <div className={styles.methods} role="group" aria-label="How to sign in">
        <button type="button" aria-pressed={method === "password"} onClick={() => switchTo("password")}>Password</button>
        <button type="button" aria-pressed={method === "code"} onClick={() => switchTo("code")}>Email code</button>
      </div>

      {method === "password" ? (
        <form className={styles.form} onSubmit={withPassword}>
          <EmailInput value={email} onChange={setEmail} />
          <div className={styles.fieldGroup}>
            <PasswordInput id="password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" placeholder="Enter your password" />
            <p className={styles.below}>
              <Link to="/forgot-password" state={{ email }}>Forgot Password?</Link>
            </p>
          </div>
          {message && <p className={`${styles.message} ${styles[message.tone]}`} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>}
          <button type="submit" className={styles.submit} disabled={busy}>{busy ? "Signing in…" : "Login →"}</button>
        </form>
      ) : !codeSent ? (
        <form className={styles.form} onSubmit={sendCode}>
          <EmailInput value={email} onChange={setEmail} />
          <p className={styles.hint}>We'll email you a 6-digit code. It works once, for 10 minutes.</p>
          {message && <p className={`${styles.message} ${styles[message.tone]}`} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>}
          <button type="submit" className={styles.submit} disabled={busy}>{busy ? "Sending…" : "Email me a code →"}</button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={withCode}>
          <div className={styles.field}>
            <label htmlFor="code">Sign-in code</label>
            <input
              ref={codeRef}
              id="code"
              className={styles.codeInput}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
            />
            <p className={styles.hint}>Sent to {email}. Check your spam folder if it hasn't arrived after a minute.</p>
          </div>
          {message && <p className={`${styles.message} ${styles[message.tone]}`} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>}
          <button type="submit" className={styles.submit} disabled={busy || code.length !== 6}>{busy ? "Signing in…" : "Login →"}</button>
          <p className={styles.links}>
            <button type="button" onClick={() => sendCode()} disabled={busy}>Send a new code</button>
            <button type="button" onClick={() => switchTo("code")} disabled={busy}>Use a different email</button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
