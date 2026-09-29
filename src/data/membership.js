const a = (p) => `/assets/${p}`;

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

export const membershipOptions = [
  { title: "Large Companies", icon: a("membership/icon-award.svg"), iconSize: 30, text: "For large companies and major business organisations seeking representation, networking and industry engagement." },
  { title: "Associations & Societies", icon: a("membership/icon-compass.svg"), iconSize: 30, text: "Build stronger industry connections and participate in collective policy and networking initiatives." },
  { title: "Companies", icon: a("membership/icon-user.svg"), iconSize: 38, text: "For registered companies seeking FTCCI membership and access to business, policy and networking opportunities." },
  { title: "Professionals / Firms", icon: a("membership/icon-award.svg"), iconSize: 30, text: "For eligible professionals and firms seeking meaningful industry connections and engagement." },
  { title: "MSMEs", icon: a("membership/icon-compass.svg"), iconSize: 30, text: "Benefit from business networking, knowledge resources, support services and industry engagement." },
];
export const optionArrow = a("membership/icon-arrow-right.svg");

export const steps = [
  { n: "01", title: "Choose your membership", text: "Review our corporate, associate, and professional tiers to find the right scope of features." },
  { n: "02", title: "Submit your application", text: "Fill out our streamlined online directory registration form with your commercial credentials." },
  { n: "03", title: "Membership review", text: "Our vetting committee reviews your application package to ensure community alignment." },
  { n: "04", title: "Become part of FTCCI", text: "Receive your official seal, access your member dashboard, and begin networking." },
];
export const stepLine = a("membership/step-line.png");

export const experienceBg = a("membership/experience-bg.png");
export const experienceStats = [
  { value: "3,000+", label: "Member organizations" },
  { value: "100+", label: "Events every year" },
  { value: "18+", label: "Expert committees" },
  { value: "100+", label: "Years of legacy" },
];
export const ctaArrowWhite = a("membership/icon-arrow-right-white.svg");
