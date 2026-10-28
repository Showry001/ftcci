import { ftcciFile } from "./files.js";

const a = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

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
const coForm = { title: "Certificate of Origin form", type: "PDF", href: ftcciFile("documents/Certificate of Origin Form.pdf") };
const coGuidelines = { title: "Guidelines for issuing CO & document attestation", type: "PDF", href: ftcciFile("documents/Guidelines for issuing CO.pdf") };
const coFlyer = { title: "Certificate of Origin flyer", type: "PDF", href: ftcciFile("downloads/Certificate of Origin.pdf") };
const visaLetter = { title: "Visa recommendation letter", type: "PDF", href: ftcciFile("documents/Visa Recommendation.pdf") };
export const coFiles = [coForm, coGuidelines, coFlyer, visaLetter];

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
  "20% discount on hall charges for FTCCI members",
];
// Halls and tariff from the FTCCI halls flyer (w.e.f. 15 July 2026). Amounts in rupees, plus GST.
export const halls = [
  { name: "K.L.N. Prasad Auditorium (A/C)", seats: "350", floor: "III Floor", deposit: "3,000", h4: "15,500", h8: "27,500" },
  { name: "FTCCI Surana Auditorium (A/C)", seats: "130", floor: "G. Floor", deposit: "2,000", h4: "10,000", h8: "18,000" },
  { name: "J.S. Krishna Murthy Hall (A/C)", seats: "40", floor: "I Floor", deposit: "1,000", h4: "6,600", h8: "12,700" },
  { name: "Banarsilal Gupta Exhibition Hall", area: "2,300 sq ft", floor: "G. Floor", deposit: "2,000", h4: "5,500", h8: "10,000" },
  { name: "Dhanjibhai Sawla Hall (A/C)", area: "2,500 sq ft", floor: "III Floor", deposit: "1,000", h4: "5,000", h8: "8,300" },
  { name: "OPT Board Room (A/C)", seats: "14", floor: "I Floor", deposit: "1,000", h4: "2,800", h8: "4,500" },
  { name: "White House Board Room (A/C)", seats: "10", floor: "I Floor", deposit: "1,000", h4: "2,500", h8: "4,000" },
  { name: "FTCCI Pokarna Skill Centre (A/C)", seats: "35", floor: "II Floor", deposit: "1,000", h4: "6,600", h8: "12,700" },
];
export const hallNotes = [
  "Tariff in ₹, plus 18% GST",
  "Extra ₹1,500 on Fridays, Saturdays, Sundays and holidays",
  "FTCCI members get 20% off hall charges",
  "Eatables are not allowed in the auditoria",
];
export const hallEquipment = [
  ["Projector / LED TV – K.L.N. Prasad Auditorium", "2,200"],
  ["Projector / LED TV – FTCCI Surana Auditorium", "1,600"],
  ["Projector / LED TV – J.S. Krishna Murthy Hall", "1,600"],
  ["Projector / LED TV – OPT Board Room", "900"],
  ["55\" TV – White House Board Room", "900"],
  ["75\" TV – Skill Centre", "800"],
  ["Screen only", "300"],
  ["Cordless / collar microphone (each)", "500"],
  ["Lighting lamp", "600"],
  ["Overtime before 9 am and after 6 pm (per hour)", "350"],
  ["LED wall power charges", "3,000"],
];
export const hallFiles = {
  flyer: { title: "FTCCI halls flyer", type: "JPG", href: ftcciFile("Events/hall flyer 2026_July 15.jpg") },
  form: { title: "Hall requisition form", type: "PDF", href: ftcciFile("downloads/Hall-Application.pdf") },
};
// Hall Requisition Form (Figma "hall booking form", steps 1–4), in the form's order
export const bookingHalls = [1, 2, 0, 3, 4, 5, 6, 7].map((i) => halls[i]);
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
  { label: "Email", value: "operations@ftcci.in", href: "mailto:operations@ftcci.in", accent: true },
  { label: "Venue", value: "Federation House, 11-6-841 Federation Marg, Red Hills, Hyderabad 500004", regular: true },
];

export const downloads = [
  coForm,
  coGuidelines,
  coFlyer,
  visaLetter,
  hallFiles.flyer,
  hallFiles.form,
  { title: "FTCCI Brochure (about, membership, committees, venues)", type: "PDF", href: ftcciFile("downloads/FTCCI Brochure.pdf") },
];
