import { Link } from "react-router-dom";
import styles from "./CtaBand.module.css";

// Yellow "Become part of Telangana's business voice" band (MembershipCta).
export default function CtaBand({
  title = "Become part of Telangana's business voice",
  text = "Joint the Federation today and connect with thousands of industry leaders across the state.",
  cta = "Apply for Membership",
  to = "/membership#apply",
}) {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <Link to={to} className={styles.btn}>{cta}</Link>
      </div>
    </section>
  );
}
