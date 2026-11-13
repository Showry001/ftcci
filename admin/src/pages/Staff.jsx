import { useEffect, useRef, useState } from "react";
import { api, formatDateTime } from "../api.js";
import { roleLabel, useAuth } from "../auth.jsx";
import fields from "../cms/Fields.module.css";
import media from "../cms/Media.module.css";
import { Message, PageHead, Pill } from "../ui.jsx";
import ui from "../ui.module.css";
import styles from "./Staff.module.css";

const roles = [
  { value: "admin", label: "Admin", help: "Content, media, website submissions and the newsletter." },
  { value: "super_admin", label: "Super Admin", help: "Everything an Admin can do, plus staff accounts, the activity log and restoring from the bin." },
];

// Staff accounts (Super Admins only). Accounts are disabled rather than deleted.
export default function Staff() {
  const { user: me } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/staff").then((d) => setItems(d.items), (e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  async function change(person, body, confirm, done) {
    if (confirm && !window.confirm(confirm)) return;
    setError("");
    setNotice("");
    try {
      await (body === "unlock" ? api.post(`/staff/${person.id}/unlock`) : api.patch(`/staff/${person.id}`, body));
      setNotice(done);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <PageHead
        title="Staff accounts"
        intro="People who can sign in to this admin. Each person signs in with their own email address, by password or an emailed code."
      >
        <button type="button" className={`${ui.button} ${ui.primaryButton}`} onClick={() => setEditing({})}>+ Add staff member</button>
      </PageHead>
      {error && <Message tone="error">{error}</Message>}
      {notice && <Message tone="success">{notice}</Message>}

      <div className={ui.card}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th scope="col">Signs in with</th>
              <th scope="col">Last signed in</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((p) => {
              const self = p.id === me.id;
              return (
                <tr key={p.id}>
                  <td data-label="Name">
                    <span className={ui.primary}>{p.name}{self && " (you)"}</span>
                    <span className={ui.secondary}>{p.email}</span>
                  </td>
                  <td data-label="Role">{roleLabel[p.role]}</td>
                  <td data-label="Signs in with">{p.hasPassword ? "Password or emailed code" : "Emailed code"}</td>
                  <td data-label="Last signed in">{p.lastSignInAt ? formatDateTime(p.lastSignInAt) : "Not yet"}</td>
                  <td data-label="Status">
                    {p.disabled ? <Pill tone="grey">Disabled</Pill> : p.locked ? <Pill tone="orange">Password paused</Pill> : <Pill tone="green">Active</Pill>}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={ui.view} onClick={() => setEditing(p)}>Edit</button>
                      {p.locked && !p.disabled && (
                        <button type="button" className={ui.view} onClick={() => change(p, "unlock", null, `${p.name} can sign in with a password again.`)}>Allow password</button>
                      )}
                      {!self &&
                        (p.disabled ? (
                          <button type="button" className={ui.view} onClick={() => change(p, { disabled: false }, null, `${p.name} can sign in again.`)}>Enable</button>
                        ) : (
                          <button
                            type="button"
                            className={`${ui.view} ${styles.danger}`}
                            onClick={() => change(p, { disabled: true }, `Disable ${p.name}? They are signed out at once and can't sign in until enabled again.`, `${p.name} is disabled and signed out.`)}
                          >
                            Disable
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!items && !error && <p className={ui.empty}>Loading…</p>}
      </div>

      {editing && (
        <StaffDialog
          person={editing}
          self={editing.id === me.id}
          onClose={() => setEditing(null)}
          onSaved={(text) => {
            setEditing(null);
            setNotice(text);
            load();
          }}
        />
      )}
    </>
  );
}

function StaffDialog({ person, self, onClose, onSaved }) {
  const dialog = useRef(null);
  const isNew = !person.id;
  const [name, setName] = useState(person.name ?? "");
  const [email, setEmail] = useState(person.email ?? "");
  const [role, setRole] = useState(person.role ?? "admin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => dialog.current.showModal(), []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      if (isNew) {
        await api.post("/staff", { name, email, role });
        onSaved(`${name.trim()} is added and has been emailed how to sign in.`);
      } else {
        await api.patch(`/staff/${person.id}`, self ? { name } : { name, role });
        onSaved(`${name.trim()}'s account is saved.`);
      }
    } catch (err) {
      setErrors(err.fields ?? {});
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialog} className={`${media.dialog} ${styles.dialog}`} aria-labelledby="staff-dialog-title" onClose={onClose}>
      <div className={media.dialogHead}>
        <h2 id="staff-dialog-title">{isNew ? "Add staff member" : `Edit ${person.name}`}</h2>
        <button type="button" className={media.close} onClick={() => dialog.current.close()} aria-label="Close">✕</button>
      </div>
      <form className={styles.form} onSubmit={save}>
        <div className={fields.field}>
          <label htmlFor="staff-name" className={fields.label}>Name</label>
          <input id="staff-name" className={fields.input} maxLength={120} required value={name} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? true : undefined} />
          {errors.name && <p className={fields.error}>{errors.name}</p>}
        </div>
        <div className={fields.field}>
          <label htmlFor="staff-email" className={fields.label}>Email address</label>
          <input id="staff-email" type="email" className={fields.input} maxLength={254} required readOnly={!isNew} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={errors.email ? true : undefined} />
          {errors.email && <p className={fields.error}>{errors.email}</p>}
          {!isNew && <p className={fields.help}>The email address can't be changed. Add a new account for a new address and disable this one.</p>}
        </div>
        <fieldset className={styles.roles} disabled={self}>
          <legend className={fields.label}>Role</legend>
          {roles.map((r) => (
            <label key={r.value} className={styles.role}>
              <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
              <span>
                <strong>{r.label}</strong>
                <small>{r.help}</small>
              </span>
            </label>
          ))}
          {self && <p className={fields.help}>You can't change your own role. Ask another Super Admin.</p>}
        </fieldset>
        {isNew && <p className={fields.help}>They'll get an email with a link to the admin. They sign in with a code sent to this address, and can set a password under My account.</p>}
        {error && <Message tone="error">{error}</Message>}
        <div className={styles.buttons}>
          <button type="submit" className={`${ui.button} ${ui.primaryButton}`} disabled={busy}>{isNew ? "Add and send invitation" : "Save"}</button>
          <button type="button" className={ui.button} onClick={() => dialog.current.close()}>Cancel</button>
        </div>
      </form>
    </dialog>
  );
}
