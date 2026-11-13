import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, formatDate, formatTime, query } from "../api.js";
import { Message, PageHead, Pagination, SearchBox, Select } from "../ui.jsx";
import ui from "../ui.module.css";

const kinds = [
  { value: "", label: "Everything" },
  { value: "auth", label: "Sign-ins" },
  { value: "content", label: "Content" },
  { value: "media", label: "Media library" },
  { value: "submission", label: "Website submissions" },
  { value: "staff", label: "Staff accounts" },
  { value: "account", label: "Own account changes" },
];
const labels = {
  "auth.sign_in": "Signed in",
  "auth.sign_in_failed": "Sign-in failed",
  "auth.locked": "Password sign-in paused",
  "auth.sign_out": "Signed out",
  "auth.code_sent": "Sign-in code sent",
  "auth.reset_requested": "Password reset requested",
  "auth.password_reset": "Password reset",
  "auth.password_changed": "Password changed",
  "auth.signed_out_others": "Signed out other devices",
  "account.renamed": "Name changed",
};
const label = (action) => labels[action] ?? action.split(".")[1].replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

// Who did what, and when (Super Admins only). Newest first.
export default function Activity() {
  const [params, setParams] = useSearchParams();
  const kind = params.get("kind") ?? "";
  const user = params.get("user") ?? "";
  const q = params.get("q") ?? "";
  const page = Number(params.get("page")) || 1;
  const [search, setSearch] = useState(q);
  const [staff, setStaff] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/staff").then((d) => setStaff(d.items), () => {});
  }, []);

  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search, page: "" }), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let live = true;
    setError("");
    api.get(`/activity${query({ kind, user, q, page })}`).then(
      (d) => live && setData(d),
      (e) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [kind, user, q, page]);

  function update(next) {
    const merged = { kind, user, q, page: String(page), ...next };
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v && v !== "1")));
  }

  return (
    <>
      <PageHead title="Activity log" intro="Sign-ins and every change made in the admin, newest first. Entries can't be edited or deleted." />
      <div className={ui.filters}>
        <SearchBox label="Search the activity log" value={search} onChange={setSearch} />
        <Select label="Kind of activity" value={kind} onChange={(v) => update({ kind: v, page: "" })} options={kinds} />
        <Select label="Person" value={user} onChange={(v) => update({ user: v, page: "" })} options={[{ value: "", label: "Everyone" }, ...staff.map((s) => ({ value: String(s.id), label: s.name }))]} />
      </div>
      {error && <Message tone="error">{error}</Message>}
      <div className={ui.card}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">When</th>
              <th scope="col">Who</th>
              <th scope="col">What</th>
              <th scope="col">From</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((e) => (
              <tr key={e.id}>
                <td data-label="When">
                  <span className={`${ui.primary} ${ui.nowrap}`}>{formatDate(e.at)}</span>
                  <span className={ui.secondary}>{formatTime(e.at)} IST</span>
                </td>
                <td data-label="Who">
                  <span className={ui.primary}>{e.actor.split(" <")[0] || "—"}</span>
                  {e.actor.includes(" <") && <span className={ui.secondary}>{e.actor.split(" <")[1].replace(/>$/, "")}</span>}
                </td>
                <td data-label="What">
                  <span className={ui.primary}>{label(e.action)}</span>
                  {e.summary && <span className={ui.secondary}>{e.summary}</span>}
                </td>
                <td data-label="From">{e.ip || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.items.length === 0 && <p className={ui.empty}>{q || kind || user ? "Nothing matches these filters." : "Nothing has been logged yet."}</p>}
        {!data && !error && <p className={ui.empty}>Loading…</p>}
      </div>
      {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => update({ page: String(p) })} />}
    </>
  );
}
