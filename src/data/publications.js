const a = (p) => `/assets/${p}`;
const PDF = "https://www.ftcci.in/source/";

export const publicationsSubNav = [
  { label: "Publications", href: "#publications" },
  { label: "FTCCI Activity Reports", href: "#activity-reports" },
  { label: "FTCCI Annual Reports", href: "#annual-reports" },
  { label: "Research & Publications", href: "#research" },
];

// crop: [image height %, top offset %] inside the 277.6×268.2 cover frame (from Figma). null = cover fit.
export const publicationSections = [
  {
    id: "publications",
    title: "Publications",
    items: [
      { date: "23 Sep 2023", title: "Study Tour on Green TVET in Germany", image: a("pubs/publications-1.png"), crop: [137.56, -5.74], href: `${PDF}Research%20and%20Publications/Study%20Tour%20Report.pdf` },
      { date: "8 Sep 2022", title: "FTCCI Business Delegation to Thailand", image: a("pubs/publications-2.png"), crop: [137.56, -5.74] },
      { date: "7 Nov 2021", title: "Telangana Delegation to EXPO 2020", image: a("pubs/publications-3.png"), crop: [137.56, -5.74], href: `${PDF}Research%20and%20Publications/FTCCI%20Delegation%20to%20EXPO%202020_web.pdf` },
      { date: "10 Feb 2021", title: "Report on Pulses", image: a("pubs/publications-4.png"), crop: [137.56, -5.74], href: `${PDF}Research%20and%20Publications/Report%20on%20Pulses_final_April%2012.pdf` },
    ],
  },
  {
    id: "activity-reports",
    title: "FTCCI Activity Reports",
    items: [
      { date: "2019–20", title: "FTCCI Activity Report 2019–2020", image: a("pubs/activity-2019-20.png"), crop: [136.87, -0.04] },
      { date: "2020–21", title: "FTCCI Activity Report 2020–2021", image: a("pubs/activity-2020-21.png"), crop: [137.56, -4.91] },
      { date: "2021–22", title: "FTCCI Activity Report 2021–2022", image: a("pubs/activity-2021-22.png"), crop: [137.56, -5.74] },
      { date: "2022–23", title: "FTCCI Activity Report 2022–2023", image: a("pubs/activity-2022-23.png"), crop: [137.56, -4.79] },
      { date: "2023–24", title: "FTCCI Activity Report 2023–2024", image: a("pubs/activity-2023-24.png"), crop: [137.56, -4.79] },
    ],
  },
  {
    id: "annual-reports",
    title: "FTCCI Annual Reports",
    items: [
      { date: "2017–18", title: "101st Annual Report 2017–18", image: a("pubs/annual-1.png"), crop: [136.87, -23.92], href: `${PDF}AR2017-18.pdf` },
      { date: "2018–19", title: "102nd Annual Report 2018–19", image: a("pubs/annual-2.png"), crop: [137.56, -4.91] },
      { date: "2019–20", title: "103rd Annual Report 2019–20", image: a("pubs/annual-3.png"), crop: [137.56, -4.04] },
      { date: "2020–21", title: "104th Annual Report 2020–21", image: a("pubs/annual-4.png"), crop: [137.56, -0.06] },
      { date: "2021–22", title: "105th Annual Report 2021–22", image: a("pubs/annual-5.png"), crop: [137.56, -4.79] },
      { date: "2023–24", title: "107th Annual Report 2023–24", image: a("pubs/annual-6.png"), crop: [136.87, -0.04] },
      { date: "2024–25", title: "108th Annual Report 2024–25", image: a("pubs/annual-7.png"), crop: [137.56, -4.91] },
      { date: "2025–26", title: "109th Annual Report 2025–26", image: a("pubs/annual-8.png"), crop: [137.56, -5.74] },
    ],
  },
  {
    id: "research",
    title: "Research and Publications",
    items: [
      { date: "2017–18", title: "Annual Day of FTAPCCI", image: a("pubs/research-1.png"), crop: [136.87, -18.58] },
      { date: "2018–19", title: "Report on Pulses", image: a("pubs/research-2.png"), crop: [137.56, -2.09] },
      { date: "2019–20", title: "Report on Rice Export", image: a("pubs/research-3.png"), crop: [140.28, 0.1] },
      { date: "2020–21", title: "Industry Outlook Post COVID-19", image: a("pubs/research-4.png"), crop: [139, -8.13] },
      { date: "2021–22", title: "TOURISM", image: a("pubs/research-5.png"), crop: [138.08, 0.18] },
      { date: "2023–24", title: "TS-iPASS Report", image: a("pubs/research-6.png"), crop: null },
      { date: "2024–25", title: "Foodprocessingconclave", image: a("pubs/research-7.png"), crop: [136.83, 0.05] },
      { date: "2025–26", title: "Milking Dairy Opportunity", image: a("pubs/research-8.png"), crop: null },
      { date: "2017–18", title: "Industrial Landscape", image: a("pubs/research-9.png"), crop: [144.89, -0.21] },
      { date: "2018–19", title: "Report on Cost of Doing", image: a("pubs/research-10.png"), crop: [142.34, 0.03] },
      { date: "2019–20", title: "Major Achievements of FTCCI", image: a("pubs/research-11.png"), crop: null },
      { date: "2020–21", title: "Report on Best HR Practices", image: a("pubs/research-12.png"), crop: [142.47, 0.04] },
      { date: "2021–22", title: "MSME Report", image: a("pubs/research-13.png"), crop: [141.5, -0.14] },
      { date: "2023–24", title: "Adhiti devo Bhava", image: a("pubs/research-14.png"), crop: null },
    ],
  },
];
