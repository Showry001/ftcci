import { useState } from "react";
import PageHero from "../components/common/PageHero.jsx";
import styles from "./Contact.module.css";

const a = (p) => `/assets/${p}`;
const icons = {
  chevron: a("contact/icon-chevron-down.svg"),
  send: a("contact/icon-send.svg"),
  phone: a("contact/icon-phone.svg"),
  mail: a("contact/icon-mail.svg"),
  globe: a("contact/icon-globe.svg"),
};
// Subject options are not specified in the design; adjust as needed.
const subjects = ["General enquiry", "Membership", "Certificate of Origin", "Halls & Booking", "Events", "Media & Press"];

export default function Contact() {
  const [values, setValues] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    if (!agree) {
      setStatus({ ok: false, msg: "Please accept the Privacy Policy and Terms & Conditions." });
      return;
    }
    // TODO: POST to the FTCCI enquiry endpoint.
    setStatus({ ok: true, msg: "Thank you — your message has been sent. Our team will get back to you shortly." });
    setValues({ name: "", email: "", phone: "", subject: "", message: "" });
    setAgree(false);
  };

  return (
    <>
      <PageHero crumb="Home > Contact" title="Contact Us" />
      <section className={styles.section}>
        <div className="container">
          <div className={styles.row}>
            <form className={styles.form} onSubmit={submit} noValidate>
              <div>
                <h2 className={styles.formTitle}>Send Us a Message</h2>
                <p className={styles.formSub}>Fill in the details below and our team will get back to you shortly.</p>
              </div>
              <div className={styles.fields}>
                <label className={styles.field}>
                  <span>Full Name <em>*</em></span>
                  <input required value={values.name} onChange={set("name")} placeholder="Enter your full name" autoComplete="name" />
                </label>
                <label className={styles.field}>
                  <span>Email Address <em>*</em></span>
                  <input required type="email" value={values.email} onChange={set("email")} placeholder="Enter your email address" autoComplete="email" />
                </label>
                <label className={styles.field}>
                  <span>Phone Number</span>
                  <input type="tel" value={values.phone} onChange={set("phone")} placeholder="Enter your phone number" autoComplete="tel" />
                </label>
                <label className={styles.field}>
                  <span>Subject <em>*</em></span>
                  <span className={styles.select}>
                    <select required value={values.subject} onChange={set("subject")}>
                      <option value="" disabled>Select a subject</option>
                      {subjects.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <img src={icons.chevron} alt="" width="16" height="16" />
                  </span>
                </label>
                <label className={styles.field}>
                  <span>Message <em>*</em></span>
                  <textarea required rows={5} value={values.message} onChange={set("message")} placeholder="Type your message here..." />
                </label>
              </div>
              <label className={styles.consent}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>
                  I agree to the <a href="#privacy">Privacy Policy</a> and <a href="#terms">Terms &amp; Conditions</a>.
                </span>
              </label>
              <button type="submit" className={styles.submit}>
                Send Message <img src={icons.send} alt="" width="14" height="14" />
              </button>
              {status && (
                <p role="status" className={status.ok ? styles.ok : styles.err}>{status.msg}</p>
              )}
            </form>

            <div className={styles.side}>
              <div className={styles.office}>
                <h2>Our Office</h2>
                <div className={styles.address}>
                  <h3>The Federation of Telangana Chambers of Commerce and Industry</h3>
                  <address>
                    Federation House
                    <br />
                    11-6-841, Red Hills,
                    <br />
                    Hyderabad 500004, Telangana. India.
                  </address>
                </div>
                <ul className={styles.details}>
                  <li><img src={icons.phone} alt="" width="16" height="16" /><a href="tel:+914023395515">91-40-23395515,16,17</a></li>
                  <li><img src={icons.mail} alt="" width="16" height="16" /><a href="mailto:info@ftcci.in">info@ftcci.in</a></li>
                  <li><img src={icons.globe} alt="" width="16" height="16" /><a href="https://www.ftcci.in" target="_blank" rel="noreferrer">www.ftcci.in</a></li>
                </ul>
                <p className={styles.desks}>
                  <strong>Certificate of Origin :</strong> <a href="tel:+914023395525">91-40-23395525</a>
                  <br />
                  <strong>Membership Desk :</strong> <a href="tel:+914023395524">91- 40-23395524</a>
                </p>
              </div>
              <div className={styles.donate}>
                <h3>DONATION to THE FEDERATION</h3>
                <p>
                  The Cheque/DD is to be drawn in favour of FTCCI payble at Hyderabad.
                  <br />
                  For Neft/RTGS : FTCCI, SBI, Bazarghat (Br), Hyderabad
                </p>
                <p className={styles.razor}>
                  Through Razor Pay Payment Gateway :{" "}
                  <a href="https://rzp.io/rzp/donationtoftcci" target="_blank" rel="noreferrer">https://rzp.io/rzp/donationtoftcci</a>
                </p>
              </div>
            </div>
          </div>

          {/* The Figma map is a placeholder screenshot; a live map of Federation House is embedded instead. */}
          <div className={styles.map}>
            <iframe
              title="Map to Federation House, Red Hills, Hyderabad"
              src="https://www.google.com/maps?q=Federation%20House%2C%2011-6-841%20Red%20Hills%2C%20Hyderabad%20500004&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
