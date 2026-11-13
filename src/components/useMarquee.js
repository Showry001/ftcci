import { useCallback, useEffect, useRef, useState } from "react";

const SPEED = 40; // px per second, constant (no easing)
const JUMP_MS = 600;

// Continuous right-to-left strip for a track whose strip renders its `count` items twice.
// Dots jump to a page with a short slide, then the strip carries on from there. Hovering or focusing
// the strip pauses it; it stays still off screen and for people who prefer reduced motion.
export default function useMarquee(count) {
  const trackRef = useRef(null);
  const stripRef = useRef(null);
  const pos = useRef(0);
  const held = useRef(false);
  const jumpUntil = useRef(0);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const measure = useCallback(() => {
    const strip = stripRef.current;
    const loop = strip.children[count].offsetLeft - strip.children[0].offsetLeft;
    const step = loop / count;
    const perView = Math.max(1, Math.round(trackRef.current.clientWidth / step));
    return { loop, step, perView };
  }, [count]);

  useEffect(() => {
    const track = trackRef.current;
    const strip = stripRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let last = performance.now();
    let raf;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(track);

    const tick = (now) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      const { loop, step, perView } = measure();
      if (visible && !reduce.matches && !held.current && now > jumpUntil.current) {
        strip.style.transition = "";
        pos.current = (pos.current + SPEED * dt) % loop;
        strip.style.transform = `translate3d(${-pos.current}px, 0, 0)`;
      }
      const total = Math.ceil(count / perView);
      const first = Math.floor(((pos.current % loop) + step / 2) / step) % count;
      setPages(total);
      setPage(Math.min(total - 1, Math.floor(first / perView)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const hold = () => {
      held.current = true;
    };
    const release = () => {
      held.current = track.matches(":hover") || track.contains(document.activeElement);
    };
    track.addEventListener("mouseenter", hold);
    track.addEventListener("mouseleave", release);
    track.addEventListener("focusin", hold);
    track.addEventListener("focusout", release);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      track.removeEventListener("mouseenter", hold);
      track.removeEventListener("mouseleave", release);
      track.removeEventListener("focusin", hold);
      track.removeEventListener("focusout", release);
    };
  }, [count, measure]);

  const goTo = useCallback(
    (p) => {
      const strip = stripRef.current;
      const { loop, step, perView } = measure();
      let target = p * perView * step;
      // Slide forwards (right to left) where possible: the second copy stands in for the start of the strip.
      if (target < pos.current - step / 2) target += loop;
      jumpUntil.current = performance.now() + JUMP_MS;
      strip.style.transition = `transform ${JUMP_MS}ms var(--ease-out)`;
      strip.style.transform = `translate3d(${-target}px, 0, 0)`;
      pos.current = target % loop;
      // Once the slide ends, continue from the same picture in the first copy (no visible jump).
      window.setTimeout(() => {
        strip.style.transition = "";
        strip.style.transform = `translate3d(${-pos.current}px, 0, 0)`;
      }, JUMP_MS);
    },
    [measure]
  );

  return { trackRef, stripRef, page, pages, goTo };
}
