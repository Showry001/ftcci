// What each public form accepts. The public site, the admin and the API all read this file, so the
// browser and the server apply the same rules. `validate()` trims and normalises input, drops fields
// a form does not define, and returns plain-language messages keyed by field name.
import { halls } from "./halls.js";

export const hallNames = halls.map((h) => h.name);
export const equipmentOptions = [
  "Cordless Mic",
  "LCD Projector",
  "LED TV",
  "Collar Mic",
  "Display at Entrance",
  "Lighting Lamp",
  "Inside Banners",
  "Wifi",
];
export const cateringOptions = ["Snacks & Tea", "Lunch (Veg)", "Lunch (Non-Veg)", "Dinner (Veg)", "Dinner (Non-Veg)"];
export const organisationCategories = ["Manufacturing", "Trading", "Services", "Association", "Government"];
export const contactSubjects = ["General enquiry", "Membership", "Certificate of Origin", "Halls & Booking", "Events", "Media & Press"];

// Membership panels as the Membership page names them; the paper form calls them Panel A–E.
export const membershipPanels = [
  { value: "a", label: "Large Companies" },
  { value: "b", label: "Associations & Societies" },
  { value: "c", label: "Companies" },
  { value: "d", label: "Professionals / Firms" },
  { value: "e", label: "MSMEs" },
];
// From the "Constitution of Business" and "Mainline of Business" boxes on the paper application.
export const constitutions = [
  "Proprietorship",
  "Partnership",
  "HUF",
  "Government",
  "PSU",
  "Private Limited Company",
  "Public Limited Company",
  "LLP",
  "Association / Society",
  "Other",
];
export const businessLines = ["Manufacturing", "Trade", "Services", "IT", "Exports", "Imports"];
export const memberServices = ["Certificate of Origin", "Visa Recommendation Letter"];
export const membershipTypes = ["Annual", "Life"];
export const yesNo = ["yes", "no"];

