// Site structure and interface artwork that ships with the code (menus, section tabs, icons). Editable
// content lives in the CMS; icons staff pick for content are mapped from their keys below.
const a = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

export const assets = {
  logo: a("header/logo.png"),
  footerLogo: a("footer/logo.png"),
  menu: a("mobile/menu.svg"),
  close: a("mobile/close.svg"),
  arrowWhite: a("icons/arrow-white.svg"),
  arrowNavy: a("icons/arrow-navy.svg"),
  checks: [a("form/check-1.svg"), a("form/check-2.svg"), a("form/check-3.svg")],
  iconCalendar: a("events/icon-calendar.svg"),
  iconLocation: a("events/icon-location.svg"),
  iconCalendarMobile: a("events/icon-calendar-outline.svg"),
  iconLocationMobile: a("events/icon-location-outline.svg"),
  iconPin: a("events/icon-pin-sm.svg"),
  iconPinMobile: a("events/icon-pin-outline-sm.svg"),
  venueCheckFirst: a("venues/check-1.svg"),
  venueCheck: a("venues/check.svg"),
  footerLocation: a("footer/icon-location.svg"),
  footerPhone: a("footer/icon-phone.svg"),
  footerMail: a("footer/icon-mail.svg"),
};

// Main navigation. `children` feed the mobile/tablet accordion menu (Figma "… pages" menu frames).
export const navLinks = [
  {
    label: "About",
    to: "/about",
    children: [
      ["History", "/about#history"],
      ["Vision", "/about#vision"],
      ["Objectives", "/about#objectives"],
      ["Office Bearers", "/about#office-bearers"],
      ["Managing Committee", "/about#managing-committee"],
      ["FTCCI Secretariat", "/about#secretariat"],
      ["Past Presidents", "/about#past-presidents"],
    ],
  },
  {
    label: "Membership",
    to: "/membership",
    children: [
      ["Why Join FTCCI", "/membership#why-join"],
      ["Membership Benefits", "/membership#benefits"],
      ["Membership Options", "/membership#options"],
      ["How to Apply", "/membership#apply"],
      ["FTCCI Experience", "/membership#experience"],
    ],
  },
  {
    label: "Services",
    to: "/services",
    children: [
      ["Certificate of Origin", "/services#certificate-of-origin"],
      ["Liaison with Bodies", "/services#liaison"],
      ["Help Desk", "/services#help-desk"],
      ["Certification of Documents", "/services#certification"],
      ["Expert Committee", "/services#expert-committee"],
      ["CEO Forum", "/services#ceo-forum"],
      ["Halls & Booking", "/services#hall-booking"],
      ["Downloads", "/services#downloads"],
    ],
  },
  {
    label: "Events",
    to: "/events",
    children: [
      ["Upcoming Events", "/events"],
      ["Past Events", "/events?tab=past"],
    ],
  },
  {
    label: "Knowledge",
    to: "/knowledge",
    children: [
      ["FTCCI Review", "/knowledge/ftcci-review"],
      ["Useful Links", "/knowledge/useful-links"],
      ["FTCCI Publications", "/knowledge/publications"],
    ],
  },
  {
    label: "Media",
    to: "/media",
    children: [
      ["Press Coverage", "/media#press-coverage"],
      ["Press Kit", "/media#press-kit"],
    ],
  },
  { label: "Contact", to: "/contact", menuLabel: "Contact Us" },
];

export const quickLinks = [
  { label: "About FTCCI", to: "/about" },
  { label: "Membership", to: "/membership" },
  { label: "Events & Summits", to: "/events" },
  { label: "Publications", to: "/knowledge/publications" },
  { label: "Committees", to: "/services#expert-committee" },
  { label: "Media Gallery", to: "/media" },
  { label: "Career", to: "/careers" },
];

export const legalLinks = ["Privacy Policy", "Terms of Use", "Sitemap"];

