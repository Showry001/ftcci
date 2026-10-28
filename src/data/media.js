import { assets, featuredNews, news } from "./content.js";
import { ftcciFile } from "./files.js";

const a = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

export const mediaSubNav = [
  { label: "Press Coverage", href: "#press-coverage" },
  { label: "Press Kit", href: "#press-kit" },
];

// Page 1 of coverage matches the design; add more stories and the pager grows automatically.
export const coverage = [
  { ...featuredNews },
  { ...news[0], excerpt: "The Strategic Exports Office will bring together diplomatic, commercial and financial expertise to help Telangana businesses compete for major international contracts." },
  { ...news[1], excerpt: "Renewed tariff threats have fueled a feeling of uneasiness for affected businesses across Telangana's export economy." },
  { tag: "News", date: "Jul 23, 2026", title: "FTCCI's Reaction to India's Inclusion on the Trade Compliance Watch List", excerpt: "Indian exporters should not be unfairly targeted here.", image: news[2].image },
];

// Files from ftcci.in/pages/press-kit. The emblem is the site's own logo until FTCCI supplies print-ready logo files.
export const pressKit = [
  { title: "FTCCI Brand Logos", text: "Official FTCCI emblem for digital use.", href: assets.logo },
  { title: "FTCCI Brochure", text: "Official FTCCI organisation and membership information.", href: ftcciFile("downloads/FTCCI Brochure.pdf") },
  { title: "FTCCI Halls Flyer", text: "Details of FTCCI halls, facilities and booking information.", href: ftcciFile("Events/hall flyer 2026_July 15.jpg") },
  { title: "FTCCI Membership Benefits", text: "Overview of benefits available to FTCCI members.", href: ftcciFile("downloads/Membership Benefits.pdf") },
  { title: "MSME Advisory Services", text: "Information on FTCCI's support and advisory services for MSMEs.", href: ftcciFile("downloads/MSME advisory services.pdf") },
  { title: "FTCCI Pokarna Skill Centre Brochure", text: "Information about skill development and training programmes.", href: ftcciFile("downloads/SC brochure.pdf") },
  { title: "Certificate of Origin – Attestation of Export Documents", text: "Forms and guidelines for Certificate of Origin and document attestation.", href: ftcciFile("downloads/Certificate of Origin.pdf"), wide: true },
];

export const mediaIcons = {
  download: a("media/icon-download.svg"),
  doubleArrow: a("media/icon-double-arrow.svg"),
};
