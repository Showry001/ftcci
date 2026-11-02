import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { single } from "../lib/content.server.js";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { HallBookingProvider } from "./HallBooking.jsx";
import useReveal from "./useReveal.js";

// Footer details and the hall list for the booking dialog are needed on every page.
export async function loader({ request }) {
  const [site, services] = await Promise.all([single("site", request), single("services", request)]);
  return { site, halls: services.halls, hallForm: services.hallForm };
}

// Shared shell: header + page + footer. Scrolls to top (or to #hash) on navigation.
export default function Layout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef(null);
  const prevPath = useRef(pathname);
  useReveal(mainRef, pathname);
  useEffect(() => {
    const samePage = prevPath.current === pathname;
    prevPath.current = pathname;
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
      // Tabbed pages pick their section from the hash: on a tab switch, keep the reader at the tab's top.
      const tabs = samePage && document.querySelector("[data-tabs]");
      if (tabs) {
        const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) + tabs.offsetHeight;
        const top = tabs.nextElementSibling.getBoundingClientRect().top + window.scrollY - offset;
        if (window.scrollY > top) window.scrollTo({ top, behavior: "instant" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <HallBookingProvider>
      <Header />
      <main id="main" key={pathname} ref={mainRef} className="page-enter">
        <Outlet />
      </main>
      <Footer />
    </HallBookingProvider>
  );
}
