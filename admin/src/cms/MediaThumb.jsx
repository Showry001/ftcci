import styles from "./Media.module.css";

const kindLabel = { image: "Image", pdf: "PDF", video: "Video" };
export const mediaKindLabel = (m) => kindLabel[m.kind] ?? m.kind;

// The picture for a media library item: the image itself, a video's poster, or a badge for PDFs.
export default function MediaThumb({ m, sizes = "240px", className = "" }) {
  if (m.kind === "image") return <img className={`${styles.thumb} ${className}`} src={m.url} srcSet={m.srcset} sizes={sizes} alt="" loading="lazy" />;
  if (m.kind === "video" && m.poster) return <img className={`${styles.thumb} ${className}`} src={m.poster} alt="" loading="lazy" />;
  return <span className={`${styles.thumb} ${styles.badge} ${className}`}>{mediaKindLabel(m)}</span>;
}
