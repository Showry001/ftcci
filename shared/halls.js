// Halls and tariff from the FTCCI halls flyer (w.e.f. 15 July 2026). Amounts in rupees, plus GST.
// Shared by the public site (tariff cards and table) and the API (which halls a booking may name).
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

// Hall Requisition Form (Figma "hall booking form", steps 1–4), in the form's order
export const bookingHalls = [1, 2, 0, 3, 4, 5, 6, 7].map((i) => halls[i]);
