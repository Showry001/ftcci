import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./SubNav.module.css";

// Sticky pill navigation under the page hero.
// Items with href "#id" scroll within the page (with scroll-spy); other hrefs are routes.
export default function SubNav({ items, label = "Section navigation", variant = "light" }) {
  const anchors = items.filter((i) => i.href.startsWith("#")).map((i) => i.href.slice(1));
  const [active, setActive] = useState(anchors[0]);

  useEffect(() => {
    if (!anchors.length) return;
    const onScroll = () => {
      const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) + 90;
      let current = anchors[0];
      for (const id of anchors) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchors.join()]);

  return (
    <nav className={`${styles.bar} ${variant === "dark" ? styles.dark : ""}`} aria-label={label}>
      <div className={styles.track}>
        {items.map((item) =>
          item.href.startsWith("#") ? (
            <a
              key={item.href}
              href={item.href}
              className={`${styles.item} ${active === item.href.slice(1) ? styles.active : ""}`}
              aria-current={active === item.href.slice(1) ? "true" : undefined}
            >
              {item.label}
            </a>
          ) : (
            <NavLink key={item.href} to={item.href} end className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}>
              {item.label}
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
}
