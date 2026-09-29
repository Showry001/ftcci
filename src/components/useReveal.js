import { useEffect } from "react";

// Containers whose children are "cards" that should cascade in one after another.
const ITEM_PARENTS = 'ul, ol, [class*="grid" i], [class*="cards" i], [class*="track" i], [class*="list" i]';
const ITEMS = `section :is(${ITEM_PARENTS}) > :is(li, article, a, div)`;
const STAGGER_MS = 70;
const MAX_STAGGER = 6;

// Fades sections (and the cards inside them) up as they scroll into view.
// Opt out with data-no-reveal on an element. Runs again for each route (`key`).
export default function useReveal(rootRef, key) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        const shown = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        let i = 0;
        for (const { target: el } of shown) {
          io.unobserve(el);
          const delay = el.dataset.revealKind === "item" ? Math.min(i++, MAX_STAGGER) * STAGGER_MS : 0;
          el.style.setProperty("--reveal-delay", `${delay}ms`);
          el.dataset.reveal = "in";
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );

    const mark = (el, kind) => {
      if (el.dataset.reveal || el.closest("[data-no-reveal]")) return;
      el.dataset.reveal = "pending";
      if (kind) el.dataset.revealKind = kind;
      io.observe(el);
    };

    const scan = (scope) => {
      scope.querySelectorAll("section").forEach((s) => {
        if (!s.parentElement.closest("section")) mark(s);
      });
      scope.querySelectorAll(ITEMS).forEach((el) => {
        if (el.parentElement.closest('[data-reveal-kind="item"]')) return;
        const r = el.getBoundingClientRect();
        if (r.width >= 120 && r.height >= 80) mark(el, "item");
      });
    };
    scan(root);

    // Content swapped in later (filters, pagination, tabs) animates in too.
    const mo = new MutationObserver((muts) => {
      const targets = new Set(muts.filter((m) => m.addedNodes.length).map((m) => m.target));
      targets.forEach((t) => t.isConnected && t.nodeType === 1 && scan(t.closest("section") || t));
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      // Anything not yet revealed must not stay invisible (e.g. StrictMode re-run).
      root.querySelectorAll('[data-reveal="pending"]').forEach((el) => {
        delete el.dataset.reveal;
        delete el.dataset.revealKind;
      });
    };
  }, [rootRef, key]);
}
