// All copy and asset paths for the FTCCI home page, taken from the Figma file.
// Assets live in /public/assets and are fetched from Figma by `npm run assets`.

const a = (p) => `/assets/${p}`;

export const assets = {
  logo: a("header/logo.png"),
  footerLogo: a("footer/logo.png"),
  search: a("header/search.svg"),
  searchMobile: a("mobile/search.svg"),
  menu: a("mobile/menu.svg"),
  arrowWhite: a("icons/arrow-white.svg"),
  arrowNavy: a("icons/arrow-navy.svg"),
  heroVideo: a("hero/hero.mp4"),
  checks: [a("form/check-1.svg"), a("form/check-2.svg"), a("form/check-3.svg")],
  whoWeAreBg: a("about/who-we-are-bg.png"),
  membersNetworking: a("about/members-networking.png"),
  eventArrowPrev: a("events/arrow-prev.svg"),
  eventArrowNext: a("events/arrow-next.svg"),
  iconCalendar: a("events/icon-calendar.svg"),
  iconLocation: a("events/icon-location.svg"),
  venueFeatured: a("venues/featured-hall.png"),
  venueCheckFirst: a("venues/check-1.svg"),
  venueCheck: a("venues/check.svg"),
  pubArrowPrev: a("publications/arrow-prev.svg"),
  pubArrowNext: a("publications/arrow-next.svg"),
  benefitsBg: a("benefits/benefits-bg.png"),
  businessSummit: a("benefits/business-summit.png"),
  privilegeCard: a("card/privilege-card.png"),
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
  { label: "Contact", to: "/contact" },
];

export const formPerks = ["Weekly updates", "Event invites", "Member deals"];

export const quickActions = [
  { label: "Become a Member", icon: a("mobile/icon-user-plus.svg"), href: "/membership" },
  { label: "Book a Hall", icon: a("mobile/icon-calendar.svg"), href: "/services#hall-booking" },
  { label: "Certificate of Origin", icon: a("mobile/icon-file-text.svg"), href: "/services#certificate-of-origin" },
  { label: "Upcoming Events", icon: a("mobile/icon-bell.svg"), href: "/events" },
];

export const leaders = [
  {
    name: "Mr. K. K. Maheshwari",
    role: "President, FTCCI",
    image: a("leadership/president.png"),
    // crop of the portrait inside its 172.7px frame, from Figma
    crop: { width: "99.85%", height: "113.38%", left: "0.04%", top: "-0.11%" },
  },
  {
    name: "Mr. Srinivas Garimella",
    role: "Senior Vice President, FTCCI",
    image: a("leadership/senior-vice-president.png"),
    crop: { width: "111.3%", height: "139.61%", left: "-5.66%", top: "-10.31%" },
  },
  {
    name: "Mr. Vinod Kumar Agarwal",
    role: "Vice President, FTCCI",
    image: a("leadership/vice-president.png"),
    crop: { width: "117.12%", height: "128.69%", left: "-1.5%", top: "-2.6%" },
  },
];

// The design shows a 3-slide carousel but only one event is designed.
// Replace the repeated entries with real events.
const womenEmpowerment = {
  organiser: "FTCCI",
  title: "International Conference on Women Empowerment",
  date: "Thursday, August 13, 2026 · 9:00 AM – 5:00 PM",
  venue: "Cyber Gardens, Hitech City, Hyderabad",
  image: a("events/women-empowerment.png"),
  href: "/events/women-empowerment-conference",
};
export const events = [womenEmpowerment, womenEmpowerment, womenEmpowerment];

export const venueHighlights = [
  "State-of-the-art infrastructure",
  "Centrally located in Hyderabad",
  "Professional support for seamless events",
  "Customizable spaces to suit different requirements",
];

export const venues = [
  { name: "KLN Prasad Auditorium", detail: "350 seating capacity", image: a("venues/kln-prasad-auditorium.png"), crop: { box: "72.28%", width: "139.46%", height: "186.53%", left: "-19.66%", top: "0.07%" } },
  { name: "FTCCI Surana Auditorium", detail: "130 seating capacity", image: a("venues/surana-auditorium.png") },
  { name: "JS Krishna Murthy Hall", detail: "40 seating capacity", image: a("venues/js-krishna-murthy-hall.png"), crop: { width: "139.24%", height: "100%", left: "-28.41%", top: "0" } },
  { name: "Banarsilal Gupta Exhibition Hall", detail: "2500 sq. ft.", image: a("venues/banarsilal-gupta-hall.png") },
  { name: "Dhanjibhai Sawla Hall", detail: "2500 sq. ft.", image: a("venues/dhanjibhai-sawla-hall.png"), crop: { width: "139.46%", height: "100%", left: "-39.35%", top: "-0.07%" } },
  { name: "OPT Board Room", detail: "14 seating capacity", image: a("venues/opt-board-room.png") },
  { name: "White House Board Room", detail: "10 seating capacity", image: a("venues/white-house-board-room.png") },
  { name: "FTCCI Pokarna Skill Center Hall", detail: "35 seating capacity", image: a("venues/pokarna-skill-center.png") },
];

