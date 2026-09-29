import PageHero from "../components/common/PageHero.jsx";
import SubNav from "../components/common/SubNav.jsx";
import SectionTitle from "../components/common/SectionTitle.jsx";
import {
  benefitsPhoto, ctaArrowWhite, experienceBg, experienceStats, memberBenefits,
  membershipOptions, membershipSubNav, optionArrow, pillars, stepLine, steps,
} from "../data/membership.js";
import styles from "./Membership.module.css";

export default function Membership() {
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
          <SectionTitle eyebrow="Membership Benefits" title="Everything you need to move business forward." />
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
            <SectionTitle eyebrow="Membership Options" title="A membership that fits your business." />
            <p>
              Whether you're an established enterprise, growing company or emerging entrepreneur, FTCCI offers membership
              opportunities designed around your business journey.
            </p>
          </div>
          <div className={styles.optionGrid}>
            {membershipOptions.map((o) => (
              <article key={o.title} className={styles.option}>
                <span className={styles.optionIcon}>
                  <img src={o.icon} alt="" width={o.iconSize} height={o.iconSize} style={{ width: o.iconSize, height: o.iconSize }} />
                </span>
                <h3>{o.title}</h3>
                <p>{o.text}</p>
                <a href="#apply" className={styles.optionBtn}>
                  Explore Corporate Membership <img src={optionArrow} alt="" width="14" height="14" />
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
            <a href="#apply" className={styles.ctaBtn}>
              Apply for Membership <img src={ctaArrowWhite} alt="" width="16" height="16" />
            </a>
            <p>
              Already a member? <a href="#login">Member Login →</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
