import { useState } from "react";
import PageHero from "../components/common/PageHero.jsx";
import SubNav, { useTab } from "../components/common/SubNav.jsx";
import SectionTitle from "../components/common/SectionTitle.jsx";
import CtaBand from "../components/common/CtaBand.jsx";
import CroppedImage from "../components/CroppedImage.jsx";
import HistoryCarousel from "../components/HistoryCarousel.jsx";
import { leaders } from "../data/content.js";
import {
  aboutSubNav, committee, committeeImage, committeePanels, mission,
  objectives, objectivesImage, pastPresidents, secretariat, vision,
} from "../data/about.js";
import styles from "./About.module.css";

export default function About() {
  const [panel, setPanel] = useState(committeePanels[0]);
  const members = committee.filter((m) => m.panel === panel);
  const tab = useTab(aboutSubNav.map((i) => i.href.slice(1)));

  return (
    <>
      <PageHero crumb="Home > About" title="About Us" image={`${import.meta.env.BASE_URL}assets/pages/about-hero.png`} />
      <SubNav items={aboutSubNav} label="About sections" tabs />

      {/* History */}
      {tab === "history" && (
        <section className={styles.history}>
          <HistoryCarousel />
        </section>
      )}

      {/* Vision & Mission */}
      {tab === "vision" && (
        <section className={styles.vision}>
          <div className="container">
            <SectionTitle eyebrow="Core Values" title="Our Vision &" accent="Mission" />
            <div className={styles.visionRow}>
              {[vision, mission].map((v) => (
                <article key={v.title} className={styles.visionCard}>
                  <h3>{v.title}</h3>
                  <span className={styles.ornament} aria-hidden="true">
                    <span>✥</span>
                  </span>
                  <p>{v.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Objectives */}
      {tab === "objectives" && (
        <section className={styles.objectives}>
          <div className="container">
            <SectionTitle eyebrow="Objectives" title="How We Empower" accent="Industry" />
            <div className={styles.objectivesRow}>
              <img src={objectivesImage} alt="FTCCI members at the IITEX 2026 expo" loading="lazy" />
              <ul className={styles.objectiveGrid}>
                {objectives.map((o) => (
                  <li key={o.title}>
                    <h3>{o.title}</h3>
                    <p>{o.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Office bearers */}
      {tab === "office-bearers" && (
        <section className={styles.bearers}>
          <div className="container">
            <SectionTitle eyebrow="Leadership" title="Office" accent="Bearers" />
            <ul className={styles.bearerRow}>
              {leaders.map((l, i) => (
                <li key={l.name} className={`${styles.bearer} ${i === 1 ? styles.bearerRaised : ""}`}>
                  <CroppedImage src={l.image} crop={l.crop} alt={`Portrait of ${l.name}`} className={styles.bearerPhoto} />
                  <div className={styles.bearerCaption}>
                    <h3>{l.name}</h3>
                    <p>{l.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Managing committee */}
      {tab === "managing-committee" && (
        <section className={styles.committee}>
          <div className="container">
            <SectionTitle eyebrow="Managing Committee" title="Meet the Managing" accent="Committee" />
            <div className={styles.committePhoto}>
              <img src={committeeImage} alt="FTCCI Managing Committee at the 109th Annual General Meeting" loading="lazy" />
            </div>
            <div className={styles.panelTabs} role="tablist" aria-label="Committee panels">
              {committeePanels.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={panel === p}
                  className={`${styles.panelTab} ${panel === p ? styles.panelTabActive : ""}`}
                  onClick={() => setPanel(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className={styles.memberGrid} role="tabpanel">
              {members.length === 0 && <p className={styles.empty}>Members of {panel} will be listed here.</p>}
              {members.map((m) => (
                <article key={m.name} className={styles.member}>
                  <h3>{m.name}</h3>
                  <p>{m.company}</p>
                  <span>{m.panel}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Secretariat */}
      {tab === "secretariat" && (
        <section className={styles.secretariat}>
          <div className="container">
            <SectionTitle title="FTCCI" accent="Secretariat" />
            <p className={styles.secretariatIntro}>
              The work of the Federation is carried out by a Secretariat consisting of Secretary, Sr.Director, Director,
              Joint Directors, Deputy Director, Assistant Directors and Junior Officers in various Departments.
            </p>
            <ul className={styles.staffGrid}>
              {secretariat.map((s, i) => (
                <li key={i} className={styles.staff}>
                  <h3>{s.name}</h3>
                  <p>{s.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Past presidents */}
      {tab === "past-presidents" && (
        <section className={styles.presidents}>
          <div className="container">
            <SectionTitle title="Past" accent="Presidents" light />
            <ul className={styles.presidentGrid}>
              {pastPresidents.map((p) => (
                <li key={p.name} className={styles.president}>
                  <h3>{p.name}</h3>
                  <span>{p.term}</span>
                  <p>{p.company}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
