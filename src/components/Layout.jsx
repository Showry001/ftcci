import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import useReveal from "./useReveal.js";

// Shared shell: header + page + footer. Scrolls to top (or to #hash) on navigation.
export default function Layout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef(null);
  useReveal(mainRef, pathname);
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
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
