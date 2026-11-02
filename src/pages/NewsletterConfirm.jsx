import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import PageHero from "../components/common/PageHero.jsx";
import { confirmNewsletter } from "../lib/api.js";
import styles from "./NewsletterConfirm.module.css";

// Landing page for the link in the newsletter confirmation email. Confirming takes a click (not just
// opening the link), so mail scanners that open links can't subscribe anyone.
export default function NewsletterConfirm() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState(token ? "ready" : "missing");
  const [message, setMessage] = useState("");

  const confirm = async () => {
    setState("sending");
    try {
      await confirmNewsletter(token);
      setState("done");
    } catch (err) {
      setMessage(err.message);
      setState("failed");
    }
  };

  return (
    <>
      <PageHero crumb="Home > FTCCI Updates" title="FTCCI Updates" />
      <section className={styles.section}>
        <div className="container">
          <div className={styles.card} role="status">
            {state === "done" ? (
              <>
                <h2>You're subscribed</h2>
                <p>Thank you for confirming. You'll now receive FTCCI updates on events, policy and business opportunities.</p>
                <Link to="/" className={styles.button}>Back to home</Link>
              </>
            ) : state === "failed" || state === "missing" ? (
              <>
                <h2>We couldn't confirm this link</h2>
                <p>{message || "This confirmation link is incomplete. Please use the link in your email, or sign up again."}</p>
                <Link to="/" className={styles.button}>Sign up again</Link>
              </>
            ) : (
              <>
                <h2>Confirm your subscription</h2>
                <p>Click below to confirm your email address and start receiving FTCCI updates.</p>
                <button type="button" className={styles.button} onClick={confirm} disabled={state === "sending"}>
                  {state === "sending" ? "Confirming…" : "Confirm subscription"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
