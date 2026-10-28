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
// Members – Managing Committee, from ftcci.in/pages/managing-committee
const panel = (name, rows) => rows.map(([member, company]) => ({ name: member, company, panel: name }));
export const committee = [
  ...panel("Panel A", [
    ["Sri C. V. Anirudh Rao", "CVSV Agritech & Exim Ltd"],
    ["Sri Manoj Kumar Agarwal", "DSL Infrastructure and Space Developers Pvt. Ltd."],
    ["Sri Brij Gopal Asawa", "Suryauday Spinning Mills Pvt Ltd"],
    ["Sri Pankaj Kumar Diwan", "Jeevaka Industries Pvt Ltd"],
    ["Sri Chakravarthi AVPS", "Ecobliss India Private Limited"],
    ["Sri Meela Sanjay", "Sudhakar PVC Product Pvt Ltd"],
    ["Sri Manish Gupta", "Dilip Re-Rolling Pvt Ltd"],
  ]),
  ...panel("Panel B", [
    ["Sri A. Prakash", "The Telangana State Federation of Textile Assn"],
    ["Sri Prakash Chandra Garg", "Capacitors Trade Association"],
    ["Sri Abhishek Tibrewala", "Real Estate Developer Assn."],
    ["Sri Sanjay Kumar Agarwal", "Hotels & Resorts Owners Assn"],
    ["Sri Sushil Kumar Sancheti", "Telangana Spinning & Textile Mills Assn"],
    ["Sri Nakirikanti Ananth", "Telangana Solar Open Access Developers Assn"],
    ["Sri Manish Surana", "Indian Solar Power Producers Associations"],
  ]),
  ...panel("Panel C", [
    ["Sri Naresh Kumar Dasari", "Macro Media Digital Imaging (P) Ltd"],
    ["Sri Musunuri Ramakrishna Prasad", "Macro Media Outdoor Solutions Pvt Ltd"],
    ["CA Sudhir VS", "H N A & CO. LLP"],
    ["Sri Prem Chand Kankaria", "Raj Packaging Industries Ltd"],
    ["Sri Karan Agrawal", "Manaksia Coated Metals & Industries Ltd"],
    ["Sri Siva Prasad KV", "Standard Glass Lining"],
    ["Sri Jitender Kumar Kedia", "Om Shiv Shakti Metals Pvt Ltd"],
  ]),
  ...panel("Panel D", [
    ["CA Naresh Chandra Gelli V", "Chartered Accountant"],
    ["Sri B. Sunil Chandra Reddy", "Sunil Constructions"],
    ["Dr. Tasneem Shariff", "Company Secretary"],
    ["Sri Kripaniwas Sharma", "Laxminiwas & Co"],
    ["Sri Pawan Kumar Bansal", "J.B. Handlooms"],
    ["Sri Ritesh Kumar Naredi", "Yash International"],
    ["Sri J. Nagarajan", "Advocate"],
  ]),
  ...panel("Panel E", [
    ["CA Ritesh Mittal", "Praneta Packaging"],
    ["Sri Mohammed Irshad Ahmed", "Hansa Products"],
    ["Sri Kukkadapu Srinivas", "Solarbull Energy LLP"],
    ["Sri P. Krishna", "Eqic Dies & Moulds Engineers (P) Ltd"],
    ["Sri Vimalesh Gupta", "Vivek Polymers"],
    ["Sri Kamal Jain", "Cargomen Logistics India Pvt Ltd"],
    ["Sri Rohit Mittal", "Sree Industries"],
  ]),
];

