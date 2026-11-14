// The website pages staff edit in the visual page editor, and the parts ("sections") of each, in the
// order they appear on the page. Each section edits some fields of one content document (shared/content.js).
// The website marks the matching element with data-edit="<section id>", so clicking it in the editor's
// preview opens that section. Sections with `link` are lists managed elsewhere in the admin.
import { contentTypes } from "./content.js";

const all = (doc) => Object.keys(contentTypes[doc].fields);
const section = (doc, key, label, fields, extra = {}) => ({ id: `${doc}.${key}`, doc, label, fields, ...extra });
const link = (key, label, to, note) => ({ id: `link.${key}`, label, link: to, note });

const footer = section("site", "footer", "Footer (every page)", all("site"), {
  note: "The footer is the same on every page, so changes here show everywhere.",
});

export const pageViews = {
  home: {
    label: "Home page",
    path: "/",
    sections: [
      section("hero", "hero", "Hero: video or carousel", all("hero"), {
        // Only the fields for the chosen kind of hero are shown.
        hidden: (d) => (d.mode === "carousel" ? ["video", "poster"] : d.mode === "video" ? ["slides"] : []),
      }),
      section("home", "stayConnected", "Stay Connected", ["formPerks"], { note: "The sign-up form itself is fixed; these are the points beside it." }),
      section("home", "kpis", "Numbers", ["kpis"]),
      section("home", "whoWeAre", "Who We Are", ["whoWeAreImage", "whoWeArePhoto"]),
      section("home", "quickActions", "Quick actions (phones)", ["quickActions"], { note: "Shown on phones only. Switch the preview to Phone to see it." }),
      section("about", "officeBearers", "Leadership (office bearers)", ["officeBearers"], { note: "The same people appear on the About page." }),
      link("event", "Upcoming events", "/content/event", "Events are added and edited under Events."),
      section("home", "halls", "Halls", ["venueHighlights", "venueFeatured", "venues"]),
      link("article", "News", "/content/article", "News stories are added and edited under News & Press."),
      section("home", "benefits", "Membership benefits", ["benefitsImage", "benefitsPhoto", "benefits"]),
      section("home", "privilegeCard", "Privilege Card", ["privilegeCardImage"]),
      footer,
    ],
  },
  about: {
    label: "About page",
    path: "/about",
    sections: [
      section("about", "history", "History", ["timeline"]),
      section("about", "vision", "Vision & Mission", ["vision", "mission"]),
      section("about", "objectives", "Objectives", ["objectivesImage", "objectives"]),
      section("about", "officeBearers", "Office bearers", ["officeBearers"], { note: "The same people appear on the home page." }),
      section("about", "committee", "Managing Committee", ["committeeImage", "committee"]),
      section("about", "secretariat", "Secretariat", ["secretariat"]),
      section("about", "pastPresidents", "Past presidents", ["pastPresidents"]),
      footer,
    ],
  },
  membership: {
    label: "Membership page",
    path: "/membership",
    sections: [
      section("membership", "why", "Why join", ["pillars"]),
      section("membership", "benefits", "Membership benefits", ["benefitsPhoto", "memberBenefits"]),
      section("membership", "options", "Membership options", ["options"]),
      section("membership", "apply", "How to apply", ["steps"]),
      section("membership", "documents", "Documents, forms & desk", ["panelDocuments", "files", "lifeMembership", "contacts"]),
      section("membership", "experience", "FTCCI Experience", ["experienceImage", "experienceStats"]),
      footer,
    ],
  },
  services: {
    label: "Services page",
    path: "/services",
    sections: [
      section("services", "co", "Certificate of Origin", ["coImage", "coBullets", "coPricing", "coContact", "coFiles"]),
      section("services", "liaison", "Liaison with bodies", ["liaisonImage", "liaisonBullets"]),
      section("services", "helpdesk", "Help Desk", ["helpdeskImage", "helpdeskBullets"]),
      section("services", "certification", "Certification of documents", ["certificationCards"]),
      section("services", "expert", "Expert committees", ["expertBullets", "expertCommittees"]),
      section("services", "ceo", "CEO Forum", ["ceoImage", "ceoBullets"]),
      section("services", "halls", "Halls & booking", ["hallsImage", "hallBullets", "halls", "hallNotes", "hallEquipment", "hallFlyer", "hallForm", "hallContact"], {
        note: "The hall list and tariff are also used by the hall booking form.",
      }),
      section("services", "downloads", "Downloads", ["downloads"]),
      footer,
    ],
  },
  knowledge: {
    label: "Knowledge Centre",
    path: "/knowledge",
    sections: [
      section("knowledge", "review", "FTCCI Review", ["latestReviewText"], { note: "Review issues themselves are added under FTCCI Review." }),
      section("knowledge", "featuredLinks", "Useful links shown here", ["featuredLinks"], { note: "Names must match links in the Useful links directory." }),
      link("publication", "Publications", "/content/publication", "Publications are added and edited under Publications."),
      section("knowledge", "linkDirectory", "Useful links directory", ["linkDirectory"], { path: "/knowledge/useful-links" }),
      footer,
    ],
  },
  media: {
    label: "Media page",
    path: "/media",
    sections: [
      link("article", "Media coverage", "/content/article", "News stories are added and edited under News & Press."),
      section("media", "pressKit", "Press kit", ["pressKit"], { path: "/media#press-kit" }),
      footer,
    ],
  },
  privilege: {
    label: "Privilege Card page",
    path: "/privilege-card",
    sections: [
      section("privilege", "hero", "Top of the page", ["heroCard", "heroFeatures", "registerUrl", "benefitsUrl", "companyLoginUrl", "employeeLoginUrl"]),
      section("privilege", "advantages", "Healthcare advantage", ["advantages"]),
      section("privilege", "benefits", "Benefits", ["benefits"]),
      section("privilege", "steps", "How it works", ["steps"]),
      section("privilege", "eligibility", "Eligibility", ["eligibility"]),
      section("privilege", "partners", "Partners", ["partners"]),
      section("privilege", "faqs", "FAQs & help", ["faqs", "contactEmail", "contactPhones", "contactHours"]),
      footer,
    ],
  },
  careers: {
    label: "Careers page",
    path: "/careers",
    sections: [
      section("careers", "contact", "Careers contact", ["email"]),
      link("vacancy", "Vacancies", "/content/vacancy", "Vacancies are added and edited under Careers."),
      footer,
    ],
  },
};

/** The content documents a page shows, in the order they first appear. */
export const viewDocs = (view) => [...new Set(pageViews[view].sections.filter((s) => s.doc).map((s) => s.doc))];

/** The page where a content document is edited (the first page that shows it). */
export const viewForDoc = (doc) => Object.keys(pageViews).find((v) => pageViews[v].sections.some((s) => s.doc === doc && s.id !== "site.footer")) ?? "home";
