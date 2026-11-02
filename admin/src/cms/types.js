// How each content type appears in the admin: wording, list columns and where it shows on the site.
// The fields themselves come from shared/content.js.
import { articleTags, contentTypes, publicationSections } from "../../../shared/content.js";

// The public website, for preview links. In development it runs on its own port; in production it is
// served from the same domain as the admin.
export const SITE_URL = import.meta.env.DEV ? "http://localhost:5173/ftcci" : "/ftcci";

const day = (iso) => (iso ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : "");

export const collectionTypes = {
  event: {
    nav: "Events",
    title: "Events",
    intro: "Manage and publish upcoming and past events. Events move to Past Events after their date; archive one to keep it only in the archive.",
    add: "Add New Event",
    addIntro: "Fill in the event details below. You can save it as a draft and publish it later.",
    path: (doc) => `/events/${doc.slug}`,
    preview: true,
    columns: [
      { label: "Category", value: (d) => d.category, pill: true },
      { label: "Date & Time", value: (d) => [day(d.date), d.startTime].filter(Boolean).join(" · ") },
      { label: "Venue", value: (d) => d.venue },
    ],
    sub: (d) => d.subtitle,
  },
  article: {
    nav: "News & Press",
    title: "News & Press",
    intro: "News stories and press releases. They appear on the home page and the Media page.",
    add: "Publish News",
    addIntro: "Share the latest updates, press releases and announcements.",
    path: (doc) => `/media/news/${doc.slug}`,
    preview: true,
    columns: [
      { label: "Type", value: (d) => articleTags[d.tag] ?? d.tag, pill: true },
      { label: "Date", value: (d) => day(d.date) },
    ],
    sub: (d) => d.excerpt,
  },
  publication: {
    nav: "Publications",
    title: "Publications",
    intro: "Reports and studies on the Publications page. Use the arrows to change the order they appear in.",
    add: "Upload Publication",
    addIntro: "Add and manage FTCCI publications, reports and downloads.",
    path: () => "/knowledge/publications",
    orderable: true,
    columns: [
      { label: "Section", value: (d) => publicationSections[d.section], pill: true },
      { label: "Shown as", value: (d) => d.meta },
    ],
  },
  review: {
    nav: "FTCCI Review",
    title: "FTCCI Review",
    intro: "Weekly issues of the FTCCI Review. Add each new issue with its PDF and cover.",
    add: "Add Review Issue",
    addIntro: "Upload the issue PDF and its cover. Publish it to put it on the Knowledge Centre.",
    path: () => "/knowledge/ftcci-review",
    columns: [{ label: "Issue date", value: (d) => day(d.date) }],
  },
  vacancy: {
    nav: "Careers",
    title: "Careers",
    intro: "Open positions shown on the Careers page. Archive a vacancy once it is filled.",
    add: "Add Vacancy",
    addIntro: "Describe the role and how to apply.",
    path: () => "/careers",
    orderable: true,
    columns: [
      { label: "Location", value: (d) => d.location },
      { label: "Apply by", value: (d) => day(d.closes) },
    ],
  },
};

// Page blocks, in the order staff see them.
export const pageTypes = {
  hero: {
    path: "/",
    intro: "The video or image carousel at the top of the home page, with its heading and buttons.",
    // Only the fields for the chosen kind of hero are shown.
    hidden: (d) => (d.mode === "carousel" ? ["video", "poster"] : d.mode === "video" ? ["slides"] : []),
  },
  home: { path: "/", intro: "Numbers, halls, benefits and photos on the home page." },
  about: { path: "/about", intro: "History, vision, objectives, office bearers, committee, secretariat and past presidents." },
  membership: { path: "/membership", intro: "Why join, benefits, options, how to apply, documents and contacts." },
  services: { path: "/services", intro: "Service details, hall tariff (also used by the booking form) and downloads." },
  knowledge: { path: "/knowledge", intro: "The useful links directory and the FTCCI Review description." },
  media: { path: "/media", intro: "Files in the press kit." },
  privilege: { path: "/privilege-card", intro: "Benefits, partners and FAQs of the Privilege Card page." },
  careers: { path: "/careers", intro: "The contact address on the Careers page. Vacancies are under Careers." },
  site: { path: "/", intro: "Footer text, contact details and social media links on every page." },
};

// Media library tabs: files used by these content types (Figma "Manage Media", 2538:44446).
export const mediaTabs = [
  { label: "All files", used: "" },
  { label: "Homepage", used: "hero,home,site" },
  { label: "About", used: "about" },
  { label: "Membership", used: "membership" },
  { label: "Services", used: "services" },
  { label: "Events", used: "event" },
  { label: "Knowledge", used: "knowledge,publication,review" },
  { label: "Media", used: "media,article" },
  { label: "Privilege Card", used: "privilege" },
  { label: "Not used", used: "none" },
];

// How a document's state reads in lists and on the editor. A draft with a publish time is "Scheduled".
export function stateOf(doc) {
  if (doc.status === "draft" && (doc.publish_at ?? doc.publishAt)) return { tone: "blue", label: "Scheduled" };
  if (doc.status === "published") return { tone: "green", label: "Published" };
  if (doc.status === "archived") return { tone: "grey", label: "Archived" };
  return { tone: "orange", label: "Draft" };
}

export const typeLabel = (type) => collectionTypes[type]?.title ?? contentTypes[type]?.label ?? type;
export const singular = (type) => contentTypes[type]?.singular ?? contentTypes[type]?.label ?? type;
