// FTCCI Privilege Card page (Figma "Desktop - 203", 1873:22502). Registration, logins and the live partner
// offers stay on the Privilege Card portal; copy, FAQ answers and partner locations come from it too.
const a = (p) => `${import.meta.env.BASE_URL}assets/privilege/${p}`;

export const portal = {
  register: "https://privilegecard.ftcci.in/register",
  benefits: "https://privilegecard.ftcci.in/benefits",
  companyLogin: "https://privilegecard.ftcci.in/company-login",
  employeeLogin: "https://privilegecard.ftcci.in/employee-login",
};

export const privilegeSubNav = [
  { label: "Benefits", href: "#benefits" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Eligibility", href: "#eligibility" },
  { label: "Partners", href: "#partners" },
  { label: "FAQs", href: "#faqs" },
];

export const heroCard = a("hero-card.png");
export const heroFeatures = [
  { title: "Your privilege, anywhere.", text: "Simply present your FTCCI card.", icon: a("icon-card.svg"), w: 36.65, h: 23.88 },
  { title: "Quality care first.", text: "Access a verified network.", icon: a("icon-handshake.svg"), w: 37, h: 24 },
  { title: "Trusted benefits.", text: "Transparent, preferred rates.", icon: a("icon-badge.svg"), w: 36, h: 36 },
];

export const advantages = [
  { title: "Quality you can trust", text: "Carefully selected healthcare partners." },
  { title: "Savings that matter", text: "Preferred benefits across key services." },
  { title: "Convenience for everyone", text: "Easy access for members and families." },
];

// `category` opens the partner list on that filter.
export const benefits = [
  { title: "Healthcare", category: "Hospitals", icon: a("benefit-healthcare.svg"), w: 25, h: 23.44, text: "Care that puts you first. Exclusive discounts on outpatient and inpatient services at renowned partner hospitals and diagnostic centres." },
  { title: "Pharmacy", category: "Pharmacy", icon: a("benefit-pharmacy.svg"), w: 23.33, h: 23.29, text: "Everyday essentials, better value. Save on prescribed medications at partner pharmacies, making healthcare expenses more manageable." },
  { title: "Dining & lifestyle", category: "Restaurant", icon: a("benefit-dining.svg"), w: 26.58, h: 26.58, text: "More moments to enjoy. Enjoy special discounts at partner restaurants and services when you dine with your loved ones." },
  { title: "Easy access", category: "All partners", icon: a("benefit-access.svg"), w: 31, h: 31, text: "One card. Instant benefits. Connect with quality healthcare and lifestyle partners, with discounts applied right at the point of service." },
];

export const steps = [
  { title: "Present your card", text: "Show your FTCCI Health Privilege Card at a participating provider." },
  { title: "Verify your identity", text: "The partner confirms your active membership in moments." },
  { title: "Enjoy your savings", text: "Access eligible benefits directly on your bill." },
];

export const eligibility = [
  { title: "FTCCI members", text: "All registered members of FTCCI", icon: a("eligible-members.svg"), w: 21.5, h: 21.5 },
  { title: "Staff & employees", text: "100% staff and employees of member organisations", icon: a("eligible-staff.svg"), w: 19.73, h: 22 },
  { title: "Family members", text: "Includes family members of eligible members, staff and employees", icon: a("eligible-family.svg"), w: 45.74, h: 45.74, full: true },
];

export const partnerFilters = ["All partners", "Hospitals", "Diagnostics", "Pharmacy", "Restaurant"];
const p = (name, category, location, logo, w, h) => ({ name, category, location, logo: a(`partners/${logo}.png`), w, h });
export const partners = [
  p("GVK Diagnostics", "Diagnostics", "All branches", "gvk-diagnostics", 134, 72),
  p("Focus Diagnostics", "Diagnostics", "Punjagutta and Kukatpally", "focus-diagnostics", 89, 89),
  p("Tenet Diagnostics", "Diagnostics", "All branches", "tenet-diagnostics", 83, 84),
  p("Konnect Diagnostics", "Diagnostics", "All branches", "konnect-diagnostics", 119, 89),
  p("Lucid Diagnostics", "Diagnostics", "All branches", "lucid-diagnostics", 147, 47),
  p("Vijaya Diagnostic Centre", "Diagnostics", "All branches", "vijaya-diagnostic-center", 145, 80),
  p("Tapadia Diagnostic Centre", "Diagnostics", "All branches", "tapadia-diagnostic-centre", 204, 56),
  p("Tesla Diagnostics", "Diagnostics", "All branches", "tesla-diagnostics", 201, 57),
  p("NURA AI Health Screening Centre", "Diagnostics", "All branches", "nura-ai-health-screening-center", 164, 65),
  p("Sunshine Hospitals", "Hospitals", "All branches", "sunshine-hospitals", 192, 59),
  p("Arete Hospital", "Hospitals", "Gachibowli", "arete-hospital", 91, 81),
  p("Care Hospitals", "Hospitals", "Banjara Hills, HITEC City, Nampally, Malakpet and Musheerabad", "care-hospitals", 98, 84),
  p("Medicover Hospital", "Hospitals", "HITEC City", "medicover-hospital", 131, 95),
  p("KIMS Hospitals", "Hospitals", "Minister Road, Secunderabad branch only", "kims-hospitals", 187, 71),
  p("Yashoda Hospitals", "Hospitals", "Secunderabad, HITEC City, Somajiguda and Malakpet", "yashoda-hospitals", 103, 83),
  p("Gleneagles Hospital", "Hospitals", "Lakdikapul", "gleneagles-hospital", 246, 64),
  p("Premier Hospital", "Hospitals", "All branches", "premier-hospital", 196, 71),
  p("Star Hospitals", "Hospitals", "All branches", "star-hospitals", 118, 82),
  p("Virinchi Hospital", "Hospitals", "Banjara Hills", "virinchi-hospital", 170, 77),
  p("Kamineni Hospitals", "Hospitals", "L.B. Nagar", "kamineni-hospitals", 195, 64),
  p("ZOI Hospitals", "Hospitals", "Somajiguda and Attapur", "zoi-hospitals", 120, 82),
  p("Srikara Hospitals", "Hospitals", "Hyderabad, Vijayawada and Rajahmundry branches", "srikara-hospitals", 193, 68),
  p("Renova Hospitals", "Hospitals", "All branches", "renova-hospitals", 104, 92),
  p("Apollo Hospitals", "Hospitals", "Jubilee Hills, Secunderabad and Hyderguda", "apollo-hospitals", 81, 87),
  p("AIG Hospitals", "Hospitals", "Banjara Hills branch only", "aig-hospitals-banjara-hills", 260, 64),
  p("MAA ENT Hospitals", "Hospitals", "Hyderabad, Kolkata and Navi Mumbai branches", "maa-ent-hospitals", 138, 80),
  p("Ankura Hospital", "Hospitals", "Madhapur", "ankura-hospital", 146, 80),
  p("Sri Sathya Sai Sanjeevani Hospitals", "Hospitals", "All branches across India", "sri-sathya-sai-sanjeevani", 71, 86),
  p("Mahavir Hospital", "Hospitals", "AC Guards, Masab Tank", "mahavir-hospital", 90, 82),
  p("Mor Chemists & Druggists", "Pharmacy", "All branches", "mor-chemists-druggists", 188, 50),
  p("Pharma Plus", "Pharmacy", "All branches", "pharma-plus", 107, 76),
  p("Apollo Pharmacy", "Pharmacy", "Apollo retail pharmacies across India", "apollo-pharmacy", 85, 88),
  p("Bhagwati Medical Agencies", "Pharmacy", "Begum Bazar", "bhagwati-medical-agencies", 146, 79),
  p("Tatva Restaurant", "Restaurant", "Jubilee Hills", "tatva-restaurant", 70, 83),
  p("Hotel Rajdhani", "Restaurant", "All branches", "hotel-rajdhani", 238, 74),
  p("Mercure Hotel Hyderabad KCP", "Restaurant", "Punjagutta", "mercure-hotel-hyderabad-kcp", 160, 74),
  p("Chubby Cho", "Restaurant", "All branches", "chubby-cho", 137, 78),
  p("Makobrew World Coffee Bar", "Restaurant", "Jubilee Hills", "makobrew-world-coffee-bar", 109, 78),
  p("Peanuts Bar", "Restaurant", "All branches", "peanuts-bar", 83, 83),
  p("The Platinum Hotel", "Restaurant", "All branches", "the-platinum-hotel", 149, 70),
  p("Hyderabad Marriott Hotel & Convention Centre", "Restaurant", "Hyderabad", "hyderabad-marriott", 107, 71),
  p("Taj Deccan", "Restaurant", "Banjara Hills", "taj-deccan-hyderabad", 80, 83),
  p("Hyatt Place Hyderabad Banjara Hills", "Restaurant", "Banjara Hills", "hyatt-place-hyderabad-banjara-hills", 77, 82),
  p("Parampara – The Mithai Shop", "Restaurant", "All branches", "parampara-the-mithai-shop", 126, 71),
  p("Aalankrita Resorts and Convention", "Restaurant", "Shameerpet", "aalankrita-resorts-and-convention", 216, 70),
  p("Cream Stone Icecreams", "Restaurant", "Selected outlets", "cream-stone-icecreams", 124, 71),
];

export const faqs = [
  { q: "Do I need to carry Physical Card to avail benefit?", a: "You can carry either the physical card or the e-card, along with your Aadhaar card, to avail the benefit from the service provider." },
  { q: "I want to avail service now; do I get the card instantly?", a: "You have to register your details under your company's registration link on the FTCCI Privilege Card portal." },
  { q: "I am registering online. Can I pay in cash to anyone?", a: "Your organisation's team will coordinate with you to complete your registration and the payment." },
  { q: "I am registering offline. Can I make payment online?", a: "Your organisation's team will coordinate with you to complete your registration and the payment." },
  { q: "Is this a Family Card?", a: "Every family member can avail the benefit after individual registration and an individual payment of Rs. 200/-." },
  { q: "Do all Family Members need to register personally?", a: "Family members can be registered by the employee of the registered member organisation covered under this offer." },
  { q: "Can kids use the card of their parents?", a: "No. Every individual is issued a separate card with a unique ID." },
  { q: "Kids/Parents do not have Mobile Number/Email", a: "The card is issued under the guardian member's mobile number, with the child's or parent's Aadhaar details registered." },
  { q: "Will registration charges be less if I register at later date?", a: "No. The registration charges stay the same whenever you register for the FTCCI Privilege Card." },
];

export const privilegeContact = {
  email: "privilegecard@ftcci.in",
  phones: [
    { label: "+91 86884 00904", tel: "+918688400904" },
    { label: "+91 78159 50242", tel: "+917815950242" },
  ],
  hours: "10 AM to 6 PM",
};
export const icons = {
  pin: a("icon-pin.svg"),
  arrow: a("icon-arrow-up-right.svg"),
  search: a("icon-search.svg"),
  plus: a("icon-plus.svg"),
};
