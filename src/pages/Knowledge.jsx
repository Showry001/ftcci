import { Link } from "react-router-dom";
import PageHero from "../components/common/PageHero.jsx";
import SubNav from "../components/common/SubNav.jsx";
import { IssueRow, KHeader, LatestIssue, PublicationCard, QuickLink } from "../components/common/KnowledgeCards.jsx";
import { kIcons, knowledgeSubNav, latestReview, recentReviews, usefulLinks } from "../data/knowledge.js";
import { publications } from "../data/content.js";
import styles from "./Knowledge.module.css";

export default function Knowledge() {
  return (
    <>
      <PageHero crumb="Home > Knowledge Centre" title="Knowledge Centre" />
      <SubNav items={knowledgeSubNav} label="Knowledge Centre" />

      <section className={styles.review}>
        <div className="container">
          <KHeader
            title="FTCCI"
            accent="Review"
            text="The flagship monthly journal of the Federation - economic commentary, policy analysis, member spotlights and chamber activity."
            to="/knowledge/ftcci-review"
          />
          <div className={styles.reviewRow}>
            <LatestIssue issue={latestReview} />
            <div className={styles.issueList}>
              {recentReviews.map((r, i) => (
                <IssueRow key={i} issue={r} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.links}>
        <div className="container">
          <KHeader title="Useful" accent="Links" text="Government, regulatory and industry portals our members reach for most often." />
          <div className={styles.linkGrid}>
            {usefulLinks.map((l) => (
              <QuickLink key={l.title} link={l} />
            ))}
          </div>
          <Link to="/knowledge/useful-links" className={styles.viewAllLinks}>
            View all Links <img src={kIcons.arrowDark} alt="" width="14" height="14" />
          </Link>
        </div>
      </section>

      <section className={styles.pubs}>
        <div className="container">
          <KHeader
            title="FTCCI"
            accent="Publications"
            text="Reports, directories and studies published by the Federation — free for members to download."
            to="/knowledge/publications"
            dark
          />
          <div className={styles.pubGrid}>
            {publications.slice(0, 4).map((p, i) => (
              <PublicationCard key={i} pub={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
