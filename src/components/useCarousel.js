import { useCallback, useEffect, useRef, useState } from "react";

// Scroll-snap carousel: works with touch/trackpad swipe and exposes prev/next + page dots.
export default function useCarousel() {
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const total = Math.max(1, Math.round(el.scrollWidth / el.clientWidth + 0.49) || 1);
    setPages(Math.max(1, Math.ceil((el.scrollWidth - 2) / el.clientWidth)));
    const max = el.scrollWidth - el.clientWidth;
    const p = max <= 0 ? 0 : Math.round((el.scrollLeft / max) * (Math.ceil((el.scrollWidth - 2) / el.clientWidth) - 1));
    setPage(p);
    return total;
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const goTo = useCallback((p) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const count = Math.max(1, Math.ceil((el.scrollWidth - 2) / el.clientWidth));
    const clamped = Math.max(0, Math.min(count - 1, p));
    el.scrollTo({ left: count <= 1 ? 0 : (max * clamped) / (count - 1), behavior: "smooth" });
  }, []);

  return {
    trackRef,
    page,
    pages,
    goTo,
    prev: () => goTo(page - 1),
    next: () => goTo(page + 1),
    canPrev: page > 0,
    canNext: page < pages - 1,
  };
}
