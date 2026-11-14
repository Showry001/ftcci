import { Link, useLoaderData } from "react-router";
import PageHero from "../components/common/PageHero.jsx";
import SubNav from "../components/common/SubNav.jsx";
import useReader from "../components/useReader.jsx";
import { IssueRow, KHeader, LatestIssue, PublicationCard, QuickLink } from "../components/common/KnowledgeCards.jsx";
import { list, single } from "../lib/content.server.js";
import { reviewDate } from "../lib/format.js";
import { icons, subNav } from "../ui/assets.js";
import styles from "./Knowledge.module.css";

export async function loader({ request }) {
  const [page, reviews, publications] = await Promise.all([single("knowledge", request), list("review", { limit: 4 }), list("publication", { limit: 4 })]);
  // The landing page shows a few links picked from the full directory.
  const directory = page.linkDirectory.flatMap((g) => g.links.map((l) => ({ ...l, group: g.group })));
  const links = page.featuredLinks.map((t) => directory.find((l) => l.title === t)).filter(Boolean);
  return { latestText: page.latestReviewText, reviews: reviews.items, publications: publications.items, links };
}

export const meta = () => [
  { title: "Knowledge Centre – FTCCI" },
  { name: "description", content: "The FTCCI Review weekly journal, useful government and industry links, and FTCCI publications and reports." },
];

export default function Knowledge() {
  const { latestText, reviews, publications, links } = useLoaderData();
  const [latest, ...recent] = reviews;
  const [reader, openReader] = useReader();
  return (
    <>
      <PageHero crumb="Home > Knowledge Centre" title="Knowledge Centre" />
      <SubNav items={subNav.knowledge} label="Knowledge Centre" />

      <section className={styles.review} data-edit="knowledge.review">
        <div className="container">
          <KHeader
            title="FTCCI"
            accent="Review"
            text="The flagship weekly journal of the Federation - economic commentary, policy analysis, member spotlights and chamber activity."
            to="/knowledge/ftcci-review"
          />
          <div className={styles.reviewRow}>
            {latest && (
              <LatestIssue
                issue={latest}
                text={latestText}
                onRead={() => openReader({ src: latest.file.url, title: `FTCCI Review – ${reviewDate(latest.date)}` })}
              />
            )}
            <div className={styles.issueList}>
              {recent.map((r) => (
                <IssueRow key={r.slug} issue={r} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.links} data-edit="knowledge.featuredLinks">
        <div className="container">
          <KHeader title="Useful" accent="Links" text="Government, regulatory and industry portals our members reach for most often." />
          <div className={styles.linkGrid}>
            {links.map((l) => (
              <QuickLink key={l.title} link={l} />
            ))}
          </div>
          <Link to="/knowledge/useful-links" className={styles.viewAllLinks}>
            View all Links <img src={icons.knowledge.arrowDark} alt="" width="14" height="14" />
          </Link>
        </div>
      </section>

      <section className={styles.pubs} data-edit="link.publication">
        <div className="container">
          <KHeader
            title="FTCCI"
            accent="Publications"
            text="Reports, directories and studies published by the Federation — free for members to download."
            to="/knowledge/publications"
            dark
          />
          <div className={styles.pubGrid}>
            {publications.map((p) => (
              <PublicationCard key={p.slug} pub={p} />
            ))}
          </div>
        </div>
      </section>
      {reader}
    </>
  );
}
