import { useMemo, useState } from "react";
import SubNav from "../components/common/SubNav.jsx";
import {
  advantages, benefits, eligibility, faqs, heroCard, heroFeatures, icons, partnerFilters, partners, portal,
  privilegeContact, privilegeSubNav, steps,
} from "../data/privilege.js";
import styles from "./PrivilegeCard.module.css";

const FIRST_ROWS = 9;

function External({ href, className, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

export default function PrivilegeCard() {
  const [filter, setFilter] = useState(partnerFilters[0]);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partners.filter(
      (p) =>
        (filter === "All partners" || p.category === filter) &&
        (!q || `${p.name} ${p.location} ${p.category}`.toLowerCase().includes(q))
    );
  }, [filter, query]);
  const visible = showAll ? matches : matches.slice(0, FIRST_ROWS);

  const pickFilter = (f) => {
    setFilter(f);
    setShowAll(false);
  };
  const explore = (category) => {
    pickFilter(category);
    setQuery("");
    document.getElementById("partners").scrollIntoView();
  };

  return (
    <>
      <SubNav items={privilegeSubNav} label="Privilege Card sections" />

      <section className={styles.hero}>
        <div className={`container ${styles.heroRow}`}>
          <div className={styles.heroCopy}>
            <h1>
              FTCCI
              <br />
              <span>Privilege Card.</span>
            </h1>
            <p className={styles.heroSub}>
              A privilege for you.
              <br />
              A benefit for your family.
            </p>
            <p className={styles.heroText}>
              Your gateway to better health and happier benefits, with exclusive savings from our trusted partner network.
            </p>
            <div className={styles.heroCtas}>
              <External href={portal.register} className={styles.goldBtn}>
                Get Your Card <span aria-hidden="true">↗</span>
              </External>
              <a href="#benefits" className={styles.lineBtn}>
                Explore Benefits <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p className={styles.logins}>
              Already registered? <External href={portal.companyLogin}>Company login</External> ·{" "}
              <External href={portal.employeeLogin}>Employee login</External>
            </p>
          </div>
          <img className={styles.heroCard} src={heroCard} alt="The FTCCI Privilege Card" width="620" height="470" />
        </div>
        <div className="container">
          <ul className={styles.features}>
            {heroFeatures.map((f) => (
              <li key={f.title}>
                <img src={f.icon} alt="" width={f.w} height={f.h} />
                <div>
                  <h2>{f.title}</h2>
                  <p>{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.advantage}>
        <div className="container">
          <div className={styles.advPanel}>
            <div className={styles.advCopy}>
              <p className={styles.advEyebrow}>Member-first healthcare</p>
              <h2>
                The FTCCI
                <br />
                Healthcare <span>Advantage.</span>
              </h2>
              <p>More than a card. It is our commitment to supporting a healthier business community with meaningful access to care.</p>
            </div>
            <ol className={styles.advList}>
              {advantages.map((x, i) => (
                <li key={x.title}>
                  <span className={styles.advNo}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{x.title}</h3>
                    <p>{x.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="benefits" className={styles.benefits}>
        <div className="container">
          <div className={styles.benefitsHead}>
            <div>
              <p className={styles.eyebrow}>More value. More moments.</p>
              <h2 className={styles.h2}>
                One card. <span>A world of benefits.</span>
              </h2>
            </div>
            <p>Thoughtfully chosen healthcare and lifestyle privileges for you and the people who matter.</p>
          </div>
          <ul className={styles.benefitGrid}>
            {benefits.map((b, i) => (
              <li key={b.title}>
                <div className={styles.benefitTop}>
                  <span className={styles.benefitIcon}>
                    <img src={b.icon} alt="" width={b.w} height={b.h} />
                  </span>
                  <span className={styles.benefitNo}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
                <button type="button" className={styles.benefitLink} onClick={() => explore(b.category)}>
                  Explore partners <span aria-hidden="true">↗</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className={styles.steps}>
        <div className="container">
          <h2 className={`${styles.h2} ${styles.center}`}>
            Your benefits, in <span>three steps.</span>
          </h2>
          <ol className={styles.stepRow}>
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className={styles.stepNo}>{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <p className={styles.reminder}>
            Always carry your FTCCI Privilege Card (physical or e-card) and a valid Aadhaar card to partner locations. Both
            are needed to verify your identity.
          </p>
        </div>
      </section>

      <section id="eligibility" className={styles.community}>
        <div className={`container ${styles.communityRow}`}>
          <div className={styles.communityCopy}>
            <p className={styles.eyebrow}>A privilege that extends further</p>
            <h2 className={styles.h2}>
              For our community.
              <br />
              <span>And those closest to you.</span>
            </h2>
            <p>
              Because well-being is better when shared. The FTCCI Privilege Card brings meaningful benefits to our members,
              their teams and their families.
            </p>
            <External href={portal.register} className={styles.outlineBtn}>
              Get Your Card <span aria-hidden="true">↗</span>
            </External>
          </div>
          <ul className={styles.eligibleList}>
            {eligibility.map((e) => (
              <li key={e.title}>
                <span className={e.full ? styles.eligibleIconFull : styles.eligibleIcon}>
                  <img src={e.icon} alt="" width={e.w} height={e.h} />
                </span>
                <div>
                  <h3>{e.title}</h3>
                  <p>{e.text}</p>
                </div>
                <span className={styles.check} aria-hidden="true">✓</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="partners" className={styles.partners}>
        <div className="container">
          <p className={styles.eyebrowSm}>Our trusted partner network</p>
          <h2 className={styles.h2}>
            Great care. <span>Closer to you.</span>
          </h2>
          <div className={styles.partnerBar}>
            <div className={styles.filters} role="group" aria-label="Partner type">
              {partnerFilters.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  className={filter === f ? styles.filterOn : undefined}
                  onClick={() => pickFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <label className={styles.search}>
              <img src={icons.search} alt="" width="15" height="15" />
              <span className="visually-hidden">Find a partner</span>
              <input
                type="search"
                placeholder="Find a partner"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowAll(false);
                }}
              />
            </label>
          </div>

          {matches.length === 0 ? (
            <p className={styles.empty}>No partners match “{query}”.</p>
          ) : (
            <ul className={styles.partnerGrid}>
              {visible.map((p) => (
                <li key={p.name} className={styles.partner}>
                  <div className={styles.logo}>
                    <img src={p.logo} alt={`${p.name} logo`} width={p.w} height={p.h} loading="lazy" />
                  </div>
                  <p className={styles.category}>{p.category}</p>
                  <h3>{p.name}</h3>
                  <p className={styles.location}>
                    <img src={icons.pin} alt="" width="10" height="11" />
                    {p.location}
                  </p>
                  <External href={portal.benefits} className={styles.privileges}>
                    View privileges <img src={icons.arrow} alt="" width="10" height="10" />
                  </External>
                </li>
              ))}
            </ul>
          )}
          {matches.length > FIRST_ROWS && (
            <button type="button" className={styles.viewMore} aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
              {showAll ? "View Less" : "View More"}
            </button>
          )}
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <h2>Ready to Transform Your Employee Healthcare?</h2>
          <p>Join the growing network of companies providing better healthcare benefits</p>
          <div className={styles.ctaBtns}>
            <External href={portal.register} className={styles.ctaGold}>
              Register Your Company <span aria-hidden="true">→</span>
            </External>
            <External href={portal.benefits} className={styles.ctaLine}>
              View Employee Benefits
            </External>
          </div>
        </div>
      </section>

      <section id="faqs" className={styles.faqs}>
        <div className="container">
          <h2 className={styles.faqTitle}>
            Your questions. <span>Answered.</span>
          </h2>
          <div className={styles.faqGrid}>
            {faqs.map((f) => (
              <details key={f.q} className={styles.faq}>
                <summary>
                  {f.q}
                  <img src={icons.plus} alt="" width="10" height="10" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className={styles.help}>
            Still have a question? Write to <a href={`mailto:${privilegeContact.email}`}>{privilegeContact.email}</a> or
            call{" "}
            {privilegeContact.phones.map((ph, i) => (
              <span key={ph.tel}>
                {i > 0 && " / "}
                <a href={`tel:${ph.tel}`}>{ph.label}</a>
              </span>
            ))}{" "}
            ({privilegeContact.hours}).
          </p>
        </div>
      </section>
    </>
  );
}
