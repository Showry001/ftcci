import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../api.js";
import AuthLayout, { EmailInput } from "./AuthLayout.jsx";
import styles from "./Auth.module.css";

// Asks for an email and sends a link to choose a new password (if the email has an account).
export default function ForgotPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      setMessage({ tone: "success", text: (await auth.post("/password/forgot", { email })).message });
    } catch (err) {
      setMessage({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Forgot password" intro="Enter the email address of your FTCCI admin account. We'll send you a link to choose a new password.">
      <form className={styles.form} onSubmit={submit}>
        <EmailInput value={email} onChange={setEmail} />
        {message && <p className={`${styles.message} ${styles[message.tone]}`} role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>}
        <button type="submit" className={styles.submit} disabled={busy}>{busy ? "Sending…" : "Send reset link →"}</button>
        <p className={styles.links}>
          <Link to="/sign-in">Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
