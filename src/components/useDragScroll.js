import { useEffect } from "react";

// Mouse drag-to-scroll for scroll-snap carousels (touch and trackpads already scroll natively).
// Snapping is paused while dragging; on release the track settles on the next slide in the drag direction.
export default function useDragScroll(ref) {
  useEffect(() => {
    const el = ref.current;
    let startX = 0;
    let startLeft = 0;
    let pointer = null;
    let moved = false;
    let settleTimer;

    const release = () => {
      clearTimeout(settleTimer);
      delete el.dataset.dragging;
    };

    const down = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      pointer = e.pointerId;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const move = (e) => {
      if (e.pointerId !== pointer) return;
      const dx = e.clientX - startX;
      if (!moved) {
        if (Math.abs(dx) < 5) return;
        moved = true;
        clearTimeout(settleTimer);
        el.setPointerCapture(pointer);
        el.dataset.dragging = "";
      }
      el.scrollLeft = startLeft - dx;
    };
    const up = (e) => {
      if (e.pointerId !== pointer) return;
      pointer = null;
      if (!moved) return;
      const base = el.firstElementChild.offsetLeft;
      const lefts = [...el.children].map((c) => c.offsetLeft - base);
      const at = el.scrollLeft;
      let i = lefts.findLastIndex((l) => l <= at + 1);
      if (at > startLeft && at - lefts[Math.max(i, 0)] > 1) i += 1;
      const target = lefts[Math.max(0, Math.min(lefts.length - 1, i))];
      el.scrollTo({ left: target, behavior: "smooth" });
      // Turn snapping back on once the settle animation ends (scrollend, or a timeout where unsupported).
      el.addEventListener("scrollend", release, { once: true });
      settleTimer = setTimeout(release, 700);
    };
    // A drag must not also count as a click on whatever is under the pointer.
    const click = (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    return () => {
      release();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
    };
  }, [ref]);
}
