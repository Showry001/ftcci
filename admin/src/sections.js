// The kinds of website submissions staff handle here, in sidebar order.
const icon = (name) => `${import.meta.env.BASE_URL}icons/${name}.svg`;

export const sections = [
  { slug: "hall-booking", type: "hall_booking", form: "hallBooking", label: "Hall Bookings", icon: icon("nav-home"), title: "Hall Bookings", intro: "Hall requisition requests sent from the website. Check availability, contact the requester, then mark the request." },
  { slug: "membership", type: "membership", form: "membership", label: "Membership", icon: icon("nav-users"), title: "Membership Applications", intro: "Online membership applications. The membership desk collects the signed form, documents and fees." },
  { slug: "event-interest", type: "event_interest", form: "eventInterest", label: "Event Interest", icon: icon("nav-calendar"), title: "Event Interest", intro: "People who registered interest in an event on the website." },
  { slug: "contact", type: "contact", form: "contact", label: "Contact Messages", icon: icon("nav-news"), title: "Contact Messages", intro: "Messages sent from the Contact page." },
];

export const sectionBySlug = Object.fromEntries(sections.map((s) => [s.slug, s]));

export const statuses = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];
export const statusLabel = Object.fromEntries(statuses.map((s) => [s.value, s.label]));

export const icons = {
  search: icon("search"),
  chevron: icon("chevron-down"),
  eye: icon("eye"),
  prev: icon("page-prev"),
  next: icon("page-next"),
  calendar: icon("calendar"),
  clock: icon("clock"),
};
