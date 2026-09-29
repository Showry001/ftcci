import { assets } from "../data/content.js";

// 9×8 arrow glyph exported from Figma (navy on light buttons, white on dark buttons).
// The SVG has a 6.25% / 5.56% bleed, reproduced with the negative inset wrapper.
export default function Arrow({ tone = "navy" }) {
  return (
    <span className="arrow-nudge" style={{ position: "relative", display: "inline-block", width: 9, height: 8, flexShrink: 0 }} aria-hidden="true">
      <span style={{ position: "absolute", inset: "-6.25% -5.56%" }}>
        <img src={tone === "white" ? assets.arrowWhite : assets.arrowNavy} alt="" style={{ width: "100%", height: "100%" }} />
      </span>
    </span>
  );
}
