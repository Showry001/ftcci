import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, formatDate, query } from "../api.js";
import { Message, PageHead, Pagination, Pill, SearchBox, Select } from "../ui.jsx";
import ui from "../ui.module.css";

const statuses = [
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Waiting for confirmation" },
  { value: "unsubscribed", label: "Unsubscribed" },
];
const statusLabel = { confirmed: "Confirmed", pending: "Pending", unsubscribed: "Unsubscribed" };

// Newsletter sign-ups from the home page and footer. Only "Confirmed" addresses clicked the link in
// their confirmation email.
export default function Newsletter() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";
  const page = Number(params.get("page")) || 1;
  const q = params.get("q") ?? "";
  const [search, setSearch] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search, page: "" }), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let live = true;
    setError("");
    api.get(`/newsletter${query({ status, q, page })}`).then(
      (d) => live && setData(d),
      (e) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [status, q, page]);

  function update(next) {
    const merged = { status, q, page: String(page), ...next };
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v && v !== "1")));
  }

  const counts = data?.counts;
  const options = [
    { value: "", label: counts ? `All (${counts.confirmed + counts.pending + counts.unsubscribed})` : "All" },
    ...statuses.map((s) => ({ value: s.value, label: counts ? `${s.label} (${counts[s.value]})` : s.label })),
  ];

  return (
    <>
      <PageHead title="Newsletter" intro="People who signed up for FTCCI updates. Only confirmed addresses have clicked the link in their confirmation email." />
      <div className={ui.filters}>
        <SearchBox label="Search subscribers" value={search} onChange={setSearch} />
        <Select label="Status" value={status} onChange={(v) => update({ status: v, page: "" })} options={options} />
      </div>

      {error && <Message tone="error">{error}</Message>}

      <div className={ui.card}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Business / occupation</th>
              <th scope="col">Signed up</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((s) => (
              <tr key={s.id}>
                <td data-label="Name">
                  <span className={ui.primary}>{`${s.first_name} ${s.last_name}`.trim() || "—"}</span>
                </td>
                <td data-label="Email">{s.email}</td>
                <td data-label="Phone">{s.phone || "—"}</td>
                <td data-label="Business / occupation">{s.business || "—"}</td>
                <td data-label="Signed up">
                  <span>{formatDate(s.created_at)}</span>
                  <span className={ui.secondary}>{s.source === "home" ? "Home page" : "Footer"}</span>
                </td>
                <td data-label="Status">
                  <Pill tone={s.status}>{statusLabel[s.status]}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.items.length === 0 && (
          <p className={ui.empty}>{q || status ? "Nothing matches these filters." : "No sign-ups yet."}</p>
        )}
        {!data && !error && <p className={ui.empty}>Loading…</p>}
      </div>
      {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => update({ page: String(p) })} />}
    </>
  );
}
