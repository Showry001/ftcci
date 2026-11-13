import { articleTags } from "../../../shared/content.js";
import styles from "./PreviewCard.module.css";

const icon = (name) => `${import.meta.env.BASE_URL}icons/${name}.svg`;
const date = (iso, month = "short") =>
  iso ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month, year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : "";
const time12 = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

function Picture({ media, className, label }) {
  if (!media?.url) return <div className={`${className} ${styles.placeholder}`}>{label}</div>;
  return <img className={className} src={media.url} srcSet={media.srcset} sizes="440px" alt="" />;
}

// A card shaped like the one on the public site, updated as staff type (Figma "Live Preview").
export default function PreviewCard({ type, data, media }) {
  const pick = (id) => (id ? media[id] : null);

  if (type === "event") {
    const times = [data.startTime, data.endTime].filter(Boolean).map(time12).join(" – ");
    return (
      <article className={styles.card}>
        <div className={styles.imageWrap}>
          <Picture media={pick(data.image)} className={styles.image} label="Event image" />
          {data.category && <span className={styles.tag}>{data.category}</span>}
        </div>
        <div className={styles.body}>
          <h3 className={styles.title}>{data.title || "Event title"}</h3>
          {data.subtitle && <p className={styles.subtitle}>{data.subtitle}</p>}
          <p className={styles.meta}>
            <img src={icon("card-calendar")} alt="" width="17" height="17" />
            <span>{[date(data.date) || "Date", times].filter(Boolean).join(" | ")}</span>
          </p>
          {data.venue && (
            <p className={styles.meta}>
              <img src={icon("card-pin")} alt="" width="17" height="17" />
              <span>{data.venue}</span>
            </p>
          )}
        </div>
      </article>
    );
  }

  if (type === "article") {
    return (
      <article className={styles.card}>
        <Picture media={pick(data.image)} className={styles.image} label="Cover image" />
        <div className={styles.body}>
          <p className={styles.kicker}>
            <span className={styles.badge}>{articleTags[data.tag] ?? "News"}</span>
            {date(data.date)}
          </p>
          <h3 className={styles.title}>{data.title || "Headline"}</h3>
          {data.excerpt && <p className={styles.subtitle}>{data.excerpt}</p>}
        </div>
      </article>
    );
  }

  if (type === "publication" || type === "review") {
    const title = type === "review" ? (data.date ? `FTCCI Review, ${date(data.date, "long")}` : "FTCCI Review") : data.title || "Publication title";
    return (
      <article className={`${styles.card} ${styles.cover}`}>
        <Picture media={pick(data.cover)} className={styles.coverImage} label="Cover image" />
        <div className={styles.body}>
          <p className={styles.date}>{type === "review" ? date(data.date) : data.meta}</p>
          <h3 className={styles.plainTitle}>{title}</h3>
          <p className={styles.download}>{data.file ? "Download PDF →" : "Add the PDF to show the download link"}</p>
        </div>
      </article>
    );
  }

  if (type === "vacancy") {
    return (
      <article className={styles.card}>
        <div className={styles.body}>
          <h3 className={styles.title}>{data.title || "Job title"}</h3>
          <p className={styles.subtitle}>{[data.department, data.location, data.employment].filter(Boolean).join(" · ")}</p>
          {data.closes && (
            <p className={styles.meta}>
              <img src={icon("card-calendar")} alt="" width="17" height="17" />
              <span>Apply by {date(data.closes)}</span>
            </p>
          )}
          {data.summary && <p className={styles.text}>{data.summary}</p>}
        </div>
      </article>
    );
  }
  return null;
}
