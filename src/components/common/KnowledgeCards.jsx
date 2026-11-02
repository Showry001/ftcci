import { Link } from "react-router";
import { reviewDate } from "../../lib/format.js";
import { icons } from "../../ui/assets.js";
import Img from "../Img.jsx";
import styles from "./KnowledgeCards.module.css";

const kIcons = icons.knowledge;

// Section header with a title (accent word) + blurb and an optional "View all" link.
export function KHeader({ title, accent, text, to, dark = false }) {
  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>
          {title} <span>{accent}</span>
        </h2>
        {text && <p className={`${styles.blurb} ${dark ? styles.blurbDark : ""}`}>{text}</p>}
      </div>
      {to && (
        <Link to={to} className={styles.viewAll}>
          View all <img src={kIcons.arrowNavy} alt="" width="18" height="18" />
        </Link>
      )}
    </div>
  );
}

export function LatestIssue({ issue, text, onRead }) {
  return (
    <article className={styles.latest}>
      <Img className={styles.latestCover} media={issue.cover} alt={`FTCCI Review ${reviewDate(issue.date)} cover`} sizes="300px" />
      <div className={styles.latestBody}>
        <p className={styles.latestEyebrow}>Latest Issue</p>
        <h3>{reviewDate(issue.date)}</h3>
        {(issue.summary || text) && <p className={styles.latestText}>{issue.summary || text}</p>}
        <div className={styles.latestActions}>
          <button type="button" className={styles.readNow} aria-haspopup="dialog" onClick={onRead}>
            Read Now <img src={kIcons.arrowDark} alt="" width="14" height="14" />
          </button>
          <a href={issue.file?.url} download target="_blank" rel="noreferrer" className={styles.downloadBtn}>
            Download PDF <img src={kIcons.downloadNavy} alt="" width="20" height="20" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function IssueRow({ issue }) {
  return (
    <article className={styles.issue}>
      <Img className={styles.issueCover} media={issue.cover} alt="" sizes="120px" />
      <div>
        <h3>{reviewDate(issue.date)}</h3>
        <a href={issue.file?.url} download target="_blank" rel="noreferrer" className={styles.issueDl}>
          Download PDF <img src={kIcons.downloadGold} alt="" width="16" height="16" />
        </a>
      </div>
    </article>
  );
}

export function QuickLink({ link }) {
  return (
    <a href={link.href} target="_blank" rel="noreferrer" className={styles.quick}>
      <span>
        <strong>{link.title}</strong>
        <small>{link.group}</small>
      </span>
      <img src={kIcons.upRight} alt="" width="14" height="14" />
    </a>
  );
}

export function PublicationCard({ pub }) {
  return (
    <article className={styles.pub}>
      <div className={styles.pubCover}>
        <Img media={pub.cover} alt={`${pub.title} cover`} sizes="300px" />
      </div>
      <div className={styles.pubBody}>
        <span>{pub.meta}</span>
        <h3>{pub.title}</h3>
        <a href={pub.file?.url} target="_blank" rel="noreferrer">Download PDF --&gt;</a>
      </div>
    </article>
  );
}
