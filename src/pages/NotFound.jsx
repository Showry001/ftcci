import { data, Link } from "react-router";
import PageHero from "../components/common/PageHero.jsx";

// Unknown addresses render this page with a real 404 status.
export const loader = () => data(null, { status: 404 });
export const meta = () => [{ title: "Page not found – FTCCI" }];

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
