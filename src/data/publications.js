import { ftcciFile as pdf } from "./files.js";

const a = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

export const publicationsSubNav = [
  { label: "Publications", href: "#publications" },
  { label: "FTCCI Activity Reports", href: "#activity-reports" },
  { label: "FTCCI Annual Reports", href: "#annual-reports" },
  { label: "Research & Publications", href: "#research" },
];

// crop: [image height %, top offset %] inside the 277.6×268.2 cover frame (from Figma). null = cover fit.
// Files and titles from the ftcci.in publications, activity report, annual report and research pages.
export const publicationSections = [
  {
    id: "publications",
    title: "Publications",
    items: [
      { meta: "23 Sep 2023", title: "Study Tour on Green TVET in Germany", image: a("pubs/publications-1.png"), crop: [137.56, -5.74], href: pdf("Research and Publications/Study Tour Report.pdf") },
      { meta: "8 Sep 2022", title: "FTCCI Business Delegation to Thailand", image: a("pubs/publications-2.png"), crop: [137.56, -5.74], href: pdf("in news/Thailand Report.pdf") },
      { meta: "7 Nov 2021", title: "Telangana Delegation to EXPO 2020", image: a("pubs/publications-3.png"), crop: [137.56, -5.74], href: pdf("Research and Publications/FTCCI Delegation to EXPO 2020_web.pdf") },
      { meta: "10 Feb 2021", title: "Report on Pulses", image: a("pubs/publications-4.png"), crop: [137.56, -5.74], href: pdf("Research and Publications/Report on Pulses_final_April 12.pdf") },
    ],
  },
  {
    id: "activity-reports",
    title: "FTCCI", accent: "Activity Reports",
    items: [
      { meta: "2019–20", title: "FTCCI Activity Report 2019–2020", image: a("pubs/activity-2019-20.png"), crop: [136.87, -0.04], href: pdf("Research and Publications/Activity_Report 2019-20.pdf") },
      { meta: "2020–21", title: "FTCCI Activity Report 2020–2021", image: a("pubs/activity-2020-21.png"), crop: [137.56, -4.91], href: pdf("Research and Publications/Activity Report_2020-2021.pdf") },
      { meta: "2021–22", title: "FTCCI Activity Report 2021–2022", image: a("pubs/activity-2021-22.png"), crop: [137.56, -5.74], href: pdf("downloads/Activity Report 2021-22.pdf") },
      { meta: "2022–23", title: "FTCCI Activity Report 2022–2023", image: a("pubs/activity-2022-23.png"), crop: [137.56, -4.79], href: pdf("Research and Publications/Activity Report 2022.pdf") },
      { meta: "2023–24", title: "FTCCI Activity Report 2023–2024", image: a("pubs/activity-2023-24.png"), crop: [137.56, -4.79], href: pdf("downloads/Activity Report 2023-24.pdf") },
    ],
  },
  {
    id: "annual-reports",
    title: "FTCCI", accent: "Annual Reports",
    items: [
      { meta: "2017–18", title: "101st Annual Report 2017–18", image: a("pubs/annual-1.png"), crop: [136.87, -23.92], href: pdf("AR2017-18.pdf") },
      { meta: "2018–19", title: "102nd Annual Report 2018–19", image: a("pubs/annual-2.png"), crop: [137.56, -4.91], href: pdf("documents/Annual_Report_2019.pdf") },
      { meta: "2019–20", title: "103rd Annual Report 2019–20", image: a("pubs/annual-3.png"), crop: [137.56, -4.04], href: pdf("documents/Annual Report 2019-20.pdf") },
      { meta: "2020–21", title: "104th Annual Report 2020–21", image: a("pubs/annual-4.png"), crop: [137.56, -0.06], href: pdf("documents/Annual Report 2020-21.pdf") },
      { meta: "2021–22", title: "105th Annual Report 2021–22", image: a("pubs/annual-5.png"), crop: [137.56, -4.79], href: pdf("documents/105_Annual_Report.pdf") },
      { meta: "2023–24", title: "107th Annual Report 2023–24", image: a("pubs/annual-6.png"), crop: [136.87, -0.04], href: pdf("downloads/AGM 2024/107 Annual Report.pdf") },
      { meta: "2024–25", title: "108th Annual Report 2024–25", image: a("pubs/annual-7.png"), crop: [137.56, -4.91], href: pdf("documents/Annual Report 2024-25.pdf") },
      { meta: "2025–26", title: "109th Annual Report 2025–26", image: a("pubs/annual-8.png"), crop: [137.56, -5.74], href: pdf("documents/FTCCI 109th Annual Report_final.pdf") },
    ],
  },
  {
    id: "research",
    title: "Research and", accent: "Publications",
    items: [
      { meta: "Research report", title: "Annual Day of FTAPCCI in its Centenary Year", image: a("pubs/research-1.png"), crop: [136.87, -18.58], href: pdf("Annual Day of FTAPCCI_Report.pdf") },
      { meta: "Research report", title: "Report on Pulses: Opportunities & Way Forward", image: a("pubs/research-2.png"), crop: [137.56, -2.09], href: pdf("Research and Publications/Report on Pulses_final_April 12.pdf") },
      { meta: "Research report", title: "Rice Exports from Telangana: Opportunities & Way Forward", image: a("pubs/research-3.png"), crop: [140.28, 0.1], href: pdf("Research and Publications/Report on Rice Export.pdf") },
      { meta: "Research report", title: "Industry Outlook Post COVID-19", image: a("pubs/research-4.png"), crop: [139, -8.13], href: pdf("Research and Publications/Industry Outlook Post COVID-19.pdf") },
      { meta: "Research report", title: "Report on Telangana Tourism", image: a("pubs/research-5.png"), crop: [138.08, 0.18], href: pdf("TOURISM.pdf") },
      { meta: "Research report", title: "TS-iPASS and Industrial Growth of Telangana", image: a("pubs/research-6.png"), crop: null, href: pdf("TS-iPASS Report.pdf") },
      { meta: "Research report", title: "Food Processing Industry Conclave 2018", image: a("pubs/research-7.png"), crop: [136.83, 0.05], href: pdf("foodprocessingconclave.pdf") },
      { meta: "Research report", title: "Milking Dairy Opportunities", image: a("pubs/research-8.png"), crop: null, href: pdf("Research and Publications/Milking_Dairy_Opportunity.pdf") },
      { meta: "Research report", title: "Evolution of Indian Industrial Landscape", image: a("pubs/research-9.png"), crop: [144.89, -0.21], href: pdf("Research and Publications/Industial Landscape.pdf") },
      { meta: "Research report", title: "Cost of Doing Business in Telangana", image: a("pubs/research-10.png"), crop: [142.34, 0.03], href: pdf("downloads/Report on Cost of Doing.pdf") },
      { meta: "Research report", title: "Major Achievements of FTCCI", image: a("pubs/research-11.png"), crop: null, href: pdf("downloads/Major Achievements of FTCCI_Booklet.pdf") },
      { meta: "Research report", title: "Report on Organisational HR Practices", image: a("pubs/research-12.png"), crop: [142.47, 0.04], href: pdf("downloads/Report on Best HR Practices.pdf") },
      { meta: "Research report", title: "Current Practices and Challenges of MSMEs", image: a("pubs/research-13.png"), crop: [141.5, -0.14], href: pdf("downloads/MSME Report.pdf") },
      { meta: "Research report", title: "I Do Commit: Atithi Devo Bhava", image: a("pubs/research-14.png"), crop: null, href: pdf("downloads/I DO COMMIT_Booklet.pdf") },
    ],
  },
];
