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
  { tag: "Conference", title: "International Conference on Women Empowerment", subtitle: "Driving Inclusive Growth and Leadership", date: "10 September 2026 | 09:00 AM – 06:00 PM", venue: "Cyber Gardens, Hitech City, Hyderabad", image: a("events/card-women-empowerment.png"), slug: "women-empowerment-conference" },
  { tag: "Expo", title: "Urban Farming & Kitchen Gardening Expo 2026", subtitle: "Sustainable Agriculture and Green Living", date: "12 August 2026 | 10:00 AM – 6:00 PM", venue: "Federation House, Hyderabad", image: a("events/card-urban-farming.png"), slug: "urban-farming-expo-2026" },
  { tag: "Forum", title: "CEO Forum – Quarterly Business Meet", subtitle: "Industry Outlook & Growth Strategies", date: "15 July 2025 | 3:00 PM", venue: "Federation Marg, Red Hills, Hyderabad", image: a("events/card-ceo-forum.png"), href: "/services#ceo-forum" },
  { tag: "Conference", title: "International Conference on Women Empowerment", subtitle: "Driving Inclusive Growth and Leadership", date: "2026-09-10 | 09:00 AM – 05:00 PM", venue: "Cyber Gardens, Hitech City, Hyderabad", image: a("events/card-women-empowerment.png"), slug: "women-empowerment-conference" },
  { tag: "Expo", title: "Urban Farming & Kitchen Gardening Expo 2026", subtitle: "Sustainable Agriculture and Green Living", date: "2026-08-12 | 10:00 AM – 06:00 PM", venue: "Federation House, Hyderabad", image: a("events/card-urban-farming.png"), slug: "urban-farming-expo-2026" },
  { tag: "Forum", title: "CEO Forum – Quarterly Business Meet", subtitle: "Industry Outlook & Growth Strategies", date: "2026-08-25 | 03:00 PM – 07:00 PM", venue: "FTCCI Board Room, Hyderabad", image: a("events/card-ceo-forum.png"), href: "/services#ceo-forum" },
];
// No past-events layout exists on Page 1; add entries here and they render with the same card.
export const pastEvents = [];

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
