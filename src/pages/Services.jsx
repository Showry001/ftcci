import { useState } from "react";
import { useLoaderData } from "react-router";
import PageHero from "../components/common/PageHero.jsx";
import SubNav from "../components/common/SubNav.jsx";
import { useHallBooking } from "../components/HallBooking.jsx";
import Img from "../components/Img.jsx";
import { single } from "../lib/content.server.js";
import { icons, pickIcons, subNav } from "../ui/assets.js";
import styles from "./Services.module.css";

export async function loader({ request }) {
  return { page: await single("services", request) };
}

export const meta = () => [
  { title: "Services – FTCCI" },
  { name: "description", content: "Certificate of Origin, liaison, help desk, document certification, expert committees, CEO Forum, halls and downloads." },
];

const fileType = (file) => (file?.kind === "pdf" ? "PDF" : "JPG");

function Checklist({ items, icon, size = 16, className = "" }) {
  return (
    <ul className={`${styles.checklist} ${className}`}>
      {items.map((t) => (
        <li key={t}>
          <span className={styles.checkIcon}>
            <img src={icon} alt="" width={size} height={size} style={{ width: size, height: size }} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

function EnquireButton({ service }) {
  const [sent, setSent] = useState(false);
  return (
    <a
      className={styles.enquire}
      href={`mailto:info@ftcci.in?subject=${encodeURIComponent(`Enquiry: ${service}`)}`}
      onClick={() => setSent(true)}
    >
      {sent ? "Opening your email app…" : "Enquire about this service"}
    </a>
  );
}

// Downloads the file where the browser allows it, otherwise opens it in a new tab.
function FileList({ files }) {
  return (
    <ul className={styles.files}>
      {files.map((f) => (
        <li key={f.title}>
          <img src={icons.services.pdf} alt="" width="28" height="18" />
          <a href={f.file?.url} download target="_blank" rel="noreferrer">
            {f.title} <span className="visually-hidden">({fileType(f.file)})</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Services() {
  const d = { ...useLoaderData().page, icons: icons.services };
  const { openBooking } = useHallBooking();
  return (
    <>
      <PageHero crumb="Home > Services" title="Services" />
      <SubNav items={subNav.services} variant="titleCase" label="Services" />

      <section id="certificate-of-origin" className={`${styles.section} ${styles.white}`}>
        <div className={`container ${styles.coRow}`}>
          <div className={styles.coMain}>
            <h2 className={styles.h2}>Certificate of Origin</h2>
            <p className={styles.lead}>
              As an authorized trade body, FTCCI issues Non-Preferential Certificates of Origin to exporters. This essential
              document verifies the source country of exported products to satisfy custom requirements in importing
              destinations.
            </p>
            <div className={styles.coPhoto}>
              <Img media={d.coImage} sizes="(min-width: 1200px) 560px, 100vw" />
            </div>
            <Checklist items={d.coBullets} icon={d.icons.check} />
            <div className={styles.pricing}>
              <p className={styles.pricingTitle}>Certificate of Origin Pricing (Taxes Excluded)</p>
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Form</th>
                    <th>INR Pricing</th>
                  </tr>
                </thead>
                <tbody>
                  {d.coPricing.map((r) => (
                    <tr key={r.sno}>
                      <td>{r.sno}</td>
                      <td>{r.form}</td>
                      <td>{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <aside className={styles.contactCard}>
            <h3>Details &amp; contact</h3>
            <dl>
              {d.coContact.map((c) => (
                <div key={c.label}>
                  <dt>{c.label}</dt>
                  <dd>{c.href ? <a href={c.href}>{c.value}</a> : c.value}</dd>
                </div>
              ))}
            </dl>
            <hr />
            <p className={styles.filesLabel}>Files</p>
            <FileList files={d.coFiles} />
            <EnquireButton service="Certificate of Origin" />
          </aside>
        </div>
      </section>

      <section id="liaison" className={`${styles.section} ${styles.grey}`}>
        <div className={`container ${styles.split}`}>
          <div className={styles.splitText} style={{ maxWidth: 574 }}>
            <h2 className={styles.h2}>Liaison with Bodies</h2>
            <p className={styles.lead}>
              FTCCI acts as an important bridge between the business community and state/central government bodies. We
              actively communicate industry feedback, represent grievances, and participate in policy formation panels.
            </p>
            <Checklist items={d.liaisonBullets} icon={d.icons.checkDark} className={styles.checklistLg} />
          </div>
          <Img className={styles.splitImg} style={{ aspectRatio: "583 / 328" }} media={d.liaisonImage} sizes="(min-width: 1200px) 583px, 100vw" />
        </div>
      </section>

      <section id="help-desk" className={`${styles.section} ${styles.white}`}>
        <div className={`container ${styles.split} ${styles.splitReverse}`}>
          <Img className={styles.splitImg} style={{ aspectRatio: "498 / 340", maxWidth: 498 }} media={d.helpdeskImage} sizes="(min-width: 1200px) 498px, 100vw" />
          <div className={styles.splitText} style={{ maxWidth: 678 }}>
            <h2 className={`${styles.h2} ${styles.h2Sm}`}>Help Desk</h2>
            <p className={styles.lead} style={{ fontSize: 15 }}>
              Our dedicated member helpdesk provides direct assistance on everyday operational friction. From tax
              classification queries, local municipal clearances, to export permit issues, we provide reliable answers fast.
            </p>
            <Checklist items={d.helpdeskBullets} icon={d.icons.checkSm} size={12} />
          </div>
        </div>
      </section>

      <section id="certification" className={`${styles.section} ${styles.lavenderDeep}`}>
        <div className="container">
          <h2 className={styles.h2} style={{ color: "#0f1c52" }}>Certification of Documents</h2>
          <p className={styles.lead} style={{ maxWidth: 705, marginTop: 30, fontSize: 15, lineHeight: 1.65, color: "#5e6c84" }}>
            Members can leverage Federation resources for Document Certification. Those starting a new industry or dealing
            with banks and overseas buyers can have their documents verified and attested.
          </p>
          <ul className={styles.docCards}>
            {d.certificationCards.map((c) => (
              <li key={c.text}>
                <img src={pickIcons.certification[c.icon]} alt="" width="28" height="28" />
                <p>{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="expert-committee" className={`${styles.section} ${styles.white}`}>
        <div className="container">
          <h2 className={styles.h2}>Expert Committee</h2>
          <p className={styles.lead} style={{ maxWidth: 793, marginTop: 30, fontSize: 15, color: "#4d525e" }}>
            The Managing Committee supports members with advice from senior industry experts. Expert Committees advise
            members on issues and provide policy guidance to public authorities.
          </p>
          <ul className={styles.discs}>
            {d.expertBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className={styles.gridLabel}>The Expert Committees</p>
          <ol className={styles.committees}>
            {d.expertCommittees.map((c, i) => (
              <li key={c}>
                <span>{i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="ceo-forum" className={`${styles.section} ${styles.grey} ${styles.ceoForum}`}>
        <div className="container">
          <Img className={styles.banner} media={d.ceoImage} sizes="(min-width: 1200px) 1240px, 100vw" />
          <h2 className={`${styles.h2} ${styles.h2Sm}`} style={{ marginTop: 42 }}>CEO Forum</h2>
          <p className={styles.lead} style={{ maxWidth: 873, marginTop: 24, fontSize: 15, lineHeight: "22.5px", color: "#4b5563" }}>
            A platform for CEOs and senior business leaders to connect, exchange perspectives and discuss key industry and
            economic issues.
          </p>
          <Checklist items={d.ceoBullets} icon={d.icons.check} className={styles.checklistLg} />
        </div>
      </section>

      <section id="hall-booking" className={`${styles.section} ${styles.white}`}>
        <div className={`container ${styles.hallsRow}`}>
          <div className={styles.hallsMain}>
            <h2 className={styles.h2} style={{ color: "#0f2c52" }}>Halls &amp; Booking</h2>
            <p className={styles.lead} style={{ marginTop: 33, fontSize: 15.5, color: "#5f646d" }}>
              The Federation is in the city center, providing access to vast resources for Events, Conferences, Workshops,
              and more in air-conditioned halls. Check capacity and tariff below, then send your hall requisition.
            </p>
            <ul className={styles.dots}>
              {d.hallBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className={styles.venueTable}>
              <p className={styles.venueTitle}>Venues &amp; tariff at Federation House</p>
              <div className={styles.tableScroll}>
                <table>
                  <thead>
                    <tr>
                      <th>Venue</th>
                      <th>Deposit</th>
                      <th>4 hrs</th>
                      <th>8 hrs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.halls.map((h) => (
                      <tr key={h.name}>
                        <td>
                          {h.name}
                          <small>
                            {h.seats ? `${h.seats} seats` : h.area} · {h.floor}
                          </small>
                        </td>
                        <td>₹{h.deposit}</td>
                        <td>₹{h.h4}</td>
                        <td>₹{h.h8}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className={styles.venueNotes}>
                {d.hallNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
            <div className={styles.venueTable}>
              <p className={styles.venueTitle}>Equipment &amp; other charges</p>
              <table>
                <tbody>
                  {d.hallEquipment.map(({ item, price }) => (
                    <tr key={item}>
                      <td>{item}</td>
                      <td>₹{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.hallsSide}>
            <Img media={d.hallsImage} sizes="(min-width: 1200px) 400px, 100vw" />
            <aside className={`${styles.contactCard} ${styles.hallCard}`}>
              <h3>Details &amp; contact</h3>
              <dl>
                {d.hallContact.map((c) => (
                  <div key={c.label}>
                    <dt>{c.label}</dt>
                    <dd className={c.href?.startsWith("mailto:") ? styles.ddAccent : !c.href && c.value.length > 40 ? styles.ddRegular : ""}>
                      {c.href ? <a href={c.href}>{c.value}</a> : c.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <hr />
              <p className={styles.filesLabel}>Files</p>
              <FileList
                files={[
                  { title: "FTCCI halls flyer", file: d.hallFlyer },
                  { title: "Hall requisition form", file: d.hallForm },
                ].filter((f) => f.file)}
              />
              <button type="button" className={styles.enquire} aria-haspopup="dialog" onClick={openBooking}>
                Hall Booking
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section id="downloads" className={`${styles.section} ${styles.lavender}`}>
        <div className="container">
          <p className={styles.attachEyebrow}>Attachments</p>
          <h2 className={styles.h2} style={{ color: "#0c1c3e", lineHeight: 1.2, marginTop: 12 }}>Forms, guidelines &amp; downloads</h2>
          <ul className={styles.attachments}>
            {d.downloads.map((f) => (
              <li key={f.title}>
                <a href={f.file?.url} download target="_blank" rel="noreferrer">
                  <span className={styles.badge}>{fileType(f.file)}</span>
                  {f.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
