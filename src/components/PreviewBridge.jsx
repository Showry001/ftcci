import { useEffect, useRef } from "react";
import { useRevalidator } from "react-router";

const NS = "ftcci-editor";
const NAVY = "#152a5e";
const GOLD = "#f0b84d";

// Runs only inside the admin's page editor, which shows this page in a frame opened with
// ?preview=<signed link>&edit=1. It outlines the part of the page under the pointer, tells the editor
// which part was clicked (parts carry data-edit="<section id>"), and reloads the page's content in place
// when the editor has saved a change. It talks only to the admin's own address, and never receives
// content: the page always reads drafts from the server through the signed preview link.
export default function PreviewBridge({ adminOrigin }) {
  const revalidator = useRevalidator();
  const revalidate = useRef(revalidator.revalidate);
  revalidate.current = revalidator.revalidate;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("preview") || params.get("edit") !== "1" || window.parent === window) return;
    const origin = adminOrigin || window.location.origin;
    const send = (message) => window.parent.postMessage({ ns: NS, ...message }, origin);
    let labels = {};
    let hovered = null;
    let selected = null;
    let pointer = null;

    const frame = (color, style) => {
      const el = document.createElement("div");
      Object.assign(el.style, {
        position: "fixed",
        zIndex: "2147483646",
        pointerEvents: "none",
        border: `2px ${style} ${color}`,
        borderRadius: "4px",
        boxSizing: "border-box",
        display: "none",
      });
      document.body.append(el);
      return el;
    };
    const hoverFrame = frame(NAVY, "dashed");
    const selectedFrame = frame(GOLD, "solid");
    const tag = document.createElement("span");
    Object.assign(tag.style, {
      position: "absolute",
      left: "-2px",
      top: "-26px",
      padding: "3px 8px",
      borderRadius: "4px 4px 4px 0",
      background: NAVY,
      color: "#fff",
      font: "600 12px/18px Inter, system-ui, sans-serif",
      whiteSpace: "nowrap",
    });
    hoverFrame.append(tag);

    const find = (id) => (id ? document.querySelector(`[data-edit="${CSS.escape(id)}"]`) : null);
    const place = (el, target) => {
      const rect = target?.isConnected && target.getClientRects().length ? target.getBoundingClientRect() : null;
      if (!rect) {
        el.style.display = "none";
        return;
      }
      Object.assign(el.style, { display: "block", left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
      // Keep the label inside the frame when the part starts at the very top of the page.
      tag.style.top = rect.top < 30 ? "2px" : "-26px";
    };
    const hover = (part) => {
      if (part !== hovered) {
        hovered = part;
        tag.textContent = part ? `${labels[part.dataset.edit] ?? "Edit"} · click to edit` : "";
      }
      place(hoverFrame, hovered);
    };
    // Scrolling moves the page under a still pointer, so look again at what is under it.
    const relayout = () => {
      const under = pointer && document.elementFromPoint(pointer.x, pointer.y);
      hover(under ? under.closest("[data-edit]") : null);
      place(selectedFrame, find(selected));
    };
    // The parts this page shows right now (some only appear on phones, or on one tab).
    const report = () => {
      const visible = [...document.querySelectorAll("[data-edit]")].filter((el) => el.getClientRects().length).map((el) => el.dataset.edit);
      send({ type: "ready", sections: [...new Set(visible)] });
    };

    const onMove = (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      hover(e.target instanceof Element ? e.target.closest("[data-edit]") : null);
    };
    const onLeave = () => {
      pointer = null;
      hover(null);
    };
    // Clicks pick a part. Buttons such as carousel arrows and tabs still work; links that would leave
    // the page and form submissions don't.
    const onClick = (e) => {
      if (!(e.target instanceof Element)) return;
      const link = e.target.closest("a[href]");
      if (link) {
        const to = new URL(link.href, window.location.href);
        if (to.pathname !== window.location.pathname || link.target === "_blank" || link.hasAttribute("download")) e.preventDefault();
      }
      if (e.target.closest('button[type="submit"], input[type="submit"]')) e.preventDefault();
      const part = e.target.closest("[data-edit]");
      if (part) {
        selected = part.dataset.edit;
        place(selectedFrame, part);
        send({ type: "select", section: selected });
      }
    };
    const onSubmit = (e) => e.preventDefault();
    const onMessage = (e) => {
      if (e.origin !== origin || e.source !== window.parent || e.data?.ns !== NS) return;
      const message = e.data;
      if (message.type === "labels" && message.labels && typeof message.labels === "object") labels = message.labels;
      if (message.type === "refresh") revalidate.current();
      if (message.type === "focus" && typeof message.section === "string") {
        selected = message.section;
        const target = find(selected);
        if (target) {
          const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
          const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
          const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "instant" });
        }
        relayout();
      }
    };

    // After the content reloads (or a tab changes), re-measure and tell the editor what is on show.
    let pending = 0;
    const changed = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        relayout();
        report();
      });
    };
    const observer = new MutationObserver(changed);
    observer.observe(document.body, { childList: true, subtree: true });
    const resize = new ResizeObserver(changed);
    resize.observe(document.body);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick, true);
    window.addEventListener("submit", onSubmit, true);
    window.addEventListener("message", onMessage);
    window.addEventListener("scroll", relayout, { passive: true });
    window.addEventListener("hashchange", changed);
    report();

    return () => {
      observer.disconnect();
      resize.disconnect();
      cancelAnimationFrame(pending);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("scroll", relayout);
      window.removeEventListener("hashchange", changed);
      hoverFrame.remove();
      selectedFrame.remove();
    };
  }, [adminOrigin]);

  return null;
}
