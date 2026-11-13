// An image from the media library: JPEG fallback plus WebP sizes, so each screen downloads a size that fits.
export default function Img({ media, sizes = "100vw", alt, loading = "lazy", className, ...rest }) {
  if (!media?.url) return null;
  return (
    <img
      src={media.url}
      srcSet={media.srcset || undefined}
      sizes={media.srcset ? sizes : undefined}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      alt={alt ?? media.alt ?? ""}
      loading={loading}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}

// An image that fills its box, cropped to fit (replaces the fixed Figma crops: the stored photo is
// already cropped the way the design showed it).
export function CoverImage({ media, alt, className = "", style, sizes, loading }) {
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      <Img
        media={media}
        alt={alt}
        sizes={sizes}
        loading={loading}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
