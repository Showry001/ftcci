import styles from "./Pagination.module.css";

export default function Pagination({ page, pages, onChange }) {
  return (
    <nav className={styles.pager} aria-label="Pagination">
      <button type="button" className={`${styles.step} ${styles.prev}`} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className={styles.nums}>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={`${styles.num} ${n === page ? styles.current : ""}`}
            aria-current={n === page ? "page" : undefined}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </span>
      <button type="button" className={`${styles.step} ${styles.next}`} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
