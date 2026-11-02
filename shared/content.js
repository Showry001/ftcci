// Every kind of content staff can edit, and the fields each one has. The API validates against this,
// the admin builds its forms from it, and the public site reads documents shaped by it.
//
// Collections hold many documents (events, news, …). Singles hold one document per page or block.
// Media fields store a media library id; the API turns them into URLs, sizes and alt text.
import { iconSets, socialPlatforms } from "./icons.js";

const text = (label, o = {}) => ({ kind: "text", label, max: 200, ...o });
const para = (label, o = {}) => ({ kind: "text", label, max: 2000, multiline: true, ...o });
const strings = (label, o = {}) => ({ kind: "strings", label, max: 300, maxItems: 40, ...o });
const list = (label, fields, o = {}) => ({ kind: "list", label, fields, maxItems: 200, ...o });
const group = (label, fields) => ({ kind: "group", label, fields });
const image = (label, o = {}) => ({ kind: "image", label, ...o });
const file = (label, o = {}) => ({ kind: "file", label, ...o });
const url = (label, o = {}) => ({ kind: "url", label, ...o });
const icon = (label, set) => ({ kind: "icon", label, options: Object.keys(iconSets[set]), labels: iconSets[set] });
const choice = (label, options, o = {}) => ({ kind: "choice", label, options: Object.keys(options), labels: options, ...o });
const titleText = (label = "Item") => list(label, { title: text("Title", { required: true }), text: para("Text", { max: 600 }) });

export const panels = { a: "Panel A", b: "Panel B", c: "Panel C", d: "Panel D", e: "Panel E" };
export const publicationSections = {
  publications: "Publications",
  activity: "FTCCI Activity Reports",
  annual: "FTCCI Annual Reports",
  research: "Research & Publications",
};
export const articleTags = { News: "News", "Press Release": "Press Release", Announcement: "Announcement" };
export const partnerCategories = { Hospitals: "Hospitals", Diagnostics: "Diagnostics", Pharmacy: "Pharmacy", Restaurant: "Restaurant" };

