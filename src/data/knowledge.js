import { ftcciFile } from "./files.js";

const a = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

export const knowledgeSubNav = [
  { label: "FTCCI Review", href: "/knowledge/ftcci-review" },
  { label: "Useful Links", href: "/knowledge/useful-links" },
  { label: "FTCCI Publications", href: "/knowledge/publications" },
];

export const kIcons = {
  arrowNavy: a("knowledge/icon-arrow-navy.svg"),
  arrowDark: a("knowledge/icon-arrow-dark.svg"),
  downloadNavy: a("knowledge/icon-download-navy.svg"),
  downloadGold: a("knowledge/icon-download-gold.svg"),
  upRight: a("knowledge/icon-arrow-up-right.svg"),
};

// FTCCI Review weekly issues as listed on ftcci.in/pages/ftcci-review, newest first: [month, days].
// Each issue is "ftapcci/FR <yyyy>/FR <yyyy> <mm> <dd>.pdf" there, with a .jpg cover of the same name.
const reviewMonths = [
  ["2026-10", [28, 21, 14, 7]],
  ["2026-09", [30, 23, 16, 9, 2]],
  ["2026-08", [26, 19, 12, 5]],
  ["2026-07", [29, 22, 15, 8, 1]],
  ["2026-06", [24, 17, 10, 3]],
  ["2026-05", [27, 20, 13, 6]],
  ["2026-04", [29, 22, 15, 8, 1]],
  ["2026-03", [25, 18, 11, 4]],
  ["2026-02", [25, 18, 11, 4]],
  ["2026-01", [28, 21, 14, 7]],
  ["2025-12", [31, 24, 17, 10, 3]],
  ["2025-11", [26, 19, 12, 5]],
  ["2025-10", [29, 22, 15, 8, 1]],
  ["2025-09", [24, 17, 10, 3]],
  ["2025-08", [27, 20, 13, 6]],
  ["2025-07", [30, 23, 16, 9, 2]],
  ["2025-06", [25, 18, 11, 4]],
  ["2025-05", [28, 21, 14, 7]],
  ["2025-04", [30, 23, 16, 9, 2]],
  ["2025-03", [26, 19, 12, 5]],
  ["2025-02", [26, 19, 12, 5]],
  ["2025-01", [29, 22, 15, 8, 1]],
  ["2024-12", [25, 18, 11, 4]],
  ["2024-11", [27, 20, 13, 6]],
  ["2024-10", [23, 16, 9, 2]],
  ["2024-09", [25, 18, 11, 4]],
  ["2024-08", [28, 21, 14, 7]],
  ["2024-07", [31, 24, 17, 10, 3]],
  ["2024-06", [26, 19, 12, 5]],
  ["2024-05", [29, 22, 15, 8, 1]],
  ["2024-04", [24, 17, 10, 3]],
  ["2024-03", [27, 20, 13, 6]],
  ["2024-02", [28, 21, 14, 7]],
  ["2024-01", [31, 24, 17, 10, 3]],
  ["2023-12", [27, 20]],
  ["2023-11", [29, 22, 15, 1]],
  ["2023-10", [25, 18]],
];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const reviewIssues = reviewMonths.flatMap(([ym, days]) =>
  days.map((d) => {
    const [y, m] = ym.split("-");
    const dd = String(d).padStart(2, "0");
    const stem = `ftapcci/FR ${y}/FR ${y} ${m} ${dd}`;
    return {
      id: `${ym}-${dd}`,
      year: y,
      date: `${months[m - 1]} ${d}, ${y}`,
      pdf: ftcciFile(`${stem}.pdf`),
      cover: ftcciFile(`${stem}.jpg`),
    };
  })
);
export const reviewYears = ["All years", ...new Set(reviewIssues.map((r) => r.year))];
export const latestReview = {
  ...reviewIssues[0],
  text: "This issue covers key policy updates, industry insights, international trade developments, and FTCCI's recent events and initiatives.",
};
export const recentReviews = reviewIssues.slice(1, 4);

