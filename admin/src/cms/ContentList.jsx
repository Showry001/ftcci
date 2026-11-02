import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { api, formatDateTime, query } from "../api.js";
import NotFound from "../pages/NotFound.jsx";
import { Message, PageHead, Pagination, Pill, SearchBox, Select } from "../ui.jsx";
import ui from "../ui.module.css";
import { SITE_URL, collectionTypes, singular, stateOf } from "./types.js";
import styles from "./ContentList.module.css";

const icon = (name) => `${import.meta.env.BASE_URL}icons/${name}.svg`;
const statuses = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

// Events, news, publications, Review issues or vacancies (Figma "Desktop - 217" Events list).
export default function ContentList() {
  const { type } = useParams();
  const meta = collectionTypes[type];
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";
  const page = Number(params.get("page")) || 1;
  const q = params.get("q") ?? "";
  const [search, setSearch] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.message ?? "");
  const [reload, setReload] = useState(0);

  useEffect(() => setSearch(q), [q, type]);
  useEffect(() => setNotice(location.state?.message ?? ""), [location.key]);

  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search, page: "" }), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!meta) return;
    let live = true;
    setError("");
    api.get(`/content/${type}${query({ status, q, page })}`).then(
      (d) => live && setData(d),
      (e) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [meta, type, status, q, page, reload]);

  if (!meta) return <NotFound />;

  function update(next) {
    const merged = { status, q, page: String(page), ...next };
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v && v !== "1")));
  }

  // Publications and vacancies appear on the site in the order set here.
  const canOrder = meta.orderable && !q && !status && data?.items.length > 1;
  async function moveRow(from, to) {
    const items = [...data.items];
    const [row] = items.splice(from, 1);
    items.splice(to, 0, row);
    setData({ ...data, items });
    setNotice("");
    try {
      await api.post(`/content/${type}/order`, { ids: items.map((d) => d.id) });
      setNotice("New order saved. The website shows it within a minute.");
    } catch (e) {
      setError(e.message);
      setReload((r) => r + 1);
    }
  }

  const counts = data?.counts;
  const statusOptions = [
    { value: "", label: counts ? `All Status (${counts.draft + counts.published + counts.archived})` : "All Status" },
    ...statuses.map((s) => ({ value: s.value, label: counts ? `${s.label} (${counts[s.value]})` : s.label })),
  ];
  const noun = singular(type).toLowerCase();

  return (
    <>
      <PageHead title={meta.title} intro={meta.intro}>
        <Link to={`/content/${type}/new`} className={`${ui.button} ${ui.primaryButton}`}>
          + {meta.add}
        </Link>
      </PageHead>
      <div className={ui.filters}>
        <SearchBox label={`Search ${meta.title.toLowerCase()}`} value={search} onChange={setSearch} />
        <Select label="Status" value={status} onChange={(v) => update({ status: v, page: "" })} options={statusOptions} />
      </div>

      {error && <Message tone="error">{error}</Message>}
      {notice && <Message tone="success">{notice}</Message>}
      {meta.orderable && (q || status) && <Message>Clear the search and status filter to change the order.</Message>}

      <div className={ui.card}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">{singular(type)} details</th>
              {meta.columns.map((c) => (
                <th key={c.label} scope="col">{c.label}</th>
              ))}
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((d, i) => {
              const state = stateOf(d);
              const live = d.status !== "draft";
              return (
                <tr key={d.id}>
                  <td data-label={`${singular(type)} details`}>
                    <div className={styles.details}>
                      {d.thumb ? <img className={styles.thumb} src={d.thumb.url} srcSet={d.thumb.srcset} sizes="98px" alt="" loading="lazy" /> : <span className={styles.thumb} />}
                      <div className={styles.text}>
                        <Link to={`/content/${type}/${d.id}`} className={styles.title}>
                          {d.title || `Untitled ${noun}`}
                        </Link>
                        {meta.sub?.(d.summary) && <span className={styles.sub}>{meta.sub(d.summary)}</span>}
                      </div>
                    </div>
                  </td>
                  {meta.columns.map((c) => (
                    <td key={c.label} data-label={c.label}>
                      {c.pill ? c.value(d.summary) && <span className={styles.category}>{c.value(d.summary)}</span> : c.value(d.summary) || "—"}
                    </td>
                  ))}
                  <td data-label="Status">
                    <Pill tone={state.tone}>{state.label}</Pill>
                    {d.publish_at && <span className={ui.secondary}>Publishes {formatDateTime(d.publish_at)}</span>}
                    {live && d.hasChanges && !d.publish_at && <span className={ui.secondary}>Has changes not published yet</span>}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {live && (
                        <a href={`${SITE_URL}${meta.path(d)}`} target="_blank" rel="noreferrer" className={styles.iconButton} aria-label={`View “${d.title}” on the website`} title="View on the website">
                          <img src={icon("eye")} alt="" width="15" height="11" />
                        </a>
                      )}
                      <Link to={`/content/${type}/${d.id}`} className={styles.editButton} aria-label={`Edit “${d.title}”`} title="Edit">
                        <img src={icon("edit")} alt="" width="20" height="20" />
                      </Link>
                      {canOrder && (
                        <>
                          <button type="button" className={styles.iconButton} onClick={() => moveRow(i, i - 1)} disabled={i === 0} aria-label={`Move “${d.title}” up`} title="Move up">↑</button>
                          <button type="button" className={styles.iconButton} onClick={() => moveRow(i, i + 1)} disabled={i === data.items.length - 1} aria-label={`Move “${d.title}” down`} title="Move down">↓</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data && data.items.length === 0 && (
          <p className={ui.empty}>{q || status ? "Nothing matches these filters." : `No ${meta.title.toLowerCase()} yet. Use “${meta.add}” to add the first one.`}</p>
        )}
        {!data && !error && <p className={ui.empty}>Loading…</p>}
      </div>
      {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => update({ page: String(p) })} />}
    </>
  );
}
