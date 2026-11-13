import styles from "./Pagination.module.css";

// First, last and the pages around the current one; skipped runs become a "…" gap.
function pageItems(page, pages) {
  const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return nums.flatMap((n, i) => (i && n - nums[i - 1] > 1 ? [`gap-${n}`, n] : [n]));
}

export default function Pagination({ page, pages, onChange }) {
  return (
    <nav className={styles.pager} aria-label="Pagination">
      <button type="button" className={`${styles.step} ${styles.prev}`} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className={styles.nums}>
        {pageItems(page, pages).map((n) =>
          typeof n === "string" ? (
            <span key={n} className={styles.gap} aria-hidden="true">…</span>
          ) : (
            <button
              key={n}
              type="button"
              className={`${styles.num} ${n === page ? styles.current : ""}`}
              aria-current={n === page ? "page" : undefined}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          )
        )}
      </span>
      <button type="button" className={`${styles.step} ${styles.next}`} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
