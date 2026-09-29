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

export const latestReview = {
  date: "August 26, 2026",
  text: "This issue covers key policy updates, industry insights, international trade developments, and FTCCI's recent events and initiatives.",
  cover: a("knowledge/review-cover-latest.png"),
};
export const recentReviews = [
  { date: "August 12, 2026", cover: a("knowledge/review-issue-1.png"), crop: { width: "100%", height: "230.22%", left: "-0.41%", top: "-0.02%" } },
  { date: "August 12, 2026", cover: a("knowledge/review-issue-2.png"), crop: { width: "100%", height: "230.8%", left: "-0.09%", top: "-14.99%" } },
  { date: "August 12, 2026", cover: a("knowledge/review-issue-3.png"), crop: { width: "100%", height: "233.92%", left: "-0.23%", top: "0.02%" } },
];

export const usefulLinks = [
  { title: "Ministry of Commerce", sub: "Govt. of India", href: "https://commerce.gov.in" },
  { title: "Government of Telangana", sub: "State portal", href: "https://www.telangana.gov.in" },
  { title: "DGFT — Foreign Trade", sub: "Export / Import", href: "https://www.dgft.gov.in" },
  { title: "GST Portal", sub: "Tax compliance", href: "https://www.gst.gov.in" },
  { title: "MSME Development", sub: "Schemes & subsidies", href: "https://msme.gov.in" },
  { title: "TS-iPASS Approvals", sub: "Invest Telangana", href: "https://ipass.telangana.gov.in" },
  { title: "Skill Development Corp.", sub: "Training", href: "https://nsdcindia.org" },
  { title: "National Digital Library", sub: "Research", href: "https://ndl.iitkgp.ac.in" },
];

// FTCCI Review archive. The design shows 12 cards (all "Startups & Innovation", 2026);
// replace with the real issue list — search, year filter and pagination work off this array.
export const reviewYears = ["All years", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013"];
export const reviewIssues = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: "Startups & Innovation",
  meta: "32 pages · PDF",
  year: "2026",
  cover: a(i === 0 ? "review/cover-featured.png" : "review/cover-issue.png"),
  href: "#read",
}));
export const reviewArrow = a("review/icon-arrow-right.svg");
export const searchIcon = a("knowledge/icon-search.svg");

export const linkArrowSm = a("knowledge/icon-arrow-up-right-sm.svg");
export const linkDirectory = [
  {
    group: "Government of Telangana",
    links: [
      { title: "Government of Telangana", text: "Official state portal for departments, schemes and citizen services.", href: "https://www.telangana.gov.in" },
      { title: "TG-iPASS", text: "Single-window industrial approval and clearance system for Telangana.", href: "https://ipass.telangana.gov.in" },
      { title: "Telangana Industries Department", text: "Industrial policy, incentives and sector-wise investment information.", href: "https://industries.telangana.gov.in" },
      { title: "TSIIC", text: "Industrial infrastructure, land allotment and park development.", href: "https://tsiic.telangana.gov.in" },
      { title: "Commercial Taxes, Telangana", text: "State GST registration, returns and dealer services.", href: "https://www.tgct.gov.in" },
    ],
  },
  {
    group: "Government of India",
    links: [
      { title: "Ministry of Commerce & Industry", text: "Trade policy, industrial promotion and investment facilitation.", href: "https://commerce.gov.in" },
      { title: "Ministry of MSME", text: "Schemes, credit support and cluster programmes for small enterprises.", href: "https://msme.gov.in" },
      { title: "Ministry of Finance", text: "Union Budget documents, economic survey and fiscal notifications.", href: "https://finmin.gov.in" },
      { title: "Ministry of Corporate Affairs", text: "Company incorporation, compliance filings and corporate law.", href: "https://www.mca.gov.in" },
      { title: "Invest India", text: "National investment promotion and facilitation agency.", href: "https://www.investindia.gov.in" },
    ],
  },
  {
    group: "Trade & Export",
    links: [
      { title: "DGFT", text: "Import-export policy, IEC registration and foreign trade schemes.", href: "https://www.dgft.gov.in" },
      { title: "Indian Trade Portal", text: "Tariffs, market access and country-wise export intelligence.", href: "https://www.indiantradeportal.in" },
      { title: "ECGC", text: "Export credit insurance cover for exporters and banks.", href: "https://www.ecgc.in" },
      { title: "Indian Customs (ICEGATE)", text: "Customs e-filing, duty calculator and shipping bill services.", href: "https://www.icegate.gov.in" },
    ],
  },
  {
    group: "Finance & Taxation",
    links: [
      { title: "GST Portal", text: "Registration, return filing, e-way bills and refunds.", href: "https://www.gst.gov.in" },
      { title: "Income Tax Department", text: "e-Filing, TDS services, PAN and assessment information.", href: "https://www.incometax.gov.in" },
      { title: "Reserve Bank of India", text: "Monetary policy, FEMA guidelines and banking circulars.", href: "https://www.rbi.org.in" },
      { title: "SEBI", text: "Securities market regulations, listing norms and investor guidance.", href: "https://www.sebi.gov.in" },
      { title: "SIDBI", text: "Development finance and refinance support for MSMEs.", href: "https://www.sidbi.in" },
    ],
  },
  {
    group: "Industry Bodies",
    links: [
      { title: "FICCI", text: "Apex national industry association and policy advocacy body.", href: "https://ficci.in" },
      { title: "Bureau of Indian Standards", text: "Standards, certification schemes and product quality marks.", href: "https://www.bis.gov.in" },
    ],
  },
];