export const contentTypes = {
  // ---- Collections ----
  event: {
    label: "Events",
    singular: "Event",
    collection: true,
    title: "title",
    fields: {
      title: text("Event title", { required: true }),
      category: text("Category", { max: 40, help: "For example Conference, Expo, AGM" }),
      subtitle: text("Short line under the title", { max: 160 }),
      date: { kind: "date", label: "Date", required: true },
      startTime: { kind: "time", label: "Starts at" },
      endTime: { kind: "time", label: "Ends at" },
      venue: text("Venue", { max: 160 }),
      image: image("Event image / poster", { required: true, help: "Landscape photo, at least 1200 px wide" }),
      intro: para("Introduction", { max: 600 }),
      about: para("About this event", { max: 4000 }),
      expect: strings("What to expect", { maxItems: 12 }),
      registrationUrl: url("Registration link"),
      brochure: file("Brochure (PDF)", { accept: ["pdf"] }),
      featured: { kind: "boolean", label: "Feature on the home page" },
    },
  },
  article: {
    label: "News & Press",
    singular: "Article",
    collection: true,
    title: "title",
    fields: {
      title: text("Headline", { required: true, max: 200 }),
      tag: choice("Type", articleTags, { required: true }),
      date: { kind: "date", label: "Date", required: true, past: true },
      image: image("Cover image", { required: true }),
      excerpt: para("Summary", { max: 400, help: "Shown on cards and in link previews" }),
      body: { kind: "richtext", label: "Full story", max: 60_000 },
      featured: { kind: "boolean", label: "Lead story on the home page" },
    },
  },
  publication: {
    label: "Publications",
    singular: "Publication",
    collection: true,
    title: "title",
    fields: {
      title: text("Title", { required: true }),
      section: choice("Section", publicationSections, { required: true }),
      meta: text("Date or period shown", { required: true, max: 40, help: "For example 23 Sep 2023 or 2019–20" }),
      cover: image("Cover image", { required: true }),
      file: file("PDF", { required: true, accept: ["pdf"] }),
    },
  },
  review: {
    label: "FTCCI Review",
    singular: "Review issue",
    collection: true,
    title: "date",
    fields: {
      date: { kind: "date", label: "Issue date", required: true, past: true },
      file: file("Issue PDF", { required: true, accept: ["pdf"] }),
      cover: image("Cover image", { required: true }),
      summary: para("What this issue covers", { max: 400 }),
    },
  },
  vacancy: {
    label: "Careers",
    singular: "Vacancy",
    collection: true,
    title: "title",
    fields: {
      title: text("Job title", { required: true }),
      department: text("Department", { max: 80 }),
      location: text("Location", { max: 80 }),
      employment: text("Type", { max: 40, help: "For example Full time" }),
      closes: { kind: "date", label: "Apply by" },
      summary: para("About the role", { required: true, max: 2000 }),
      apply: para("How to apply", { required: true, max: 600 }),
    },
  },

  // ---- Singles ----
  hero: {
    label: "Home hero",
    fields: {
      mode: choice("Show", { video: "Video", carousel: "Image carousel" }, { required: true }),
      video: { kind: "video", label: "Video", help: "MP4, MOV or WebM up to 200 MB. It is compressed automatically." },
      poster: image("Poster image", { help: "Shown while the video loads and when it can't play" }),
      slides: list("Carousel images", { image: image("Image", { required: true }) }, { maxItems: 8 }),
      title: text("Heading", { required: true, max: 80 }),
      titleAccent: text("Heading, second line (gold)", { max: 80 }),
      primary: group("Gold button", { label: text("Label", { max: 40 }), href: url("Link") }),
      secondary: group("Navy button", { label: text("Label", { max: 40 }), href: url("Link") }),
    },
  },
  home: {
    label: "Home page",
    fields: {
      kpis: list("Numbers strip", { value: text("Number", { required: true, max: 20 }), label: text("Label", { required: true, max: 60 }) }, { maxItems: 4 }),
      quickActions: list("Quick actions (mobile)", { label: text("Label", { required: true, max: 40 }), icon: icon("Icon", "quickAction"), href: url("Link", { required: true }) }, { maxItems: 4 }),
      whoWeAreImage: image("Who We Are background"),
      whoWeArePhoto: image("Who We Are photo"),
      venueHighlights: strings("Hall highlights", { maxItems: 6 }),
      venueFeatured: image("Featured hall photo"),
      venues: list("Halls strip", { name: text("Hall", { required: true }), detail: text("Capacity", { max: 60 }), image: image("Photo", { required: true }) }, { maxItems: 12 }),
      benefitsImage: image("Benefits background"),
      benefitsPhoto: image("Benefits photo"),
      benefits: list("Membership benefits", { label: text("Label", { required: true, max: 60 }), icon: icon("Icon", "homeBenefit") }, { maxItems: 6 }),
      privilegeCardImage: image("Privilege Card image"),
      formPerks: strings("Stay Connected points", { maxItems: 3, max: 40 }),
    },
  },
  about: {
    label: "About page",
    fields: {
      timeline: list("History", { year: text("Year", { required: true, max: 20 }), title: text("Title", { required: true }), text: para("Text", { max: 600 }), image: image("Photo", { required: true }) }, { maxItems: 40 }),
      vision: group("Vision", { title: text("Title"), text: para("Text", { max: 600 }) }),
      mission: group("Mission", { title: text("Title"), text: para("Text", { max: 600 }) }),
      objectivesImage: image("Objectives image"),
      objectives: titleText("Objectives"),
      officeBearers: list("Office bearers", { name: text("Name", { required: true }), role: text("Role", { required: true }), image: image("Photo", { required: true }) }, { maxItems: 6, help: "Shown left to right; the middle one is highlighted" }),
      committeeImage: image("Managing Committee image"),
      committee: list("Managing Committee", { panel: choice("Panel", panels, { required: true }), name: text("Name", { required: true }), company: text("Company / profession") }),
      secretariat: list("Secretariat", { name: text("Name", { required: true }), role: text("Role", { required: true }), subjects: strings("Subjects", { maxItems: 8 }), emails: strings("Emails", { maxItems: 4, max: 254 }), phone: text("Phone", { max: 60 }) }, { maxItems: 40 }),
      pastPresidents: list("Past presidents", { name: text("Name", { required: true }), company: text("Company"), term: text("Term", { required: true, max: 20 }) }),
    },
  },
  membership: {
    label: "Membership page",
    fields: {
      pillars: titleText("Why join (4 points)"),
      benefitsPhoto: image("Benefits photo"),
      memberBenefits: list("Membership benefits", { title: text("Title", { required: true }), icon: icon("Icon", "memberBenefit"), text: para("Text", { max: 400 }) }, { maxItems: 8 }),
      options: list("Membership options", { panel: choice("Panel", panels, { required: true }), cta: text("Button label", { max: 40 }), icon: icon("Icon", "membershipOption"), text: para("Text", { max: 300 }) }, { maxItems: 5 }),
      steps: titleText("How to apply"),
      panelDocuments: list("Documents per panel", { panel: choice("Panel", panels, { required: true }), title: text("Heading", { required: true }), docs: strings("Documents", { maxItems: 12 }) }, { maxItems: 5 }),
      files: list("Forms & downloads", { title: text("Title", { required: true }), file: file("File", { required: true }) }, { maxItems: 10 }),
      lifeMembership: para("Life membership note", { max: 400 }),
      contacts: list("Membership desk", { email: { kind: "email", label: "Email", required: true }, phone: { kind: "phone", label: "Phone", required: true } }, { maxItems: 4 }),
      experienceImage: image("FTCCI Experience background"),
      experienceStats: list("FTCCI Experience numbers", { value: text("Number", { required: true, max: 20 }), label: text("Label", { required: true, max: 60 }) }, { maxItems: 4 }),
    },
  },
  services: {
    label: "Services page",
    fields: {
      coImage: image("Certificate of Origin image"),
      coBullets: strings("Certificate of Origin points", { maxItems: 6 }),
      coPricing: list("Certificate of Origin charges", { sno: text("S. No.", { max: 10 }), form: text("Form", { max: 20 }), price: text("Price (₹)", { max: 20 }) }, { maxItems: 10 }),
      coContact: list("Certificate of Origin contact & payment", { label: text("Label", { required: true, max: 60 }), value: text("Details", { required: true, max: 300 }), href: url("Link") }, { maxItems: 10 }),
      coFiles: list("Certificate of Origin files", { title: text("Title", { required: true }), file: file("File", { required: true }) }, { maxItems: 8 }),
      liaisonImage: image("Liaison image"),
      liaisonBullets: strings("Liaison points", { maxItems: 6 }),
      helpdeskImage: image("Help Desk image"),
      helpdeskBullets: strings("Help Desk points", { maxItems: 6 }),
      certificationCards: list("Certification of documents", { icon: icon("Icon", "certification"), text: text("Text", { required: true, max: 160 }) }, { maxItems: 6 }),
      expertBullets: strings("Expert Committee points", { maxItems: 8 }),
      expertCommittees: strings("Expert committees", { maxItems: 30 }),
      ceoImage: image("CEO Forum image"),
      ceoBullets: strings("CEO Forum points", { maxItems: 6 }),
      hallsImage: image("Halls image"),
      hallBullets: strings("Halls points", { maxItems: 6 }),
      halls: list("Halls & tariff", {
        name: text("Hall", { required: true }),
        seats: text("Seating", { max: 20, help: "Leave empty for exhibition halls and fill in Area" }),
        area: text("Area", { max: 30 }),
        floor: text("Floor", { max: 20 }),
        deposit: text("Refundable deposit (₹)", { max: 20 }),
        h4: text("Tariff, 4 hours (₹)", { max: 20 }),
        h8: text("Tariff, 8 hours (₹)", { max: 20 }),
      }, { maxItems: 16, help: "Shown in this order on the Services page and in the hall booking form" }),
      hallNotes: strings("Tariff notes", { maxItems: 8 }),
      hallEquipment: list("Equipment charges", { item: text("Item", { required: true }), price: text("Charge (₹)", { required: true, max: 20 }) }, { maxItems: 20 }),
      hallFlyer: file("Halls flyer"),
      hallForm: file("Hall requisition form (PDF)", { accept: ["pdf"] }),
      hallContact: list("Hall booking contact", { label: text("Label", { required: true, max: 40 }), value: text("Details", { required: true, max: 200 }), href: url("Link") }, { maxItems: 6 }),
      downloads: list("Downloads", { title: text("Title", { required: true }), file: file("File", { required: true }) }, { maxItems: 30 }),
    },
  },
  knowledge: {
    label: "Knowledge Centre",
    fields: {
      latestReviewText: para("Latest FTCCI Review description", { max: 400, help: "Used when the latest issue has no summary of its own" }),
      featuredLinks: strings("Links on the Knowledge page", { maxItems: 12, help: "Titles from the useful links below" }),
      linkDirectory: list("Useful links", {
        group: text("Group", { required: true, max: 80 }),
        links: list("Links", { title: text("Name", { required: true }), text: text("Description", { max: 200 }), href: url("Address", { required: true }) }, { maxItems: 60 }),
      }, { maxItems: 30 }),
    },
  },
  media: {
    label: "Media page",
    fields: {
      pressKit: list("Press kit", { title: text("Title", { required: true }), text: text("Description", { max: 200 }), file: file("File", { required: true }) }, { maxItems: 20 }),
    },
  },
  privilege: {
    label: "Privilege Card page",
    fields: {
      registerUrl: url("Registration link", { required: true }),
      benefitsUrl: url("Benefits link", { required: true }),
      companyLoginUrl: url("Company login link", { required: true }),
      employeeLoginUrl: url("Employee login link", { required: true }),
      heroCard: image("Card image"),
      heroFeatures: list("Highlights", { title: text("Title", { required: true }), text: text("Text", { max: 120 }), icon: icon("Icon", "privilegeFeature") }, { maxItems: 3 }),
      advantages: titleText("Healthcare advantage"),
      benefits: list("Benefits", { title: text("Title", { required: true }), category: { kind: "choice", label: "Partners shown", options: ["All partners", ...Object.keys(partnerCategories)] }, icon: icon("Icon", "privilegeBenefit"), text: para("Text", { max: 300 }) }, { maxItems: 4 }),
      steps: titleText("How it works"),
      eligibility: list("Eligibility", { title: text("Title", { required: true }), text: text("Text", { max: 160 }), icon: icon("Icon", "eligibility") }, { maxItems: 3 }),
      partners: list("Partners", { name: text("Name", { required: true }), category: choice("Type", partnerCategories, { required: true }), location: text("Branches", { max: 160 }), logo: image("Logo", { required: true, help: "PNG at twice the size it should appear, e.g. 300 px wide for a 150 px logo" }) }, { maxItems: 300 }),
      faqs: list("FAQs", { q: text("Question", { required: true, max: 200 }), a: para("Answer", { required: true, max: 800 }) }, { maxItems: 30 }),
      contactEmail: { kind: "email", label: "Help email" },
      contactPhones: list("Help phone numbers", { phone: { kind: "phone", label: "Phone", required: true } }, { maxItems: 4 }),
      contactHours: text("Help hours", { max: 60 }),
    },
  },
  careers: {
    label: "Careers page",
    fields: {
      email: { kind: "email", label: "Careers contact email", required: true },
    },
  },
  site: {
    label: "Footer & social links",
    fields: {
      tagline: text("Footer line", { max: 160 }),
      address: para("Address", { max: 300 }),
      phone: { kind: "phone", label: "Phone" },
      email: { kind: "email", label: "Email" },
      social: list("Social media", { platform: choice("Platform", socialPlatforms, { required: true }), href: url("Page address", { required: true }) }, { maxItems: 8 }),
    },
  },
};

export const collections = Object.keys(contentTypes).filter((t) => contentTypes[t].collection);
export const singles = Object.keys(contentTypes).filter((t) => !contentTypes[t].collection);
