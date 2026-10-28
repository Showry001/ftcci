import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import useReveal from "./useReveal.js";

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
    <>
      <Header />
      <main id="main" key={pathname} ref={mainRef} className="page-enter">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
