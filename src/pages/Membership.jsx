import { useState } from "react";
import PageHero from "../components/common/PageHero.jsx";
import SubNav from "../components/common/SubNav.jsx";
import SectionTitle from "../components/common/SectionTitle.jsx";
import MembershipForm from "../components/MembershipForm.jsx";
import {
  benefitsPhoto, ctaArrowWhite, experienceBg, experienceStats, memberBenefits, membershipContacts,
  membershipFiles, membershipOptions, membershipSubNav, optionArrow, panelDocuments, pillars, stepLine, steps,
} from "../data/membership.js";
import styles from "./Membership.module.css";

export default function Membership() {
  const [applying, setApplying] = useState(false);
  const apply = () => setApplying(true);

  return (
    <>
      <PageHero crumb="Home > Membership" title="Membership" />
      <SubNav items={membershipSubNav} label="Membership sections" />

      <section id="why-join" className={styles.why}>
        <div className="container">
          <h2 className={styles.bigTitle}>
            More than Membership.
            <br />
            A network built for <span>Growth</span>.
          </h2>
          <ol className={styles.pillars}>
            {pillars.map((p) => (
              <li key={p.n}>
                <span className={styles.pillarNo}>{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="benefits" className={styles.benefits}>
        <div className={styles.benefitsInner}>
          <SectionTitle eyebrow="Membership Benefits" title="Everything you need to move business forward." className={styles.titleBenefits} />
          <div className={styles.benefitsRow}>
            <img src={benefitsPhoto} alt="FTCCI members at the Parishrama Adalat conciliation conclave" loading="lazy" />
            <ul className={styles.benefitList}>
              {memberBenefits.map((b) => (
                <li key={b.title}>
                  <span className={styles.benefitIcon}>
                    <img src={b.icon} alt="" width="28" height="28" />
                  </span>
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="options" className={styles.options}>
        <div className="container">
          <div className={styles.optionsHead}>
            <SectionTitle eyebrow="Membership Options" title="A Membership that fits your business." className={styles.titleOptions} />
            <p>
              Whether you're an established enterprise, growing company or emerging entrepreneur, FTCCI offers membership
              opportunities designed around your business journey.
            </p>
          </div>
          <div className={styles.optionGrid}>
            {membershipOptions.map((o) => (
              <article key={o.title} className={styles.option}>
                <span className={styles.optionIcon}>
                  <img src={o.icon} alt="" width="30" height="30" />
                </span>
                <h3>{o.title}</h3>
                <p>{o.text}</p>
                <a href={`#docs-panel-${o.panel}`} className={styles.optionBtn}>
                  {o.cta} <img src={optionArrow} alt="" width="14" height="14" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className={styles.steps}>
        <div className="container">
          <div className={styles.stepsHead}>
            <p>How it works</p>
            <h2>Joining FTCCI is simple.</h2>
          </div>
          <ol className={styles.stepRow}>
            {steps.map((s, i) => (
              <li key={s.n} className={styles.stepItem}>
                <div className={styles.step}>
                  <span className={styles.stepNo}>{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                {i < steps.length - 1 && <img className={styles.stepLine} src={stepLine} alt="" width="64.5" height="7.36" />}
              </li>
            ))}
          </ol>
          <p className={styles.applyNow}>
            <button type="button" className={styles.ctaBtn} onClick={apply}>
              Apply Online <img src={ctaArrowWhite} alt="" width="16" height="16" />
            </button>
          </p>

          <div className={styles.docsHead}>
            <h3>Documents to file with your application</h3>
            <p>
              Membership is approved by the Managing Committee and the FTCCI Secretariat. All documents need to be
              self-attested.
            </p>
          </div>
          <ul className={styles.docsGrid}>
            {panelDocuments.map((p) => (
              <li key={p.panel} id={`docs-panel-${p.panel}`} className={styles.docsCard}>
                <h4>{p.title}</h4>
                <ul>
                  {p.docs.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className={styles.applyInfo}>
            <div>
              <h4>Forms &amp; downloads</h4>
              <ul className={styles.applyFiles}>
                {membershipFiles.map((f) => (
                  <li key={f.title}>
                    <a href={f.href} download target="_blank" rel="noreferrer">
                      {f.title} <span aria-hidden="true">↓</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Life membership</h4>
              <p>Apart from the admission fee, the life membership fee is ten times the annual subscription.</p>
            </div>
            <div>
              <h4>Membership desk</h4>
              <ul className={styles.applyContacts}>
                {membershipContacts.map((c) => (
                  <li key={c.email}>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                    <a href={`tel:${c.tel}`}>{c.phone}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className={styles.experience}>
        <img className={styles.expBg} src={experienceBg} alt="" aria-hidden="true" />
        <div className={styles.expTint} aria-hidden="true" />
        <div className={`container ${styles.expInner}`}>
          <p className={styles.expEyebrow}>The FTCCI Experience</p>
          <h2>Where businesses connect, collaborate and grow.</h2>
          <p className={styles.expText}>
            From corporate dialogues and industry forums to networking luncheons, FTCCI curates dynamic environments that
            allow business ideas to translate into commercial reality.
          </p>
          <dl className={styles.expStats}>
            {experienceStats.map((s) => (
              <div key={s.label}>
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div>
            <h2>Your business belongs in the conversation.</h2>
            <p>Become part of Telangana's leading business network and unlock opportunities to connect, influence and grow.</p>
          </div>
          <div className={styles.ctaActions}>
            <button type="button" className={styles.ctaBtn} onClick={apply}>
              Apply for Membership <img src={ctaArrowWhite} alt="" width="16" height="16" />
            </button>
          </div>
        </div>
      </section>
      <MembershipForm open={applying} onClose={() => setApplying(false)} />
    </>
  );
}
