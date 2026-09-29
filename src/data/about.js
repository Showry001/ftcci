const a = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

export const aboutSubNav = [
  { label: "History", href: "#history" },
  { label: "Vision", href: "#vision" },
  { label: "Objectives", href: "#objectives" },
  { label: "Office Bearers", href: "#office-bearers" },
  { label: "Managing Committee", href: "#managing-committee" },
  { label: "FTCCI Secretariat", href: "#secretariat" },
  { label: "Past Presidents", href: "#past-presidents" },
];

export const kpis = [
  { value: "1917", label: "Founded in Hyderabad" },
  { value: "3,000+", label: "Member enterprises" },
  { value: "18+", label: "Expert committees" },
  { value: "100+", label: "Events every year" },
];

export const timeline = [
  { year: "1917", text: "Founded to represent trade and industry, establishing a trusted platform that united businesses and promoted commercial growth across the region.", image: a("about/timeline-1917.png") },
  { year: "1956", text: "Expanded its role to support industrial development, strengthen business collaboration, and contribute to the region's economic progress.", image: a("about/timeline-1956.png") },
  { year: "2014", text: "Continued its legacy by fostering Telangana's business ecosystem through policy advocacy, industry engagement, and strategic partnerships following the formation of the state.", image: a("about/timeline-2014.png") },
  { year: "Today", text: "A leading chamber of commerce connecting businesses, government, and industry through advocacy, networking, knowledge sharing, and initiatives that drive sustainable economic growth.", image: a("about/timeline-1917.png") },
];

export const vision = {
  title: "Our Vision",
  icon: a("about/icon-eye.svg"),
  text: "Be the voice of Industry, Commerce and Trade, foster healthy & pro-business environment, aim on issue advocacy while nurturing sustainable industrial development.",
};
export const mission = {
  title: "Our Mission",
  icon: a("about/icon-target.svg"),
  text: "Assist in creating a conducive business climate in the state of Telangana while relentlessly leading the business community towards sustainable economic growth.",
};

export const objectivesImage = a("about/empower-industry.png");
export const objectives = [
  { title: "Policy Advocacy", text: "Shaping business-friendly policies and regulations." },
  { title: "Global Linkages", text: "Connecting Telangana businesses with global networks." },
  { title: "Business Facilitation", text: "Expanding trade and market opportunities." },
  { title: "MSME Support", text: "Supporting growth, compliance, and digital adoption." },
  { title: "Knowledge & Capacity", text: "Building skills through seminars and workshops." },
  { title: "Institution Building", text: "Strengthening business, innovation, and dispute-resolution ecosystems." },
];

export const committeeImage = a("about/managing-committee.png");
export const committeePanels = ["Panel A", "Panel B", "Panel C", "Panel D", "Panel E"];
// Only Panel A is populated in the design; add members for the other panels here.
export const committee = [
  { name: "Sri C. V. Anirudh Rao", company: "CVSV Agritech & Exim Ltd", panel: "Panel A" },
  { name: "Sri Manoj Kumar Agarwal", company: "DSL Infrastructure and Space Developers Pvt. Ltd.", panel: "Panel A" },
  { name: "Sri Vinod Kumar Agarwal", company: "Mahalakshmi Profiles Pvt. Ltd", panel: "Panel A" },
  { name: "Sri Pankaj Kumar Diwan", company: "Jeevaka Industries Pvt Ltd", panel: "Panel A" },
  { name: "Sri Chakravarthi AVPS", company: "Ecobliss India Private Limited", panel: "Panel A" },
  { name: "Sri Meela Sanjay", company: "Sudhakar PVC Product Pvt Ltd", panel: "Panel A" },
  { name: "Sri Manish Gupta", company: "Dilip Re-Rolling Pvt Ltd", panel: "Panel A" },
];

// The design repeats the same four people in both rows; replace with the full secretariat list.
const secretariatRow = [
  { name: "Shri Vidyadhar Prabhudesai", role: "Director & Head of Services" },
  { name: "Mr. T. Sujatha Kasturi", role: "Joint Director & Advocacy" },
  { name: "Mrs. J. Karthyayini Molly", role: "Manager - Communications & Media" },
  { name: "Ms. Mansi Sharma", role: "Manager - Membership & Events" },
];
export const secretariat = [...secretariatRow, ...secretariatRow];

export const pastPresidents = [
  { name: "Sri O. Swaminatha Reddy", company: "Chairman, Sagar Cements Ltd.", term: "1980 - 1981" },
  { name: "Sri R. Ravi Kumar", company: "Managing Director, ZetatekTechnologies Pvt. Ltd.", term: "2025–26" },
  { name: "Dr. Suresh Kumar Singhal", company: "Vijay Iron Foundry Pvt. Ltd.", term: "2024–25" },
  { name: "Sri Meela Jayadev", company: "Sudhakar Polymers Pvt. Ltd.", term: "2023–24" },
  { name: "Sri Anil Agarwal", company: "Jeevaka Industries Pvt.", term: "2022–23" },
  { name: "Sri K. Bhasker Reddy", company: "Managing Director, Creamline Dairy Products Ltd.", term: "2021–22" },
  { name: "Sri Karunendra S. Jasti", company: "Managing Director, 3D Foamcut Pvt. Ltd.", term: "2019–20" },
  { name: "CA Arun Luharuka", company: "Partner, Luharuka & Associates", term: "2018–19" },
  { name: "Sri Ravindra Modi", company: "Managing Director, Hyderabad Food Products Pvt. Ltd.", term: "2016–17" },
  { name: "Sri Anil Reddy Vennam", company: "Technical Director, Nayastrap Private Limited", term: "2015–16" },
  { name: "Sri Srinivas Ayyadevara", company: "Chartered Accountant", term: "2013–14" },
  { name: "Sri Shekhar Agarwal", company: "Managing Director, Bhagyanagar Polymers Pvt. Ltd.", term: "2010–11" },
];