export const featuredNews = {
  tag: "News",
  date: "Aug 07, 2026",
  title: "FTCCI submits pre-budget memorandum to the State Government",
  excerpt:
    "This is welcome news for traders, businesses, communities and those relying on the movement of time-sensitive goods across Telangana and beyond.",
  image: a("news/pre-budget-memorandum.png"),
};

export const news = [
  {
    tag: "News",
    date: "Jul 31, 2026",
    title: "Chamber's Industry Leaders Join Trade Minister's Strategic Exports Advisory Council",
    image: a("news/exports-advisory-council.png"),
    mobileImage: a("mobile/news-exports-advisory-council.png"),
  },
  {
    tag: "News",
    date: "Jul 28, 2026",
    title: "Proposed Tariffs Stack onto the Ongoing Investment Freeze",
    image: a("news/proposed-tariffs.png"),
  },
  {
    tag: "News",
    date: "Jul 26, 2026",
    title: "Export Economy Sees Renewed Growth Amid Policy Shifts",
    image: a("news/export-economy.png"),
  },
];

const PDF = "https://www.ftcci.in/source/";
export const publications = [
  { date: "30 Jun 2026", title: "Telangana Delegation to EXPO 2020", image: a("publications/expo-2020.png"), href: `${PDF}Research%20and%20Publications/FTCCI%20Delegation%20to%20EXPO%202020_web.pdf` },
  { date: "30 Jun 2026", title: "Report on Pulses", image: a("publications/report-on-pulses.png"), href: `${PDF}Research%20and%20Publications/Report%20on%20Pulses_final_April%2012.pdf` },
  { date: "30 Jun 2026", title: "Study Tour on Green TVET in Germany", image: a("publications/green-tvet-germany.png"), href: `${PDF}Research%20and%20Publications/Study%20Tour%20Report.pdf` },
  { date: "30 Jun 2026", title: "101 Annual Report 2017-18", image: a("publications/annual-report-2017-18.png"), href: `${PDF}AR2017-18.pdf` },
  { date: "30 Jun 2026", title: "109th Annual Report 2025-26", image: a("publications/annual-report-2025-26-a.png"), href: "#" },
  { date: "30 Jun 2026", title: "109th Annual Report 2025-26", image: a("publications/annual-report-2025-26-b.png"), href: "#" },
  { date: "30 Jun 2026", title: "109th Annual Report 2025-26", image: a("publications/annual-report-2025-26-c.png"), href: "#" },
  { date: "30 Jun 2026", title: "109th Annual Report 2025-26", image: a("publications/annual-report-2025-26-d.png"), href: "#" },
];

export const benefits = [
  { label: "Business Networking", icon: a("benefits/icon-networking.svg") },
  { label: "Policy Advocacy", icon: a("benefits/icon-policy.svg") },
  { label: "Exclusive Events", icon: a("benefits/icon-events.svg") },
  { label: "Industry Insights", icon: a("benefits/icon-insights.svg") },
  { label: "Trade & B2B Opportunities", icon: a("benefits/icon-trade.svg") },
  { label: "Awards & Recognition", icon: a("benefits/icon-awards.svg") },
];

export const socialLinks = [
  { label: "YouTube", icon: a("footer/youtube.svg"), w: 19.68, h: 13.78, href: "#" },
  { label: "Facebook", icon: a("footer/facebook.svg"), w: 19.68, h: 19.68, href: "#" },
  { label: "X", icon: a("footer/x.svg"), w: 33, h: 34, href: "#", fullTile: true },
  { label: "LinkedIn", icon: a("footer/linkedin.svg"), w: 18.76, h: 18.76, href: "#" },
  { label: "Instagram", icon: a("footer/instagram.svg"), w: 19.68, h: 19.68, href: "#" },
];

export const quickLinks = [
  { label: "About FTCCI", to: "/about" },
  { label: "Membership", to: "/membership" },
  { label: "Events & Summits", to: "/events" },
  { label: "Publications", to: "/knowledge/publications" },
  { label: "Committees", to: "/services#expert-committee" },
  { label: "Awards", to: "/media" },
  { label: "Media Gallery", to: "/media" },
  { label: "Career", to: "/contact" },
];

export const legalLinks = ["Privacy Policy", "Terms of Use", "Sitemap"];
