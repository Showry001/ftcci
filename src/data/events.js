const a = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

export const eventIcons = {
  calendar: a("events/icon-calendar-gold.svg"),
  pin: a("events/icon-pin-gold.svg"),
  check: a("events/detail-check.svg"),
  detailCalendar: a("events/detail-calendar.svg"),
  detailPin: a("events/detail-pin.svg"),
  detailStatus: a("events/detail-status.svg"),
};

// Event listing (Events page). `slug` links to a detail page when one is designed.
export const upcomingEvents = [
  { title: "International Conference on Women Empowerment", subtitle: "Driving Inclusive Growth and Leadership", date: "2026-09-10 | 09:00 AM – 05:00 PM", venue: "Cyber Gardens, Hitech City, Hyderabad", image: a("events/card-women-empowerment.png"), slug: "women-empowerment-conference" },
  { title: "Urban Farming & Kitchen Gardening Expo 2026", subtitle: "Sustainable Agriculture and Green Living", date: "2026-08-12 | 10:00 AM – 06:00 PM", venue: "Federation House, Hyderabad", image: a("events/card-urban-farming.png"), slug: "urban-farming-expo-2026" },
  { title: "CEO Forum – Quarterly Business Meet", subtitle: "Industry Outlook & Growth Strategies", date: "2026-08-25 | 03:00 PM – 07:00 PM", venue: "FTCCI Board Room, Hyderabad", image: a("events/card-ceo-forum.png"), href: "/services#ceo-forum" },
  { title: "International Conference on Women Empowerment", subtitle: "Driving Inclusive Growth and Leadership", date: "2026-09-10 | 09:00 AM – 05:00 PM", venue: "Cyber Gardens, Hitech City, Hyderabad", image: a("events/card-women-empowerment.png"), slug: "women-empowerment-conference" },
  { title: "Urban Farming & Kitchen Gardening Expo 2026", subtitle: "Sustainable Agriculture and Green Living", date: "2026-08-12 | 10:00 AM – 06:00 PM", venue: "Federation House, Hyderabad", image: a("events/card-urban-farming.png"), slug: "urban-farming-expo-2026" },
  { title: "CEO Forum – Quarterly Business Meet", subtitle: "Industry Outlook & Growth Strategies", date: "2026-08-25 | 03:00 PM – 07:00 PM", venue: "FTCCI Board Room, Hyderabad", image: a("events/card-ceo-forum.png"), href: "/services#ceo-forum" },
];
// Past Events (Figma "events" 2102:32572): financial-year filters (June–May) and the event list.
export const pastPeriods = [2025, 2024, 2023, 2022, 2021, 2020].map((y) => ({ start: y, label: `June ${y} - May ${y + 1}` }));

// `date` is ISO so the list can be filtered by period; `crop` reproduces the Figma image crops.
export const pastEvents = [
  { title: "Virtual Talk on 2-Deoxy-D-Glucose (2-DG)", date: "2021-06-08", image: a("events/past/2dg-virtual-talk.png"), crop: { width: "352.49%", height: "100%", left: "-164.71%", top: "-0.02%" } },
  { title: "Combating Mucormycosis (Black Fungus)", date: "2021-06-04", image: a("events/past/mucormycosis.png"), crop: { width: "435.47%", height: "100%", left: "-217.99%", top: "0.22%" } },
  { title: "Corporate Governance and Risk Management", date: "2021-06-03", image: a("events/past/corporate-governance.png") },
  { title: "Interaction with Mr. Anjani Kumar, IPS, Commissioner of Police, Hyderabad City", date: "2021-05-31", image: a("events/past/anjani-kumar.png") },
  { title: "Rebooting the MSME through Financial Re-engineering", date: "2021-05-29", image: a("events/past/msme-rebooting.png") },
  { title: "Fund Raising for SMEs and Start-ups through Capital Markets and Role of Intermediaries in Channeling Funds", date: "2021-05-28", image: a("events/past/fund-raising.png"), crop: { width: "173.28%", height: "100%", left: "-0.22%", top: "0.29%" } },
  { title: "Interaction with Mr. V. C. Sajjanar, IPS, Commissioner of Police, Cyberabad", date: "2021-05-22", image: a("events/past/sajjanar.png"), crop: { width: "100%", height: "135.68%", left: "0", top: "-17.55%" } },
  { title: "Naturopathy & COVID-19", date: "2021-05-21", image: a("events/past/naturopathy.png") },
  { title: "Interaction with Mr. Mahesh Bhagwat, IPS, Commissioner of Police, Rachakonda", date: "2021-05-18", image: a("events/past/mahesh-bhagwat.png") },
  { title: "How FTCCI Can Help Associations / Business Chambers", date: "2021-04-30", image: a("events/past/associations.png") },
];

const expectDefault = [
  "Keynote addresses from industry leaders and policymakers",
  "Panel discussions on current business trends and opportunities",
  "Networking sessions with 500+ business professionals",
  "Exhibition area showcasing innovative products and services",
];

export const eventDetails = {
  "women-empowerment-conference": {
    tag: "Conference",
    title: "International Conference on Women Empowerment",
    intro: "A platform bringing together business leaders, entrepreneurs, policymakers, and professionals to discuss women’s leadership, entrepreneurship, economic participation, and opportunities for inclusive growth.",
    about: "The International Conference on Women Empowerment brings together women entrepreneurs, policymakers, MSMEs, industry leaders, investors, academicians, innovators and global experts to explore new pathways for women’s economic empowerment and leadership.",
    expect: expectDefault,
    date: "10 September 2026 | 09:00 AM – 06:00 PM",
    venue: "Cyber Gardens, Hitech City, Hyderabad",
    status: "Upcoming",
    image: a("events/women-empowerment.png"),
    crop: null,
  },
  "urban-farming-expo-2026": {
    tag: "Expo",
    title: "Urban Farming & Kitchen Gardening Expo 2026",
    intro: "Discover innovative urban farming and kitchen gardening solutions for healthier, more sustainable city living.",
    about: "Urban Farming & Kitchen Gardening Expo 2026 brings together urban farming enthusiasts, growers, businesses, and experts to explore sustainable ways of growing fresh food in urban spaces.",
    expect: [
      "Urban farming and kitchen gardening solutions",
      "Innovative gardening products and techniques",
      "Expert insights on sustainable cultivation",
      "Ideas for growing fresh food at home",
    ],
    date: "12 August 2026 | 10:00 AM – 6:00 PM",
    venue: "Federation House, Red Hills, Hyderabad",
    status: "Upcoming",
    image: a("events/detail-urban-farming.png"),
    crop: { width: "100%", height: "113.05%", left: "0", top: "-6.63%" },
  },
  "agm-2026": {
    tag: "AGM",
    title: "Annual General Meeting 2026",
    intro: "Annual General Meeting 2026 brings FTCCI members together to review the Chamber’s activities and achievements, discuss key priorities, and outline the direction for the year ahead.",
    about: "The Annual General Meeting brings FTCCI members together to review the Federation’s activities and achievements, consider the annual report and financial statements, and discuss key matters concerning the Federation.",
    expect: expectDefault,
    date: "15 July 2025 | 3:00 PM",
    venue: "Federation Marg, Red Hills, Hyderabad",
    status: "Upcoming",
    image: a("events/detail-agm.png"),
    crop: { width: "100.17%", height: "101.5%", left: "-0.08%", top: "-1.5%" },
  },
};
