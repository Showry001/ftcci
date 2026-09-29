const a = (p) => `/assets/${p}`;

export const servicesSubNav = [
  { label: "Certificate of Origin", href: "#certificate-of-origin" },
  { label: "Liaison with Bodies", href: "#liaison" },
  { label: "Help Desk", href: "#help-desk" },
  { label: "Certification of Documents", href: "#certification" },
  { label: "Expert Committee", href: "#expert-committee" },
  { label: "CEO Forum", href: "#ceo-forum" },
  { label: "Halls & Booking", href: "#hall-booking" },
  { label: "Downloads", href: "#downloads" },
];

export const icons = {
  check: a("services/icon-check.svg"),
  checkDark: a("services/icon-check-dark.svg"),
  checkSm: a("services/icon-check-sm.svg"),
  pdf: a("services/pdf-badge.svg"),
};

export const coImage = a("services/certificate-of-origin.png");
export const coBullets = [
  "Authorized issuer under Foreign Trade Policy regulations.",
  "Attestation of invoices and allied commercial documents.",
  "Express online processing and high-security stamp verification.",
];
export const coPricing = [{ sno: "1", form: "1", price: "200.00" }];
export const coContact = [
  { label: "Contact", value: "Mr. Firasath Ali Khan" },
  { label: "Email", value: "co@ftcci.in", href: "mailto:co@ftcci.in" },
  { label: "Cheque / DD", value: "Drawn in favour of FTCCI, payable at Hyderabad" },
  { label: "NEFT / RTGS", value: "FTCCI, SBI Bazarghat (Br), Hyderabad — A/c 10005356049, IFSC SBIN0005893" },
  { label: "UPI (GPay / PhonePe)", value: "8008579630@SBI" },
  { label: "GST", value: "36AAFCT2444K1Z6" },
];
export const coFiles = [
  "Certificate of Origin form",
  "Guidelines for issuing CO & document attestation",
  "Certificate of Origin flyer",
  "Visa recommendation letter",
];

export const liaisonImage = a("services/liaison.png");
export const liaisonBullets = [
  "Representation in state advisory committees and industrial task forces.",
  "Pre-budget recommendations and direct policy critique to finance desks.",
  "Lobbying for developmental infrastructure and regulatory ease of business.",
];

export const helpdeskImage = a("services/helpdesk.png");
export const helpdeskBullets = [
  "Direct guidance on GST, Custom duties, and state commercial taxes.",
  "Assistance with industrial permit bottlenecks and licensing guidance.",
  "Expert pool access for complex trade-law dispute advisory.",
];

export const certificationCards = [
  { icon: a("services/icon-stamp.svg"), text: "Attestation of invoices, packing lists and commercial documents" },
  { icon: a("services/icon-file-text.svg"), text: "Certification supporting embassy, consular and bank requirements" },
  { icon: a("services/icon-globe.svg"), text: "Verification of member standing and business credentials" },
  { icon: a("services/icon-handshake.svg"), text: "Processed at the same desk as the Certificate of Origin" },
];

export const expertBullets = [
  "Sector and subject committees led by practising experts",
  "Study papers, memoranda and pre-budget representations",
  "Member clinics, seminars and knowledge sessions",
  "Research reports such as Ease of Doing Business and Cost of Doing Business",
];
export const expertCommittees = [
  "Agro, Food Processing & Rural Development",
  "Industrial Development",
  "Human Resources & Industrial Relations",
  "Information & Communication Technology (ICT) and Startups",
  "Energy (Power & Renewable Energy)",
  "Banking, Finance, Insurance & Capital Markets",
  "Tourism, Hospitality, Media & Entertainment",
  "Direct Taxes",
  "GST and Customs",
  "International Trade and Business Relations",
  "Shipping and Logistics",
  "Ladies Wing / Women Empowerment",
  "Membership Development & Chamber Networking",
  "Corporate Laws, Insolvency and Bankruptcy Code (IBC) & Alternative Dispute Redressal (ADR)",
  "Healthcare",
  "Environmental, Social, and Governance (ESG)",
  "Infrastructure, Real Estate and Smart Cities",
];

export const ceoImage = a("services/ceo-forum.png");
export const ceoBullets = [
  "Executive-only networking luncheons and global trade meetups.",
  "Interactive sessions with visiting diplomatic trade delegations.",
  "Exclusive access to state planning committee forecasts.",
];

export const hallsImage = a("venues/featured-hall.png");
export const hallBullets = [
  "Centrally air-conditioned auditoria, halls and board rooms",
  "Projector, audio system, podium and stage support",
  "Catering and event-support arrangements on request",
  "Concessional tariffs for FTCCI members",
];
export const hallVenues = [
  ["K.L.N. Prasad Auditorium (A/C)", "350 seats"],
  ["FTCCI Surana Auditorium (A/C)", "130 seats"],
  ["J.S. Krishna Murthy Hall (A/C)", "40 seats"],
  ["FTCCI Pokarna Skill Centre (A/C)", "35 seats"],
  ["OPT Board Room (A/C)", "14 seats"],
  ["White House Board Room (A/C)", "10 seats"],
  ["Banarsilal Gupta Exhibition Hall", "2,500 sq ft"],
  ["Dhanjibhai Sawla Hall (A/C)", "2,300 sq ft"],
];
// Hall Requisition Form (Figma "hall booking form", steps 1–4)
export const bookingHalls = [
  ["Surana Auditorium", "Cap: 130"],
  ["Krishna Murthy Hall", "Cap: 40"],
  ["K.L.N. Prasad Auditorium", "Cap: 350"],
  ["Banarsilal Exhibition Hall", "Cap: 2500 sft"],
  ["Dhanjibhai Sawla Hall", "Cap: 2500 sft"],
  ["OPT Board Room", "Cap: 14"],
  ["White House Board Room", "Cap: 10"],
  ["Pokarna Skill Center (A/C)", "Cap: 35"],
];
export const bookingEquipment = [
  "Cordless Mic",
  "LCD Projector",
  "LED TV",
  "Collar Mic",
  "Display at Entrance",
  "Lighting Lamp",
  "Inside Banners",
  "Wifi",
];
export const bookingCatering = ["Snacks & Tea", "Lunch (Veg)", "Lunch (Non-Veg)", "Dinner (Veg)", "Dinner (Non-Veg)"];
export const bookingCategories = ["Manufacturing", "Trading", "Services", "Association", "Government"];
export const hallContact = [
  { label: "Bookings", value: "Mr. Rajesh Kumar, Sr. Manager" },
  { label: "Phone", value: "+91 91001 99977", href: "tel:+919100199977" },
  { label: "Email", value: "rajesh@ftcci.in", href: "mailto:rajesh@ftcci.in", accent: true },
  { label: "Venue", value: "Federation House, 11-6-841 Federation Marg, Red Hills, Hyderabad 500004", regular: true },
];

export const downloads = [
  { type: "PDF", title: "Certificate of Origin form" },
  { type: "PDF", title: "Guidelines for issuing CO & document attestation" },
  { type: "PDF", title: "Certificate of Origin flyer" },
  { type: "PDF", title: "Visa recommendation letter" },
  { type: "LINK", title: "FTCCI halls flyer & hall requisition form" },
  { type: "PDF", title: "FTCCI Brochure (about, membership, committees, venues)" },
];