// From ftcci.in/pages/ftcci-secretariat (extension numbers on the FTCCI board line).
export const secretariat = [
  { name: "Smt. Mattathammal Veena", role: "Secretary", subjects: ["Overall Supervision", "Membership Development & Chamber Networking"], emails: ["secretary@ftcci.in"], phone: "80085 79623 (Extn 204)" },
  { name: "Smt. T. Sujatha", role: "Sr. Director", subjects: ["Industrial Development", "Human Resources & Industrial Relations", "Energy (Power & Renewable Energy)"], emails: ["sr.director@ftcci.in", "idc@ftcci.in", "hrir@ftcci.in", "energy@ftcci.in"], phone: "80085 79731 (Extn 205)" },
  { name: "Smt. P. Sangeetha", role: "Director", subjects: ["ICT and Startups", "Tourism, Hospitality, Media & Entertainment (MICE) / Events"], emails: ["director@ftcci.in", "ict@ftcci.in"], phone: "80085 79622 (Extn 206)" },
  { name: "Dr. Ankit Bhatnagar", role: "Director", subjects: ["FTCCI Pokarna Skill Centre", "Environmental, Social and Governance (ESG)", "Infrastructure, Real Estate and Smart Cities"], emails: ["directortraining@ftcci.in", "environment@ftcci.in", "infra@ftcci.in"], phone: "Extn 207" },
  { name: "Mr. Lokesh Fatehpuria", role: "Director", subjects: ["Banking, Finance, Insurance & Capital Markets", "International Trade and Business Relations", "Shipping & Logistics"], emails: ["banking@ftcci.in", "logistics@ftcci.in", "capitalmarket@ftcci.in"], phone: "83097 88764 (Extn 212)" },
  { name: "Ms. Kavitha", role: "Sr. Manager (Accounts)", subjects: ["Accounts"], emails: ["accounts@ftcci.in"], phone: "80085 79630 (Extn 223)" },
  { name: "Mr. Firasath Ali Khan", role: "Sr. Manager (CO Section)", subjects: ["Certificate of Origin Section"], emails: ["co@ftcci.in"], phone: "83097 87225 (Extn 224)" },
  { name: "Mr. Rajesh", role: "Sr. Manager (Purchase Dept)", subjects: ["Hall Booking & Maintenance"], emails: ["operations@ftcci.in"], phone: "91001 99977 (Extn 218)" },
  { name: "Ms. Reena Rao", role: "Manager (Skill Center)", subjects: ["Healthcare"], emails: ["healthcare@ftcci.in"], phone: "86884 00897 (Extn 227)" },
  { name: "Mr. S. Mahesh", role: "Dy. Manager", subjects: ["Agro, Food Processing & Rural Development"], emails: ["agro@ftcci.in"], phone: "86884 00903 (Extn 238)" },
  { name: "Ms. S. Sai Ankitha", role: "Dy. Manager", subjects: ["Direct Taxes", "GST and Customs"], emails: ["incometax@ftcci.in", "gstcustoms@ftcci.in"], phone: "040-2339 5515 (Extn 234)" },
  // ftcci.in lists "ladieswing@ftcc.in" (missing an "i"); add the email once FTCCI confirms it.
  { name: "Ms. Vishalakshmi", role: "Asst. Manager", subjects: ["Ladies Wing / Women Empowerment"], emails: [], phone: "91210 00199 (Extn 233)" },
  // ftcci.in lists this desk without a named officer.
  { name: "Corporate Laws Desk", role: "FTCCI Secretariat", subjects: ["Corporate Laws, Insolvency and Bankruptcy Code (IBC) & Alternative Dispute Redressal (ADR)"], emails: ["secretariat@ftcci.in"], phone: "040-2339 5515 (Extn 220)" },
];
// From ftcci.in/pages/past-presidents, most recent first.
export const pastPresidents = [
  { name: "Sri R. Ravi Kumar", company: "Zetatek Technologies Pvt. Ltd.", term: "2025–26" },
  { name: "Dr. Suresh Kumar Singhal", company: "Vijay Iron Foundry Pvt. Ltd.", term: "2024–25" },
  { name: "Sri Meela Jayadev", company: "Sudhakar Polymers Pvt. Ltd.", term: "2023–24" },
  { name: "Sri Anil Agarwal", company: "Jeevaka Industries Pvt. Ltd.", term: "2022–23" },
  { name: "Sri K. Bhasker Reddy", company: "Managing Director, Creamline Dairy Products Ltd.", term: "2021–22" },
  { name: "Sri Ramakanth Inani", company: "Director, Inani Securities Limited", term: "2020–21" },
  { name: "Sri Karunendra S. Jasti", company: "Managing Director, 3D Foamcut Pvt. Ltd.", term: "2019–20" },
  { name: "CA Arun Luharuka", company: "Partner, Luharuka & Associates", term: "2018–19" },
  { name: "Sri Gowra Srinivas", company: "Vice President, Telangana Hire Purchase Association", term: "2017–18" },
  { name: "Sri Ravindra Modi", company: "Managing Director, Hyderabad Food Products Pvt. Ltd.", term: "2016–17" },
  { name: "Sri Anil Reddy Vennam", company: "Technical Director, Nayastrap Private Limited", term: "2015–16" },
  { name: "Sri Shiv Kumar Rungta", company: "The A.P. Plywood Laminate & Glass Dealers Welfare Assn.", term: "2014–15" },
  { name: "Sri Srinivas Ayyadevara", company: "Chartered Accountant", term: "2013–14" },
  { name: "Sri Devendra Surana", company: "Managing Director, Bhagyanagar India Ltd.", term: "2012–13" },
  { name: "Sri V. S. Raju", company: "Advocate", term: "2011–12" },
  { name: "Sri Shekhar Agarwal", company: "Managing Director, Bhagyanagar Polymers Pvt. Ltd.", term: "2010–11" },
  { name: "Sri K. Harishchandra Prasad", company: "Managing Director, Lakshmi Finance & Indl. Corpn. Ltd.", term: "2009–10" },
  { name: "Sri Atluri Subba Rao", company: "Chairman, Nekkanti Sea Foods Ltd.", term: "2007–08" },
  { name: "Sri C. V. Atchut Rao", company: "Managing Director, CVSV Agritech & Exim Limited", term: "2005–06" },
  { name: "Sri O. P. Goenka", company: "Technical Director, Foods Fats & Fertilisers Ltd.", term: "2004–05" },
  { name: "CA Koteshwara Rao SSR", company: "Partner, Brahmayya & Co.", term: "2003–04" },
  { name: "Sri S. Thirumalai", company: "Advisor, VST Industries Ltd.", term: "2001–02" },
  { name: "Er. J. S. Rao", company: "Managing Director, Keerthi Industries Limited", term: "1999–00" },
  { name: "Sri Laxminiwas Sharma", company: "Sr. Partner, Laxminiwas & Jain, Chartered Accountants", term: "1998–99" },
  { name: "Sri N. Prabhakar", company: "Managing Director, Hyderabad Tulaman Private Limited", term: "1997–98" },
  { name: "Sri Narendra Surana", company: "Managing Director, Surana Telecom Ltd.", term: "1996–97" },
  { name: "Sri K. Satyanarayana", company: "Managing Director, Spectra Shares & Scrips Ltd.", term: "1995–96" },
  { name: "Sri M. L. Agarwal", company: "Managing Director, Ankit Packaging Ltd.", term: "1994–95" },
  { name: "Sri A. Krishnamurthy", company: "Chairman, Model Finance Corporation", term: "1991–92" },
  { name: "Sri O. Swaminatha Reddy", company: "Chairman, Sagar Cements Ltd.", term: "1980–81" },
];
