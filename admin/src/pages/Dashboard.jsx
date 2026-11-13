import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDateTime } from "../api.js";
import { useAuth } from "../auth.jsx";
import { collectionTypes, stateOf } from "../cms/types.js";
import { Message, PageHead, Pill } from "../ui.jsx";
import styles from "./Dashboard.module.css";

const icon = (name) => `${import.meta.env.BASE_URL}icons/${name}.svg`;
const actions = [
  { to: "/content/event/new", label: "Add New Event", text: "Create an event with date, venue and registration details.", icon: "stat-event", circle: true },
  { to: "/content/article/new", label: "Publish News", text: "Add news articles, press releases and announcements.", icon: "qa-news" },
  { to: "/content/publication/new", label: "Upload Publication", text: "Upload FTCCI Review, reports and downloadable documents.", icon: "qa-publication" },
  { to: "/media", label: "Manage Media", text: "Upload or replace website images, banners and event posters.", icon: "qa-media" },
];
const editorPath = (d) => (d.single ? `/pages/${d.type}` : `/content/${d.type}/${d.id}`);

// Dashboard Overview (Figma "Desktop - 218", 2538:44033): figures, quick actions and recent changes.
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard").then(setData, (e) => setError(e.message));
  }, []);

  const stats = data && [
    { icon: "stat-event", value: data.published.event, label: "Total Events", text: "Events listed on the website", to: "/content/event" },
    { icon: "stat-news", value: data.published.article, label: "News Articles", text: "News and press releases published", to: "/content/article" },
    { icon: "stat-publication", value: data.published.publication, label: "Publications", text: "Reports and studies published", to: "/content/publication" },
    { icon: "stat-drafts", value: data.waiting, label: "Pending Drafts", text: "Drafts and changes awaiting publication" },
  ];

  return (
    <>
      <PageHead title="Dashboard Overview" intro={`Welcome back, ${user.name.split(" ")[0]}. Here's your website content at a glance.`} />
      {error && <Message tone="error">{error}</Message>}
      <ul className={styles.stats}>
        {(stats ?? []).map((s) => {
          const body = (
            <>
              <img src={icon(s.icon)} alt="" width="24" height="24" />
              <strong>{s.value}</strong>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statText}>{s.text}</span>
            </>
          );
          return (
            <li key={s.label}>
              {s.to ? <Link to={s.to} className={styles.stat}>{body}</Link> : <div className={styles.stat}>{body}</div>}
            </li>
          );
        })}
      </ul>

      <div className={styles.panels}>
        <section className={styles.panel} aria-labelledby="quick-actions">
          <h2 id="quick-actions">Quick Actions</h2>
          <ul className={styles.actions}>
            {actions.map((a) => (
              <li key={a.to}>
                <Link to={a.to} className={styles.action}>
                  <span className={a.circle ? styles.actionCircle : styles.actionIcon}>
                    <img src={icon(a.icon)} alt="" width={a.circle ? 18 : 54} height={a.circle ? 19 : 54} />
                  </span>
                  <span className={styles.actionText}>
                    <strong>{a.label}</strong>
                    <span>{a.text}</span>
                  </span>
                  <img className={styles.chevron} src={icon("qa-chevron")} alt="" width="8" height="14" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="recent-activity">
          <div className={styles.panelHead}>
            <h2 id="recent-activity">Recent Activity</h2>
            {user.role === "super_admin" && <Link to="/activity">View all</Link>}
          </div>
          <ul className={styles.recent}>
            {data?.recent.map((d) => {
              const state = stateOf(d);
              return (
                <li key={d.id}>
                  <Link to={editorPath(d)} className={styles.recentItem}>
                    <span className={styles.actionText}>
                      <strong>{d.title || "Untitled"}</strong>
                      <span>
                        {collectionTypes[d.type]?.title ?? "Website page"} · updated {formatDateTime(d.updatedAt)}
                      </span>
                    </span>
                    <Pill tone={state.tone}>{state.label}</Pill>
                  </Link>
                </li>
              );
            })}
          </ul>
          {data && data.recent.length === 0 && <p className={styles.empty}>Nothing has been edited yet.</p>}
        </section>
      </div>
    </>
  );
}
