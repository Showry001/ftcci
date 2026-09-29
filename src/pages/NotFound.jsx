import { Link } from "react-router-dom";
import PageHero from "../components/common/PageHero.jsx";

export default function NotFound() {
  return (
    <>
      <PageHero crumb="Home > Not found" title="Page not found" />
      <section className="container" style={{ padding: "64px 0", textAlign: "center" }}>
        <p style={{ marginBottom: 24, color: "var(--slate-600)" }}>The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" style={{ color: "var(--navy-900)", fontWeight: 600, textDecoration: "underline" }}>Back to home</Link>
      </section>
    </>
  );
}
