import { useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { PageFlip } from "page-flip";
import styles from "./FlipbookReader.module.css";

GlobalWorkerOptions.workerSrc = workerUrl;

// Pages drawn ahead of and behind the open spread, so a turn never reveals a blank page.
const AHEAD = 3;

// Book-style PDF reader: pages turn like a magazine, two at a time on wide screens and one at a time
// on phones. pdf.js draws each page as it comes near the open spread.
export default function FlipbookReader({ src, title, onClose }) {
  const dialogRef = useRef(null);
  const hostRef = useRef(null);
  const flipRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [ratio, setRatio] = useState(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d.open) d.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let flip;
    const task = getDocument({ url: src, disableAutoFetch: true });

    task.promise
      .then(async (pdf) => {
        const size = (await pdf.getPage(1)).getViewport({ scale: 1 });
        if (cancelled) return;
        const book = document.createElement("div");
        const pages = Array.from({ length: pdf.numPages }, (_, i) => {
          const el = document.createElement("div");
          el.className = styles.page;
          if (i === 0 || i === pdf.numPages - 1) el.dataset.density = "hard";
          const canvas = document.createElement("canvas");
          el.append(canvas);
          book.append(el);
          return { el, canvas, drawn: false };
        });
        hostRef.current.append(book);

        flip = new PageFlip(book, {
          width: Math.round(size.width),
          height: Math.round(size.height),
          size: "stretch",
          minWidth: 160,
          maxWidth: 2400,
          minHeight: 200,
          maxHeight: 3400,
          showCover: true,
          usePortrait: true,
          mobileScrollSupport: false,
          maxShadowOpacity: 0.4,
          flippingTime: 700,
        });
        flip.loadFromHTML(pages.map((p) => p.el));
        flipRef.current = flip;

        const draw = (i) => {
          const p = pages[i];
          if (!p || p.drawn) return;
          p.drawn = true;
          const width = flip.getBoundsRect().pageWidth * Math.min(window.devicePixelRatio || 1, 2);
          pdf.getPage(i + 1).then((pdfPage) => {
            if (cancelled) return;
            const viewport = pdfPage.getViewport({ scale: width / pdfPage.getViewport({ scale: 1 }).width });
            p.canvas.width = Math.floor(viewport.width);
            p.canvas.height = Math.floor(viewport.height);
            return pdfPage.render({ canvas: p.canvas, viewport }).promise;
          }).catch(() => {
            p.drawn = false;
          });
        };
        const drawAround = (i) => {
          for (let j = i - AHEAD; j <= i + AHEAD + 1; j++) draw(j);
        };

        const fit = (orientation) => {
          const single = orientation === "portrait";
          setPortrait(single);
          setRatio(((single ? 1 : 2) * size.width) / size.height);
        };
        flip.on("flip", (e) => {
          setPage(e.data);
          drawAround(e.data);
        });
        flip.on("changeOrientation", (e) => fit(e.data));
        fit(flip.getOrientation());
        setCount(pdf.numPages);
        setStatus("ready");
        drawAround(0);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      flipRef.current = null;
      flip?.destroy(); // also removes the book element it was given
      task.destroy();
    };
  }, [src]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") flipRef.current?.flipNext();
    if (e.key === "ArrowLeft") flipRef.current?.flipPrev();
  };

  const last = portrait || page === 0 || page >= count - 1 ? page + 1 : page + 2;
  const atEnd = last >= count;

  return (
    <dialog
      ref={dialogRef}
      className={styles.reader}
      aria-label={title}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === e.currentTarget && dialogRef.current.close()}
    >
      <button type="button" className={styles.close} aria-label="Close reader" onClick={() => dialogRef.current.close()}>
        ×
      </button>

      <div className={styles.stage} onClick={(e) => e.target === e.currentTarget && dialogRef.current.close()}>
        <div ref={hostRef} className={styles.book} style={ratio ? { "--ratio": ratio } : undefined} />
        {status === "loading" && (
          <p className={styles.status} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            Opening {title}…
          </p>
        )}
        {status === "error" && (
          <div className={styles.status} role="alert">
            <p>This issue can’t be shown in the reader here.</p>
            <a href={src} target="_blank" rel="noreferrer">Open the PDF in a new tab</a>
          </div>
        )}
      </div>

      {status === "ready" && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.prev}`}
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => flipRef.current.flipPrev()}
          >
            <Chevron />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            aria-label="Next page"
            disabled={atEnd}
            onClick={() => flipRef.current.flipNext()}
          >
            <Chevron />
          </button>
          <div className={styles.toolbar}>
            <span className={styles.title}>{title}</span>
            <span className={styles.count} aria-live="polite">
              {last > page + 1 ? `${page + 1}–${last}` : page + 1} / {count}
            </span>
            <a className={styles.download} href={src} download target="_blank" rel="noreferrer">
              Download PDF
            </a>
          </div>
        </>
      )}
    </dialog>
  );
}

function Chevron() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