// Knowledge Centre landing: a selection from the full directory below.
const featuredLinks = ["Government of India", "Telangana State", "Reserve Bank of India", "DGFT", "SEBI", "FICCI", "CII", "The Economic Times"];

export const reviewArrow = a("review/icon-arrow-right.svg");
export const searchIcon = a("knowledge/icon-search.svg");

export const linkArrowSm = a("knowledge/icon-arrow-up-right-sm.svg");
// From ftcci.in/pages/useful-links
export const linkDirectory = [
  {
    group: "Governments",
    links: [
      { title: "Government of India", text: "National portal for government services, schemes and information.", href: "https://www.india.gov.in/" },
      { title: "Telangana State", text: "State profile, departments and citizen services of Telangana.", href: "https://www.telangana.gov.in/about/state-profile" },
      { title: "Andhra Pradesh", text: "Official portal of the Government of Andhra Pradesh.", href: "https://www.ap.gov.in/" },
    ],
  },
  {
    group: "Apex Business Chambers",
    links: [
      { title: "FICCI", text: "Federation of Indian Chambers of Commerce and Industry.", href: "https://www.ficci.in/" },
      { title: "ASSOCHAM", text: "The Associated Chambers of Commerce and Industry of India.", href: "https://www.assocham.org/" },
      { title: "CII", text: "Confederation of Indian Industry.", href: "https://www.cii.in/" },
      { title: "FAPCCI", text: "Federation of Andhra Pradesh Chambers of Commerce and Industry.", href: "https://www.fapcci.in/" },
    ],
  },
  {
    group: "Print & Electronic Media",
    links: [
      { title: "CNBC", text: "Business news television, streamed on Moneycontrol.", href: "https://www.moneycontrol.com/tv" },
      { title: "Reuters", text: "Global business, markets and world news.", href: "https://www.reuters.com/" },
      { title: "Business Standard", text: "Business, economy and markets news.", href: "https://www.business-standard.com/" },
      { title: "The Economic Times", text: "Business news, markets and economic policy.", href: "https://economictimes.indiatimes.com/" },
      { title: "The Times of India", text: "National and world news.", href: "https://timesofindia.indiatimes.com/" },
      { title: "BusinessLine", text: "Business news from The Hindu group.", href: "https://www.thehindubusinessline.com/" },
      { title: "Financial Express", text: "Financial Express e-paper.", href: "https://epaper.financialexpress.com/" },
      { title: "Live Mint", text: "Business, finance and economy news.", href: "https://www.livemint.com/" },
    ],
  },
  {
    group: "Global Financial Institutions",
    links: [
      { title: "International Monetary Fund", text: "Global economic outlook, data and policy.", href: "https://www.imf.org/" },
      { title: "World Bank", text: "Development finance, research and country data.", href: "https://www.worldbank.org/" },
      { title: "International Finance Corporation", text: "Private-sector investment arm of the World Bank Group.", href: "https://www.ifc.org/" },
      { title: "Asian Development Bank", text: "Development finance across Asia and the Pacific.", href: "https://www.adb.org/" },
    ],
  },
  {
    group: "Regulatory Bodies",
    links: [
      { title: "Reserve Bank of India", text: "Monetary policy, FEMA guidelines and banking circulars.", href: "https://www.rbi.org.in/" },
      { title: "DGFT", text: "Foreign trade policy, IEC registration and export schemes.", href: "https://www.dgft.gov.in/" },
      { title: "SEBI", text: "Securities market regulations and investor guidance.", href: "https://www.sebi.gov.in/" },
    ],
  },
];
export const usefulLinks = featuredLinks.map((title) => {
  const group = linkDirectory.find((g) => g.links.some((l) => l.title === title));
  const link = group.links.find((l) => l.title === title);
  return { title, sub: group.group, href: link.href };
});

