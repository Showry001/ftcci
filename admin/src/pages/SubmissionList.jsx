import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api, formatDate, formatTime, query } from "../api.js";
import { icons, sectionBySlug, statusLabel, statuses } from "../sections.js";
import { Message, PageHead, Pagination, Pill, SearchBox, Select } from "../ui.jsx";
import ui from "../ui.module.css";
import NotFound from "./NotFound.jsx";

// List of one kind of website submission (Figma "Desktop - 217" Events list layout).
export default function SubmissionList() {
  const { type } = useParams();
  const section = sectionBySlug[type];
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";
  const page = Number(params.get("page")) || 1;
  const q = params.get("q") ?? "";
  const [search, setSearch] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => setSearch(q), [q, type]);

  // Search as you type, a moment after the last key.
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search, page: "" }), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!section) return;
    let live = true;
    setError("");
    api.get(`/submissions${query({ type: section.type, status, q, page })}`).then(
      (d) => live && setData(d),
      (e) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [section, status, q, page]);

  if (!section) return <NotFound />;

  function update(next) {
    const merged = { status, q, page: String(page), ...next };
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v && v !== "1")));
  }

  const counts = data?.counts;
  const all = counts ? counts.new + counts.contacted + counts.closed : null;
  const statusOptions = [
    { value: "", label: all === null ? "All Status" : `All Status (${all})` },
    ...statuses.map((s) => ({ value: s.value, label: counts ? `${s.label} (${counts[s.value]})` : s.label })),
  ];

  return (
    <>
      <PageHead title={section.title} intro={section.intro} />
      <div className={ui.filters}>
        <SearchBox label={`Search ${section.label.toLowerCase()}`} value={search} onChange={setSearch} />
        <Select label="Status" value={status} onChange={(v) => update({ status: v, page: "" })} options={statusOptions} />
      </div>

      {error && <Message tone="error">{error}</Message>}

      <div className={ui.card}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Reference</th>
              <th scope="col">From</th>
              <th scope="col">Details</th>
              <th scope="col">Contact</th>
              <th scope="col">Received</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((s) => (
              <tr key={s.reference}>
                <td data-label="Reference">
                  <span className={`${ui.primary} ${ui.nowrap}`}>{s.reference}</span>
                </td>
                <td data-label="From">
                  <span className={ui.primary}>{s.name}</span>
                  {s.organisation && <span className={ui.secondary}>{s.organisation}</span>}
                </td>
                <td data-label="Details">{s.summary}</td>
                <td data-label="Contact">
                  <span>{s.email}</span>
                  {s.phone && <span className={ui.secondary}>{s.phone}</span>}
                </td>
                <td data-label="Received">
                  <span className={ui.iconLine}>
                    <img src={icons.calendar} alt="" />
                    {formatDate(s.created_at)}
                  </span>
                  <span className={ui.iconLine}>
                    <img src={icons.clock} alt="" />
                    {formatTime(s.created_at)}
                  </span>
                </td>
                <td data-label="Status">
                  <Pill tone={s.status}>{statusLabel[s.status]}</Pill>
                </td>
                <td>
                  <Link to={`/submissions/${type}/${s.reference}`} className={ui.view}>
                    <img src={icons.eye} alt="" width="15" height="11" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.items.length === 0 && (
          <p className={ui.empty}>
            {q || status ? "Nothing matches these filters." : `No ${section.label.toLowerCase()} yet. New ones appear here as soon as they are sent.`}
          </p>
        )}
        {!data && !error && <p className={ui.empty}>Loading…</p>}
      </div>
      {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => update({ page: String(p) })} />}
    </>
  );
}
