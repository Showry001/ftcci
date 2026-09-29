import { Link } from "react-router-dom";
import CroppedImage from "../CroppedImage.jsx";
import { kIcons } from "../../data/knowledge.js";
import styles from "./KnowledgeCards.module.css";

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

export function LatestIssue({ issue }) {
  return (
    <article className={styles.latest}>
      <img className={styles.latestCover} src={issue.cover} alt={`FTCCI Review ${issue.date} cover`} loading="lazy" />
      <div className={styles.latestBody}>
        <p className={styles.latestEyebrow}>Latest Issue</p>
        <h3>{issue.date}</h3>
        <p className={styles.latestText}>{issue.text}</p>
        <div className={styles.latestActions}>
          {/* TODO: point Read Now / Download PDF at the issue file */}
          <a href="#read" className={styles.readNow}>
            Read Now <img src={kIcons.arrowDark} alt="" width="14" height="14" />
          </a>
          <a href="#download" className={styles.downloadBtn}>
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
      <CroppedImage src={issue.cover} crop={issue.crop} alt="" className={styles.issueCover} />
      <div>
        <h3>{issue.date}</h3>
        <a href="#download" className={styles.issueDl}>
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
        <small>{link.sub}</small>
      </span>
      <img src={kIcons.upRight} alt="" width="14" height="14" />
    </a>
  );
}

export function PublicationCard({ pub }) {
  return (
    <article className={styles.pub}>
      <div className={styles.pubCover}>
        <img src={pub.image} alt={`${pub.title} cover`} loading="lazy" />
      </div>
      <div className={styles.pubBody}>
        <time>{pub.date}</time>
        <h3>{pub.title}</h3>
        <a href={pub.href} target="_blank" rel="noreferrer">Download PDF --&gt;</a>
      </div>
    </article>
  );
}