export const forms = {
  hallBooking: {
    title: "Hall booking request",
    fields: {
      halls: { kind: "choices", label: "Halls", options: hallNames, min: 1, minMessage: "Select at least one hall to continue." },
      date: { kind: "date", label: "Date", required: true },
      from: { kind: "time", label: "From", required: true, requiredMessage: "Choose a start time." },
      to: { kind: "time", label: "To", required: true, requiredMessage: "Choose an end time." },
      purpose: { kind: "text", label: "Purpose of event", max: 500, multiline: true },
      request: { kind: "text", label: "Special request", max: 300 },
      equipment: { kind: "choices", label: "Equipment required", options: equipmentOptions },
      catering: { kind: "choices", label: "Catering / serving", options: cateringOptions },
      category: { kind: "choice", label: "Organisation category", options: organisationCategories },
      company: { kind: "text", label: "Name of the company", required: true, max: 150 },
      address: { kind: "text", label: "Address", max: 300, multiline: true },
      pin: { kind: "pin", label: "PIN" },
      phone: { kind: "phone", label: "Phone" },
      fax: { kind: "phone", label: "Fax" },
      email: { kind: "email", label: "Email", required: true },
      website: { kind: "website", label: "Website" },
      gst: { kind: "gstin", label: "GST number" },
      member: { kind: "choice", label: "FTCCI member", options: yesNo },
      contact: { kind: "name", label: "Contact person", required: true },
      cell: { kind: "phone", label: "Cell" },
      office: { kind: "phone", label: "Office phone" },
      residence: { kind: "phone", label: "Residence phone" },
    },
    check: (v) => (v.from && v.to && v.to <= v.from ? { to: "The end time must be after the start time." } : {}),
  },

  membership: {
    title: "Membership application",
    fields: {
      organisation: { kind: "text", label: "Name of the organisation", required: true, max: 150 },
      constitution: { kind: "choice", label: "Constitution of business", required: true, options: constitutions },
      established: { kind: "year", label: "Year established" },
      panel: {
        kind: "choice",
        label: "Membership category",
        required: true,
        options: membershipPanels.map((p) => p.value),
        labels: Object.fromEntries(membershipPanels.map((p) => [p.value, p.label])),
      },
      membershipType: { kind: "choice", label: "Membership type", options: membershipTypes },
      business: { kind: "choices", label: "Main line of business", options: businessLines, min: 1, minMessage: "Choose at least one line of business." },
      activities: { kind: "text", label: "Business activities", required: true, max: 500, multiline: true },
      address: { kind: "text", label: "Address", required: true, max: 300, multiline: true },
      city: { kind: "text", label: "Town / City", required: true, max: 80 },
      pin: { kind: "pin", label: "PIN", required: true },
      phone: { kind: "phone", label: "Office phone" },
      email: { kind: "email", label: "Organisation email", required: true },
      website: { kind: "website", label: "Website" },
      gst: { kind: "gstin", label: "GST number" },
      regNo: { kind: "text", label: "Company registration number", max: 30, pattern: /^[A-Z0-9][A-Z0-9 /-]*$/i, patternMessage: "Use letters, numbers, spaces, / or - only." },
      iec: { kind: "iec", label: "Import Export Code" },
      services: { kind: "choices", label: "Additional services", options: memberServices },
      repName: { kind: "name", label: "Representative name", required: true },
      repDesignation: { kind: "text", label: "Designation", required: true, max: 80 },
      repEmail: { kind: "email", label: "Representative email", required: true },
      repMobile: { kind: "phone", label: "Mobile", required: true },
      message: { kind: "text", label: "Anything else we should know", max: 500, multiline: true },
    },
  },

  eventInterest: {
    title: "Event registration of interest",
    fields: {
      event: { kind: "slug", label: "Event", required: true },
      eventTitle: { kind: "text", label: "Event title", required: true, max: 200 },
      name: { kind: "name", label: "Full name", required: true },
      email: { kind: "email", label: "Email address", required: true },
      mobile: { kind: "phone", label: "Mobile", required: true },
      organisation: { kind: "text", label: "Organisation", max: 150 },
      designation: { kind: "text", label: "Designation", max: 80 },
      member: { kind: "choice", label: "FTCCI member", options: yesNo },
      attendees: { kind: "count", label: "Number of attendees", required: true, min: 1, max: 10 },
      message: { kind: "text", label: "Message", max: 500, multiline: true },
    },
  },

  contact: {
    title: "Contact message",
    fields: {
      name: { kind: "name", label: "Full name", required: true },
      email: { kind: "email", label: "Email address", required: true },
      phone: { kind: "phone", label: "Phone number" },
      subject: { kind: "choice", label: "Subject", required: true, options: contactSubjects },
      message: { kind: "text", label: "Message", required: true, max: 2000, multiline: true },
      agree: { kind: "accept", label: "Privacy Policy and Terms", message: "Please accept the Privacy Policy and Terms & Conditions." },
    },
  },

  // Home page "Stay Connected" card.
  newsletter: {
    title: "Newsletter sign-up",
    fields: {
      firstName: { kind: "name", label: "First name", required: true },
      lastName: { kind: "name", label: "Last name", required: true },
      phone: { kind: "phone", label: "Phone number", required: true },
      email: { kind: "email", label: "Email address", required: true },
      business: { kind: "text", label: "Business / occupation", max: 150 },
      consent: { kind: "accept", label: "Consent", message: "Please agree to receive updates to continue." },
    },
  },

  // Footer "Stay Informed" box.
  newsletterQuick: {
    title: "Newsletter sign-up",
    fields: {
      email: { kind: "email", label: "Email address", required: true },
    },
  },
};

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g;
const line = (s) => s.replace(CONTROL, "").replace(/\s+/g, " ").trim();
const block = (s) =>
  s.replace(/\r\n?/g, "\n").replace(CONTROL, "").replace(/[^\S\n]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
const compact = (s) => s.replace(CONTROL, "").replace(/\s+/g, "");

const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
// One plain address: no quotes, brackets, commas or spaces, so mail headers can't be bent into several recipients.
const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@(?=.{4,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;
const PHONE = /^\+?[0-9][0-9 ()/-]{4,18}[0-9]$/;
const PIN = /^[1-9][0-9]{5}$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const IEC = /^[A-Z0-9]{10}$/;
const WEBSITE = /^(https?:\/\/)?([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}(:[0-9]{2,5})?(\/[^\s<>"'`]*)?$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

export const isEmail = (s) => typeof s === "string" && s.length <= 254 && EMAIL.test(s);

// Bookings are made in India, so "today" is the calendar date in IST wherever the code runs.
export const todayInIndia = (now = new Date()) => now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const addDays = (iso, days) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};
const BOOKING_WINDOW_DAYS = 730;

const required = (spec) =>
  spec.kind === "choice" || spec.kind === "date" || spec.kind === "time" ? `Choose ${article(spec.label)}.` : `${spec.label} is required.`;
const article = (label) => `${/^[aeiou]/i.test(label) ? "an" : "a"} ${label.toLowerCase()}`;

function checkString(spec, raw, now) {
  if (raw === undefined || raw === null) raw = "";
  if (typeof raw !== "string") return { error: `${spec.label} is not valid.` };
  const max = spec.max ?? 100;
  if (raw.length > max * 4 + 100) return { error: `${spec.label} must be ${max} characters or fewer.` };

  const compacted = ["pin", "gstin", "iec"].includes(spec.kind);
  let value = compacted ? compact(raw) : spec.multiline ? block(raw) : line(raw);
  if (spec.kind === "gstin" || spec.kind === "iec") value = value.toUpperCase();
  if (spec.kind === "slug") value = value.toLowerCase();
  if (!value) return spec.required ? { error: spec.requiredMessage ?? required(spec) } : { value: "" };

  switch (spec.kind) {
    case "email":
      if (value.length > 254 || !EMAIL.test(value)) return { error: "Enter a valid email address, like name@company.com." };
      return { value };
    case "phone": {
      const digits = value.replace(/\D/g, "").length;
      if (!PHONE.test(value) || digits < 6 || digits > 15) return { error: "Enter a valid phone number, using digits, spaces, + or -." };
      return { value };
    }
    case "pin":
      return PIN.test(value) ? { value } : { error: "Enter a 6-digit PIN code." };
    case "gstin":
      return GSTIN.test(value) ? { value } : { error: "Enter a valid 15-character GST number." };
    case "iec":
      return IEC.test(value) ? { value } : { error: "Enter a valid 10-character Import Export Code." };
    case "website":
      return value.length <= 200 && WEBSITE.test(value) ? { value } : { error: "Enter a valid website address, like www.company.com." };
    case "slug":
      return value.length <= 100 && SLUG.test(value) ? { value } : { error: `${spec.label} is not valid.` };
    case "time":
      return TIME.test(value) ? { value } : { error: "Choose a valid time." };
    case "year": {
      const thisYear = Number(todayInIndia(now).slice(0, 4));
      const year = Number(value);
      return /^\d{4}$/.test(value) && year >= 1800 && year <= thisYear ? { value } : { error: `Enter a year between 1800 and ${thisYear}.` };
    }
    case "date": {
      const m = DATE.exec(value);
      const real = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toISOString().slice(0, 10) === value;
      if (!real) return { error: "Choose a valid date." };
      const today = todayInIndia(now);
      if (value < today) return { error: "Choose a date from today onwards." };
      if (value > addDays(today, BOOKING_WINDOW_DAYS)) return { error: "Choose a date within the next two years." };
      return { value };
    }
    case "choice":
      return spec.options.includes(value) ? { value } : { error: "Choose an option from the list." };
    case "name":
      if (value.length > max) return { error: `${spec.label} must be ${max} characters or fewer.` };
      return NAME.test(value) ? { value } : { error: `${spec.label} can use letters, spaces, dots, apostrophes and hyphens only.` };
    default:
      if (value.length > max) return { error: `${spec.label} must be ${max} characters or fewer.` };
      if (spec.pattern && !spec.pattern.test(value)) return { error: spec.patternMessage };
      return { value };
  }
}

function checkField(spec, raw, now) {
  if (spec.kind === "choices") {
    if (raw === undefined || raw === null) raw = [];
    if (!Array.isArray(raw) || raw.some((x) => typeof x !== "string")) return { error: `${spec.label} is not valid.` };
    const value = [...new Set(raw)];
    if (value.some((x) => !spec.options.includes(x))) return { error: "Choose options from the list." };
    if (value.length < (spec.min ?? 0)) return { error: spec.minMessage };
    return { value: spec.options.filter((x) => value.includes(x)) };
  }
  if (spec.kind === "count") {
    const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
    if ((raw === undefined || raw === null || raw === "") && !spec.required) return { value: null };
    if (!Number.isInteger(n) || n < spec.min || n > spec.max) return { error: `${spec.label} must be between ${spec.min} and ${spec.max}.` };
    return { value: n };
  }
  if (spec.kind === "accept") return raw === true ? { value: true } : { error: spec.message };
  return checkString(spec, raw, now);
}

/**
 * @param {keyof typeof forms} formName
 * @param {Record<string, unknown>} input
 * @param {{ fields?: string[], now?: Date }} [options] `fields` limits the check to some fields (one step of a form).
 * @returns {{ ok: boolean, values: Record<string, any>, errors: Record<string, string> }}
 */
export function validate(formName, input, { fields, now = new Date() } = {}) {
  const form = forms[formName];
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const values = {};
  const errors = {};
  for (const [name, spec] of Object.entries(form.fields)) {
    if (fields && !fields.includes(name)) continue;
    const result = checkField(spec, source[name], now);
    if (result.error) errors[name] = result.error;
    else values[name] = result.value;
  }
  if (form.check) {
    for (const [name, message] of Object.entries(form.check(values))) {
      if (!fields || fields.includes(name)) errors[name] ??= message;
    }
  }
  return { ok: Object.keys(errors).length === 0, values, errors };
}

// How a stored value reads in emails and the admin.
export function displayValue(formName, field, value) {
  const spec = forms[formName].fields[field];
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (spec.kind === "accept") return value ? "Yes" : "No";
  if (spec.labels) return spec.labels[value] ?? String(value);
  if (spec.options === yesNo) return value === "yes" ? "Yes" : "No";
  return String(value);
}
