import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../api.js";
import AuthLayout, { EmailInput, PasswordInput } from "./AuthLayout.jsx";
import styles from "./Auth.module.css";

// Opened from the reset email. The token is in the address after # so it never reaches server logs.
export default function ResetPassword() {
  const [token] = useState(() => window.location.hash.slice(1));
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Drop the token from the address bar and history.
    window.history.replaceState(window.history.state, "", window.location.pathname);
    auth.post("/password/reset/check", { token }).then(
      (res) => setEmail(res.email),
      (e) => setMessage({ tone: "error", text: e.message }),
    );
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    if (password !== again) return setMessage({ tone: "error", text: "The two passwords don't match." });
    setBusy(true);
    setMessage(null);
    try {
      setMessage({ tone: "success", text: (await auth.post("/password/reset", { token, password })).message });
      setDone(true);
    } catch (err) {
      setMessage({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const feedback = message && <p className={`${styles.message} ${styles[message.tone]}`} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>;

  if (done || email === null) {
    return (
      <AuthLayout title="Choose a new password">
        <div className={styles.form}>
          {feedback ?? <p className={styles.hint}>Checking the link…</p>}
          <p className={styles.links}>
            {done ? <Link to="/sign-in">Go to login</Link> : message && <Link to="/forgot-password">Ask for a new link</Link>}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" intro="Once it's set, you'll be signed out on every device and can log in with the new password.">
      <form className={styles.form} onSubmit={submit}>
        <EmailInput value={email} onChange={() => {}} readOnly />
        <PasswordInput id="new-password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 12 characters" describedBy="password-help" />
        <p id="password-help" className={styles.hint}>Use at least 12 characters. A few unrelated words make a strong password that is easy to remember.</p>
        <PasswordInput id="password-again" label="Type it again" value={again} onChange={setAgain} autoComplete="new-password" placeholder="Same password again" />
        {feedback}
        <button type="submit" className={styles.submit} disabled={busy}>{busy ? "Saving…" : "Set new password →"}</button>
      </form>
    </AuthLayout>
  );
}
