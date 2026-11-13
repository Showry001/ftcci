import { useLoaderData } from "react-router";
import PageHero from "../components/common/PageHero.jsx";
import SectionTitle from "../components/common/SectionTitle.jsx";
import { list, single } from "../lib/content.server.js";
import { dayMonthYear } from "../lib/format.js";
import styles from "./Careers.module.css";

export async function loader({ request }) {
  const [page, vacancies] = await Promise.all([single("careers", request), list("vacancy", { limit: 50 })]);
  return { careersEmail: page.email, vacancies: vacancies.items };
}

export const meta = () => [
  { title: "Careers – FTCCI" },
  { name: "description", content: "Open positions at the FTCCI Secretariat." },
];

export default function Careers() {
  const { careersEmail, vacancies } = useLoaderData();
  return (
    <>
      <PageHero crumb="Home > Careers" title="Careers" />
      <section className={styles.section}>
        <div className="container">
          <div className={styles.head}>
            <SectionTitle eyebrow="Work with FTCCI" title="Careers at the" accent="Federation" />
            <p>
              The FTCCI Secretariat supports Telangana’s trade and industry through advocacy, member services, events and
              training. Open positions are listed here as soon as they are announced.
            </p>
          </div>

          {vacancies.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="7" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </span>
              <h2>No vacancies right now</h2>
              <p>There are no open positions at FTCCI at the moment. Please check this page again for future opportunities.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {vacancies.map((v) => (
                <li key={v.slug} className={styles.job}>
                  <div>
                    <h2>{v.title}</h2>
                    <p className={styles.meta}>{[v.department, v.location, v.employment].filter(Boolean).join(" · ")}</p>
                    <p className={styles.summary}>{v.summary}</p>
                  </div>
                  <div className={styles.apply}>
                    {v.closes && <p>Apply by {dayMonthYear(v.closes)}</p>}
                    <p>{v.apply}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className={styles.contact}>
            Questions about working at FTCCI? Write to <a href={`mailto:${careersEmail}`}>{careersEmail}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
