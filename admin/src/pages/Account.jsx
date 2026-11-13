import { useState } from "react";
import { auth } from "../api.js";
import { roleLabel, useAuth } from "../auth.jsx";
import fields from "../cms/Fields.module.css";
import { Message, PageHead } from "../ui.jsx";
import ui from "../ui.module.css";
import styles from "./Account.module.css";

// The signed-in person's own details, password and sessions.
export default function Account() {
  const { user, signedIn, update } = useAuth();

  return (
    <>
      <PageHead title="My account" intro="Your name, how you sign in, and the devices you're signed in on." />
      <div className={styles.sections}>
        <NameForm user={user} onSaved={(next) => signedIn(next)} />
        <PasswordForm user={user} onSaved={(next) => update(next.user)} />
        <Devices />
      </div>
    </>
  );
}

function Section({ title, intro, children }) {
  return (
    <section className={styles.card} aria-label={title}>
      <h2>{title}</h2>
      {intro && <p className={styles.intro}>{intro}</p>}
      {children}
    </section>
  );
}

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const submit = async (task, success) => {
    setBusy(true);
    setMessage(null);
    setErrors({});
    try {
      await task();
      setMessage({ tone: "success", text: success });
    } catch (e) {
      setErrors(e.fields ?? {});
      setMessage({ tone: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };
  return { busy, message, errors, submit };
}

function NameForm({ user, onSaved }) {
  const [name, setName] = useState(user.name);
  const { busy, message, errors, submit } = useSubmit();
  return (
    <Section title="Your details">
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          submit(async () => onSaved(await auth.patch("/me", { name })), "Your name is saved.");
        }}
      >
        <div className={fields.field}>
          <label htmlFor="account-name" className={fields.label}>Name</label>
          <input id="account-name" className={fields.input} maxLength={120} required value={name} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? true : undefined} />
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{roleLabel[user.role]}</dd>
          </div>
        </dl>
        <p className={fields.help}>To change your email address or role, ask a Super Admin.</p>
        <div>
          <button type="submit" className={`${ui.button} ${ui.primaryButton}`} disabled={busy || name.trim() === user.name}>Save</button>
        </div>
        {message && <Message tone={message.tone}>{message.text}</Message>}
      </form>
    </Section>
  );
}

function PasswordForm({ user, onSaved }) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const { busy, message, errors, submit } = useSubmit();
  const save = (e) => {
    e.preventDefault();
    submit(async () => {
      if (password !== again) throw Object.assign(new Error("The two new passwords don't match."), { fields: { again: "Doesn't match." } });
      onSaved(await auth.put("/me/password", user.hasPassword ? { current, password } : { password }));
      setCurrent("");
      setPassword("");
      setAgain("");
    }, "Your password is saved. You've been signed out on your other devices.");
  };
  const input = (id, label, value, set, autoComplete, error) => (
    <div className={fields.field}>
      <label htmlFor={id} className={fields.label}>{label}</label>
      <input id={id} type="password" className={fields.input} autoComplete={autoComplete} maxLength={200} required value={value} onChange={(e) => set(e.target.value)} aria-invalid={error ? true : undefined} />
      {error && <p className={fields.error}>{error}</p>}
    </div>
  );
  return (
    <Section
      title="Password"
      intro={user.hasPassword ? "You can sign in with this password or with a code sent to your email." : "You sign in with codes sent to your email. Set a password if you'd also like to sign in with one."}
    >
      <form className={styles.form} onSubmit={save}>
        {user.hasPassword && input("current-password", "Current password", current, setCurrent, "current-password", errors.current)}
        {input("new-password", user.hasPassword ? "New password" : "Password", password, setPassword, "new-password", errors.password)}
        <p className={fields.help}>At least 12 characters. A few unrelated words make a strong password that is easy to remember.</p>
        {input("again-password", "Type it again", again, setAgain, "new-password", errors.again)}
        <div>
          <button type="submit" className={`${ui.button} ${ui.primaryButton}`} disabled={busy}>{user.hasPassword ? "Change password" : "Set password"}</button>
        </div>
        {message && <Message tone={message.tone}>{message.text}</Message>}
      </form>
    </Section>
  );
}

function Devices() {
  const { busy, message, submit } = useSubmit();
  return (
    <Section title="Devices" intro="Signed in on a computer you no longer use, or a shared one? Sign out everywhere except here.">
      <div className={styles.form}>
        <div>
          <button
            type="button"
            className={ui.button}
            disabled={busy}
            onClick={() => window.confirm("Sign out on all your other devices?") && submit(() => auth.post("/me/sign-out-others"), "You're signed out everywhere else.")}
          >
            Sign out on other devices
          </button>
        </div>
        {message && <Message tone={message.tone}>{message.text}</Message>}
      </div>
    </Section>
  );
}
