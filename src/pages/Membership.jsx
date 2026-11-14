import { useState } from "react";
import { useLoaderData } from "react-router";
import { membershipPanels } from "../../shared/forms.js";
import PageHero from "../components/common/PageHero.jsx";
import SubNav from "../components/common/SubNav.jsx";
import SectionTitle from "../components/common/SectionTitle.jsx";
import MembershipForm from "../components/MembershipForm.jsx";
import Img from "../components/Img.jsx";
import { single } from "../lib/content.server.js";
import { icons, pickIcons, subNav } from "../ui/assets.js";
import styles from "./Membership.module.css";

const { ctaArrowWhite, optionArrow, stepLine } = icons.membership;
const panelTitle = Object.fromEntries(membershipPanels.map((p) => [p.value, p.label]));
const no = (i) => String(i + 1).padStart(2, "0");

export async function loader({ request }) {
  return { page: await single("membership", request) };
}

export const meta = () => [
  { title: "Membership – FTCCI" },
  { name: "description", content: "Why join FTCCI, membership benefits and options, how to apply online, and the documents each panel needs." },
];

export default function Membership() {
  const { page } = useLoaderData();
  const { contacts, experienceStats, files, memberBenefits, options, panelDocuments, pillars, steps } = page;
  const [applying, setApplying] = useState(false);
  const apply = () => setApplying(true);

  return (
    <>
      <PageHero crumb="Home > Membership" title="Membership" />
      <SubNav items={subNav.membership} label="Membership sections" />

      <section id="why-join" className={styles.why} data-edit="membership.why">
        <div className="container">
          <h2 className={styles.bigTitle}>
            More than Membership.
            <br />
            A network built for <span>Growth</span>.
          </h2>
          <ol className={styles.pillars}>
            {pillars.map((p, i) => (
              <li key={p.title}>
                <span className={styles.pillarNo}>{no(i)}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="benefits" className={styles.benefits} data-edit="membership.benefits">
        <div className={styles.benefitsInner}>
          <SectionTitle eyebrow="Membership Benefits" title="Everything you need to move business forward." className={styles.titleBenefits} />
          <div className={styles.benefitsRow}>
            <Img media={page.benefitsPhoto} sizes="(min-width: 1200px) 600px, 100vw" />
            <ul className={styles.benefitList}>
              {memberBenefits.map((b) => (
                <li key={b.title}>
                  <span className={styles.benefitIcon}>
                    <img src={pickIcons.memberBenefit[b.icon]} alt="" width="28" height="28" />
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

      <section id="options" className={styles.options} data-edit="membership.options">
        <div className="container">
          <div className={styles.optionsHead}>
            <SectionTitle eyebrow="Membership Options" title="A Membership that fits your business." className={styles.titleOptions} />
            <p>
              Whether you're an established enterprise, growing company or emerging entrepreneur, FTCCI offers membership
              opportunities designed around your business journey.
            </p>
          </div>
          <div className={styles.optionGrid}>
            {options.map((o) => (
              <article key={o.panel} className={styles.option}>
                <span className={styles.optionIcon}>
                  <img src={pickIcons.membershipOption[o.icon]} alt="" width="30" height="30" />
                </span>
                <h3>{panelTitle[o.panel]}</h3>
                <p>{o.text}</p>
                <a href={`#docs-panel-${o.panel}`} className={styles.optionBtn}>
                  {o.cta} <img src={optionArrow} alt="" width="14" height="14" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className={styles.steps} data-edit="membership.apply">
        <div className="container">
          <div className={styles.stepsHead}>
            <p>How it works</p>
            <h2>Joining FTCCI is simple.</h2>
          </div>
          <ol className={styles.stepRow}>
            {steps.map((s, i) => (
              <li key={s.title} className={styles.stepItem}>
                <div className={styles.step}>
                  <span className={styles.stepNo}>{no(i)}</span>
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

          <div data-edit="membership.documents">
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
                  {files.map((f) => (
                    <li key={f.title}>
                      <a href={f.file?.url} download target="_blank" rel="noreferrer">
                        {f.title} <span aria-hidden="true">↓</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Life membership</h4>
                <p>{page.lifeMembership}</p>
              </div>
              <div>
                <h4>Membership desk</h4>
                <ul className={styles.applyContacts}>
                  {contacts.map((c) => (
                    <li key={c.email}>
                      <a href={`mailto:${c.email}`}>{c.email}</a>
                      <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className={styles.experience} data-edit="membership.experience">
        <Img className={styles.expBg} media={page.experienceImage} alt="" aria-hidden="true" sizes="100vw" />
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
