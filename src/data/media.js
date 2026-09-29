import { featuredNews, news } from "./content.js";

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

export const pressKit = [
  { title: "FTCCI Brand Logos", text: "Official FTCCI logo files for digital and print use." },
  { title: "FTCCI Brochure", text: "Official FTCCI organisation and membership information." },
  { title: "FTCCI Halls Flyer", text: "Details of FTCCI halls, facilities and booking information." },
  { title: "FTCCI Membership Benefits", text: "Overview of benefits available to FTCCI members." },
  { title: "MSME Advisory Services", text: "Information on FTCCI's support and advisory services for MSMEs." },
  { title: "FTCCI Pokarna Skill Centre Brochure", text: "Information about skill development and training programmes." },
  { title: "Certificate of origin - Attestation of Export Documenets :", text: "Forms and guidelines for Certificate of Origin and document attestation.", wide: true },
];

export const mediaIcons = {
  download: a("media/icon-download.svg"),
  doubleArrow: a("media/icon-double-arrow.svg"),
};
