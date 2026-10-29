import { membershipPanels } from "../../shared/forms.js";
import { ftcciFile } from "./files.js";

const a = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

export const membershipSubNav = [
  { label: "Why Join FTCCI", href: "#why-join" },
  { label: "Membership Benefits", href: "#benefits" },
  { label: "Membership Options", href: "#options" },
  { label: "How to Apply", href: "#apply" },
  { label: "FTCCI Experience", href: "#experience" },
];

export const pillars = [
  { n: "01", title: "Connect", text: "Build meaningful relationships with business leaders, entrepreneurs and industry experts." },
  { n: "02", title: "Inspire", text: "Represent your business interests and contribute to conversations shaping industry and policy." },
  { n: "03", title: "Grow", text: "Access knowledge, events, business opportunities and platforms designed to help your organisation grow." },
  { n: "04", title: "Lead", text: "Position your organisation within Telangana’s leading business community and participate in industry initiatives." },
];

export const benefitsPhoto = a("membership/benefits-photo.png");
export const memberBenefits = [
  { title: "Business Networking", icon: a("membership/icon-users.svg"), text: "Connect with entrepreneurs, corporates and industry leaders through FTCCI's extensive business network." },
  { title: "Policy Advocacy", icon: a("membership/icon-file-text.svg"), text: "Get a stronger platform to raise business concerns and contribute to policy discussions." },
  { title: "Events & Opportunities", icon: a("membership/icon-calendar.svg"), text: "Participate in conferences, seminars, trade events, exhibitions and business forums." },
  { title: "Learning & Development", icon: a("membership/icon-briefcase.svg"), text: "Access workshops, training programmes and expert-led sessions for professional growth." },
];

// One card per membership panel (names shared with the application form); each button jumps to that
// panel's document checklist.
const optionDetails = {
  a: { cta: "Join as a Large Company", icon: a("membership/icon-building.svg"), text: "For large companies and major business organisations seeking representation, networking and industry engagement." },
  b: { cta: "Join as an Association", icon: a("membership/icon-group.svg"), text: "Build stronger industry connections and participate in collective policy and networking initiatives." },
  c: { cta: "Join as a Company", icon: a("membership/icon-briefcase-gold.svg"), text: "For registered companies seeking FTCCI membership and access to business, policy and networking opportunities." },
  d: { cta: "Join as a Professional", icon: a("membership/icon-user-check.svg"), text: "For eligible professionals and firms seeking meaningful industry connections and engagement." },
  e: { cta: "Join as an MSME", icon: a("membership/icon-factory.svg"), text: "Benefit from business networking, knowledge resources, support services and industry engagement." },
};
export const membershipOptions = membershipPanels.map((p) => ({ title: p.label, panel: p.value, ...optionDetails[p.value] }));
export const optionArrow = a("membership/icon-arrow-right.svg");

export const steps = [
  { n: "01", title: "Choose your membership", text: "Review our corporate, associate, and professional tiers to find the right scope of features." },
  { n: "02", title: "Submit your application", text: "Fill out our streamlined online directory registration form with your commercial credentials." },
  { n: "03", title: "Membership review", text: "Our vetting committee reviews your application package to ensure community alignment." },
  { n: "04", title: "Become part of FTCCI", text: "Receive your official seal, access your member dashboard, and begin networking." },
];
export const stepLine = a("membership/step-line.png");

// Documents to file with the membership application, from ftcci.in/pages/how-to-apply
const representatives = "Photograph & PAN copies of 3 representatives in the application form (the first is mandatory, the other two optional)";
export const panelDocuments = [
  { panel: "a", title: "Panel A · Large Companies", docs: ["GST", "Registration of Firm", "Firm / Company PAN", representatives, "Procuration by firm, company or board resolution, or declaration by individual on letterhead (format in the application)", "Certificate of Partnership / Incorporation / Association", "IEC (optional)"] },
  { panel: "b", title: "Panel B · Associations & Societies", docs: ["Certificate of GST, or Certificate of Registration of Society / Association", "Association PAN", representatives, "Managing Committee list", "Members list (optional)"] },
  { panel: "c", title: "Panel C · Companies", docs: ["GST", "Company PAN", representatives, "Resolution of the Board of Directors on letterhead (format in the application)", "Certificate of Incorporation copy", "IEC (optional)", "SSI / MSME / Udyog Aadhar (optional)"] },
  { panel: "d", title: "Panel D · Professionals / Firms", docs: ["ID", "PAN card", "Photograph", "Professional certificate"] },
  { panel: "e", title: "Panel E · MSMEs", docs: ["GST", "PAN card of proprietor", "Photograph", "Procuration by firm, Board resolution, or self-declaration by individual on letterhead (prescribed format)", "IEC (optional)", "SSI / MSME / Udyog Aadhar (optional)"] },
];
export const membershipFiles = [
  { title: "Membership application form & tariff", href: ftcciFile("documents/membershipform.pdf") },
  { title: "Indemnity bond", href: ftcciFile("downloads/IB format.pdf") },
  { title: "Membership benefits", href: ftcciFile("downloads/Membership Benefits.pdf") },
  { title: "FTCCI brochure", href: ftcciFile("downloads/FTCCI Brochure.pdf") },
];
export const membershipContacts = [
  { email: "membership@ftcci.in", phone: "+91 91001 99978", tel: "+919100199978" },
  { email: "membershelp@ftcci.in", phone: "+91 80085 79629", tel: "+918008579629" },
];

export const experienceBg = a("membership/experience-bg.png");
export const experienceStats = [
  { value: "3,000+", label: "Member organizations" },
  { value: "100+", label: "Events every year" },
  { value: "18+", label: "Expert committees" },
  { value: "100+", label: "Years of legacy" },
];
export const ctaArrowWhite = a("membership/icon-arrow-right-white.svg");
