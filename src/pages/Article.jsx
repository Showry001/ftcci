import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from "react-router";
import { CoverImage } from "../components/Img.jsx";
import { isPreview, item } from "../lib/content.server.js";
import { dayMonthYear } from "../lib/format.js";
import NotFound from "./NotFound.jsx";
import hero from "./EventDetail.module.css";
import styles from "./Article.module.css";

export async function loader({ params, request }) {
  const article = await item("article", params.slug, request);
  const ogImage = article.image ? new URL(article.image.url, request.url).href : null;
  return Response.json({ article, ogImage }, isPreview(request) ? { headers: { "Cache-Control": "private, no-store" } } : undefined);
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  throw error;
}

export const meta = ({ data }) =>
  data
    ? [
        { title: `${data.article.title} – FTCCI` },
        { name: "description", content: data.article.excerpt ?? data.article.title },
        { property: "og:title", content: data.article.title },
        ...(data.ogImage ? [{ property: "og:image", content: data.ogImage }] : []),
      ]
    : [];

// A news story or press release (no Figma frame; laid out like the event detail page).
export default function Article() {
  const { article: a } = useLoaderData();
  return (
    <>
      <section className={hero.hero}>
        <div className={hero.heroText}>
          <span className={hero.tag}>{a.tag}</span>
          <h1>{a.title}</h1>
          <p>
            <time dateTime={a.date}>{dayMonthYear(a.date)}</time>
          </p>
        </div>
        <CoverImage media={a.image} alt="" className={hero.heroImg} sizes="(min-width: 1200px) 727px, 100vw" loading="eager" />
      </section>

      <section className={hero.body}>
        <div className={hero.inner}>
          <nav className={hero.crumbs} aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link to="/media">Media</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{a.title}</span>
          </nav>
          <article className={styles.story}>
            {a.excerpt && <p className={styles.lead}>{a.excerpt}</p>}
            {/* Stored HTML is cleaned by the API when it is saved: basic formatting and safe links only. */}
            {a.body && <div className={styles.body} dangerouslySetInnerHTML={{ __html: a.body }} />}
            <Link to="/media" className={styles.back}>← All news</Link>
          </article>
        </div>
      </section>
    </>
  );
}
