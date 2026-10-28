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

// History carousel (Figma "history" component): one archival photo per milestone.
export const historyArrow = a("about/icon-history-arrow.svg");
export const timeline = [
  { year: "1917", title: "The Beginning of a Legacy", text: "The Hyderabad Chamber of Commerce was established to represent the business and trading community across the erstwhile Hyderabad State", image: a("about/history-1917.jpg") },
  { year: "1956", title: "A Federation Is Established", text: "The formation of Andhra Pradesh marked a major administrative change, paving the way for the Chamber's broader regional role.", image: a("about/history-1956.jpg") },
  { year: "1958", title: "A Federation Is Established", text: "The organisation became the Federation of Andhra Pradesh Chambers of Commerce and Industry (FAPCCI), expanding its representation across the state.", image: a("about/history-1958.jpg") },
  { year: "2002", title: "Industry Connections", text: "FTAPCCI continued bringing together industry representatives and business leaders.", image: a("about/history-2002.jpg") },
  { year: "2005", title: "Government Engagement", text: "FTAPCCI hosted interactions with national leaders, supporting dialogue on business and economic matters.", image: a("about/history-2005.jpg") },
  { year: "2010", title: "Engaging with National Leaders", text: "FTAPCCI welcomed distinguished leaders and facilitated interactions with the industry community.", image: a("about/history-2010.jpg") },
  { year: "2012", title: "Industry–Government Dialogue", text: "FTAPCCI continued representing business interests through discussions with government and industry stakeholders.", image: a("about/history-2012.jpg") },
  { year: "2013", title: "Promoting Industry Growth", text: "FTAPCCI continued its work connecting businesses, policymakers and industry representatives.", image: a("about/history-2013.jpg") },
  { year: "2014", title: "A New Chapter for Telangana", text: "The formation of Telangana marked a new phase in the Federation's regional representation.", image: a("about/history-2014.jpg") },
  { year: "2015", title: "A New Identity", text: "On 14 January 2015, the Federation became the Federation of Telangana and Andhra Pradesh Chambers of Commerce and Industry (FTAPCCI).", image: a("about/history-2015.jpg") },
  { year: "2016–2017", title: "Celebrating a Century", text: "FTCCI marked 100 years of supporting trade and industry, with its centenary celebration held in December 2016.", image: a("about/history-2016-2017.jpg") },
  { year: "2018", title: "Expanding Industry Representation", text: "FTCCI continued its role in representing businesses and connecting industry with government and policymakers.", image: a("about/history-2018.jpg") },
  { year: "2019", title: "A New Identity for Telangana", text: "On 2 April 2019, the Federation adopted the name Federation of Telangana Chambers of Commerce and Industry (FTCCI), strengthening its focus on Telangana’s economic development.", image: a("about/history-2019.jpg") },
  { year: "2020", title: "Supporting Business Through Uncertainty", text: "FTCCI continued sharing government notifications and compliance updates to help businesses navigate the COVID-19 period.", image: a("about/history-2020.jpg") },
  { year: "2021", title: "Strengthening Industry Support", text: "FTCCI continued providing industry updates, policy information and business resources during the economic recovery.", image: a("about/history-2021.jpg") },
  { year: "2022", title: "Driving MSME Development", text: "FTCCI collaborated with MSME authorities on awareness programmes supporting cluster development and the competitiveness of micro and small enterprises.", image: a("about/history-2022.jpg") },
  { year: "2023", title: "Showcasing Industrial Innovation", text: "FTCCI organised the Industrial Innovation & Technology Expo (IITEX 2023), bringing together industry, technology and business opportunities.", image: a("about/history-2023.jpg") },
  { year: "2024", title: "Building Skills for Global Trade", text: "FTCCI expanded export-import training initiatives, helping entrepreneurs and businesses strengthen their international trade capabilities.", image: a("about/history-2024.jpg") },
  { year: "2025", title: "Advancing Industrial Innovation", text: "FTCCI hosted the second edition of IITEX, connecting manufacturers, innovators and industry leaders through exhibitions and business networking.", image: a("about/history-2025.jpg") },
  { year: "2026", title: "Recognising Excellence and Enabling Growth", text: "FTCCI continued supporting Telangana’s industry through its Excellence Awards, MSME initiatives and programmes focused on sustainable industrial growth.", image: a("about/history-2026.jpg") },
];

export const vision = {
  title: "Our Vision",
  text: "Be the voice of Industry, Commerce and Trade, foster healthy & pro-business environment, aim on issue advocacy while nurturing sustainable industrial development.",
};
export const mission = {
  title: "Our Mission",
  text: "To be the vibrant apex federation and voice of business, shaping policy, strengthening business–government coordination, and driving economic growth in Telangana and Andhra Pradesh.",
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