export const subNav = {
  about: [
    { label: "History", href: "#history" },
    { label: "Vision", href: "#vision" },
    { label: "Objectives", href: "#objectives" },
    { label: "Office Bearers", href: "#office-bearers" },
    { label: "Managing Committee", href: "#managing-committee" },
    { label: "FTCCI Secretariat", href: "#secretariat" },
    { label: "Past Presidents", href: "#past-presidents" },
  ],
  membership: [
    { label: "Why Join FTCCI", href: "#why-join" },
    { label: "Membership Benefits", href: "#benefits" },
    { label: "Membership Options", href: "#options" },
    { label: "How to Apply", href: "#apply" },
    { label: "FTCCI Experience", href: "#experience" },
  ],
  knowledge: [
    { label: "FTCCI Review", href: "/knowledge/ftcci-review" },
    { label: "Useful Links", href: "/knowledge/useful-links" },
    { label: "FTCCI Publications", href: "/knowledge/publications" },
  ],
  publications: [
    { label: "Publications", href: "#publications" },
    { label: "FTCCI Activity Reports", href: "#activity-reports" },
    { label: "FTCCI Annual Reports", href: "#annual-reports" },
    { label: "Research & Publications", href: "#research" },
  ],
  media: [
    { label: "Press Coverage", href: "#press-coverage" },
    { label: "Press Kit", href: "#press-kit" },
  ],
  privilege: [
    { label: "Benefits", href: "#benefits" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Eligibility", href: "#eligibility" },
    { label: "Partners", href: "#partners" },
    { label: "FAQs", href: "#faqs" },
  ],
  services: [
  { label: "Certificate of Origin", href: "#certificate-of-origin" },
  { label: "Liaison with Bodies", href: "#liaison" },
  { label: "Help Desk", href: "#help-desk" },
  { label: "Certification of Documents", href: "#certification" },
  { label: "Expert Committee", href: "#expert-committee" },
  { label: "CEO Forum", href: "#ceo-forum" },
  { label: "Halls & Booking", href: "#hall-booking" },
  { label: "Downloads", href: "#downloads" },
],
};

export const icons = {
  history: a("about/icon-history-arrow.svg"),
  event: {
    calendar: a("events/icon-calendar-gold.svg"),
    pin: a("events/icon-pin-gold.svg"),
    check: a("events/detail-check.svg"),
    detailCalendar: a("events/detail-calendar.svg"),
    detailPin: a("events/detail-pin.svg"),
    detailStatus: a("events/detail-status.svg"),
  },
  knowledge: {
    arrowNavy: a("knowledge/icon-arrow-navy.svg"),
    arrowDark: a("knowledge/icon-arrow-dark.svg"),
    downloadNavy: a("knowledge/icon-download-navy.svg"),
    downloadGold: a("knowledge/icon-download-gold.svg"),
    upRight: a("knowledge/icon-arrow-up-right.svg"),
    upRightSm: a("knowledge/icon-arrow-up-right-sm.svg"),
    search: a("knowledge/icon-search.svg"),
    reviewArrow: a("review/icon-arrow-right.svg"),
  },
  media: { download: a("media/icon-download.svg"), doubleArrow: a("media/icon-double-arrow.svg") },
  membership: {
    optionArrow: a("membership/icon-arrow-right.svg"),
    stepLine: a("membership/step-line.png"),
    ctaArrowWhite: a("membership/icon-arrow-right-white.svg"),
  },
  services: {
    check: a("services/icon-check.svg"),
    checkDark: a("services/icon-check-dark.svg"),
    checkSm: a("services/icon-check-sm.svg"),
    pdf: a("services/pdf-badge.svg"),
  },
  privilege: {
    pin: a("privilege/icon-pin.svg"),
    arrow: a("privilege/icon-arrow-up-right.svg"),
    search: a("privilege/icon-search.svg"),
    plus: a("privilege/icon-plus.svg"),
  },
};

// Icons staff choose in the admin (keys from shared/icons.js), with their drawn sizes.
const set = (dir, keys, prefix = "icon-") => Object.fromEntries(keys.map((k) => [k, a(`${dir}/${prefix}${k}.svg`)]));
export const pickIcons = {
  quickAction: set("mobile", ["user-plus", "calendar", "file-text", "bell"]),
  homeBenefit: set("benefits", ["networking", "policy", "events", "insights", "trade", "awards"]),
  memberBenefit: set("membership", ["users", "file-text", "calendar", "briefcase"]),
  membershipOption: set("membership", ["building", "group", "briefcase-gold", "user-check", "factory"]),
  certification: set("services", ["stamp", "file-text", "globe", "handshake"]),
  privilegeFeature: {
    card: { src: a("privilege/icon-card.svg"), w: 36.65, h: 23.88 },
    handshake: { src: a("privilege/icon-handshake.svg"), w: 37, h: 24 },
    badge: { src: a("privilege/icon-badge.svg"), w: 36, h: 36 },
  },
  privilegeBenefit: {
    healthcare: { src: a("privilege/benefit-healthcare.svg"), w: 25, h: 23.44 },
    pharmacy: { src: a("privilege/benefit-pharmacy.svg"), w: 23.33, h: 23.29 },
    dining: { src: a("privilege/benefit-dining.svg"), w: 26.58, h: 26.58 },
    access: { src: a("privilege/benefit-access.svg"), w: 31, h: 31 },
  },
  eligibility: {
    members: { src: a("privilege/eligible-members.svg"), w: 21.5, h: 21.5 },
    staff: { src: a("privilege/eligible-staff.svg"), w: 19.73, h: 22 },
    family: { src: a("privilege/eligible-family.svg"), w: 45.74, h: 45.74, full: true },
  },
  social: {
    youtube: { src: a("footer/youtube.svg"), w: 19.68, h: 13.78 },
    facebook: { src: a("footer/facebook.svg"), w: 19.68, h: 19.68 },
    x: { src: a("footer/x.svg"), w: 33, h: 34, fullTile: true },
    linkedin: { src: a("footer/linkedin.svg"), w: 18.76, h: 18.76 },
    instagram: { src: a("footer/instagram.svg"), w: 19.68, h: 19.68 },
  },
};
