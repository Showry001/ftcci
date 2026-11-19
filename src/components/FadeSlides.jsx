import { useEffect, useRef, useState } from "react";
import Img from "./Img.jsx";
import styles from "./FadeSlides.module.css";

// Timing from the Figma animations page (Who We Are photo, 1246:6698): each photo stays for 0.8 s,
// then the next one fades in over 1.25 s.
const HOLD_MS = 800;
const FADE_MS = 1250;

// Photos that change one after another with a slow fade (Who We Are, Member Benefits). It pauses while
// the pointer or keyboard focus is on it, stays still off screen, and shows only the first photo for
// people who prefer reduced motion. `className` sizes the box; the photos fill it.
export default function FadeSlides({ photos, className = "", sizes }) {
  const items = (photos ?? []).map((p) => p?.image).filter((m) => m?.url);
  const [active, setActive] = useState(0);
  const box = useRef(null);

  useEffect(() => {
    if (items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = box.current;
    let visible = false;
    let held = false;
    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      if (!visible || held || document.hidden) return;
      timer = setTimeout(() => {
        setActive((i) => (i + 1) % items.length);
        schedule();
      }, HOLD_MS + FADE_MS);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    io.observe(el);
    const hold = (on) => () => {
      held = on;
      schedule();
    };
    const enter = hold(true);
    const leave = hold(false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", leave);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearTimeout(timer);
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", enter);
      el.removeEventListener("focusout", leave);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [items.length]);

  if (!items.length) return null;
  return (
    <div ref={box} className={`${styles.slides} ${className}`} style={{ "--fade": `${FADE_MS}ms` }}>
      {items.map((media, i) => (
        <Img
          key={media.id ?? i}
          media={media}
          sizes={sizes}
          // Only the photo on show is announced; the others are hidden from screen readers.
          aria-hidden={i === active ? undefined : "true"}
          className={i === active ? styles.active : undefined}
        />
      ))}
    </div>
  );
}
