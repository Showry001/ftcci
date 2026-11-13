import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, useRouteError } from "react-router";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/500.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/900.css";
import "@fontsource/arimo/400.css";
import "@fontsource/arimo/600.css";
import "@fontsource/arimo/700.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/motion.css";

export const SITE_NAME = "FTCCI – The Federation of Telangana Chambers of Commerce and Industry";
export const SITE_DESCRIPTION = "Empowering Industries. Shaping Telangana's Future. FTCCI has championed trade and industry across Telangana since 1917.";

export const meta = () => [{ title: SITE_NAME }, { name: "description", content: SITE_DESCRIPTION }];

// Pages may be cached briefly by the web server; staff previews never are.
export function headers({ loaderHeaders }) {
  return { "Cache-Control": loaderHeaders.get("Cache-Control") ?? "public, max-age=0, s-maxage=60, stale-while-revalidate=300" };
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href={`${import.meta.env.BASE_URL}assets/header/logo.png`} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const unavailable = isRouteErrorResponse(error) && error.status === 503;
  if (!isRouteErrorResponse(error)) console.error(error);
  return (
    <main style={{ padding: "96px 24px", textAlign: "center", fontFamily: "var(--font-body)", color: "var(--navy-900)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 32 }}>{unavailable ? "Back soon" : "Something went wrong"}</h1>
      <p style={{ marginTop: 12, color: "var(--slate-600)" }}>
        {unavailable ? error.data : "Please refresh the page, or come back in a few minutes."}
      </p>
      <p style={{ marginTop: 24 }}>
        <a href={import.meta.env.BASE_URL} style={{ color: "var(--navy-900)", fontWeight: 600, textDecoration: "underline" }}>Go to the home page</a>
      </p>
    </main>
  );
}
