// Reproduces Figma's "crop" image fills: the image is absolutely positioned inside
// an overflow-hidden box using the exact percentages Figma exports.
export default function CroppedImage({ src, crop, alt = "", className = "", style }) {
  if (!crop) {
    return (
      <div className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
        <img src={src} alt={alt} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          position: "absolute",
          maxWidth: "none",
          width: crop.width,
          height: crop.height,
          left: crop.left,
          top: crop.top,
        }}
      />
    </div>
  );
}
