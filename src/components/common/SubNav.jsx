import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import styles from "./SubNav.module.css";

// Sticky pill navigation under the page hero.
// Items with href "#id" scroll within the page (with scroll-spy); other hrefs are routes.
// With `tabs`, "#id" items switch the page's visible section instead (see useTab).
// With `mobile`, the bar stays visible on phones as wrapping pills (Publications).
export default function SubNav({ items, label = "Section navigation", variant = "light", tabs = false, mobile = false }) {
  const anchors = items.filter((i) => i.href.startsWith("#")).map((i) => i.href.slice(1));
  const [spied, setSpied] = useState(anchors[0]);
  const tab = useTab(tabs ? anchors : []);
  const active = tabs ? tab : spied;

  useEffect(() => {
    if (tabs || !anchors.length) return;
    const onScroll = () => {
      const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) + 90;
      let current = anchors[0];
      for (const id of anchors) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setSpied(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, anchors.join()]);

  return (
    <nav
      className={`${styles.bar} ${variant === "titleCase" ? styles.titleCase : ""} ${mobile ? styles.mobile : ""}`}
      aria-label={label}
      data-tabs={tabs || undefined}
    >
      <div className={styles.track}>
        {items.map((item) => {
          if (!item.href.startsWith("#")) {
            return (
              <NavLink key={item.href} to={item.href} end className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}>
                {item.label}
              </NavLink>
            );
          }
          const isActive = active === item.href.slice(1);
          const props = {
            className: `${styles.item} ${isActive ? styles.active : ""}`,
            "aria-current": isActive ? "true" : undefined,
          };
          return tabs ? (
            <Link key={item.href} to={{ hash: item.href }} {...props}>
              {item.label}
            </Link>
          ) : (
            <a key={item.href} href={item.href} {...props}>
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

// Section id selected by the URL hash, falling back to the first tab.
export function useTab(ids) {
  const { hash } = useLocation();
  const id = hash.slice(1);
  return ids.includes(id) ? id : ids[0];
}
