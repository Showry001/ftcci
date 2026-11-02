// Checks a content document against its type in shared/content.js. Drafts may be incomplete (required
// fields are only enforced when publishing), but every value must still have the right shape and size.
// Errors are keyed by path, e.g. "timeline.3.title". Fields a type does not define are dropped.
import { contentTypes } from "./content.js";
import { isEmail, isPhone, normalizeBlock, normalizeLine, todayInIndia } from "./forms.js";

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
// Web addresses, links within the site, email and phone links. Nothing that can run script.
const URL_RE = /^(https?:\/\/[^\s<>"'`]+|\/[^\s<>"'`]*|#[\w-]+|mailto:[^\s<>"'`]+|tel:\+?[\d\s()-]+)$/i;
const MEDIA_KINDS = { image: "image", file: "file", video: "video" };

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const empty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

function checkValue(spec, raw, publish, now) {
  const need = () => (publish && spec.required ? { error: `${spec.label} is required.` } : { value: spec.kind === "boolean" ? false : null });
  switch (spec.kind) {
    case "text": {
      if (empty(raw)) return need();
      if (typeof raw !== "string") return { error: `${spec.label} is not valid.` };
      const value = spec.multiline ? normalizeBlock(raw) : normalizeLine(raw);
      if (!value) return need();
      return value.length > spec.max ? { error: `${spec.label} must be ${spec.max} characters or fewer.` } : { value };
    }
    case "richtext": {
      if (empty(raw)) return need();
      if (typeof raw !== "string") return { error: `${spec.label} is not valid.` };
      return raw.length > spec.max ? { error: `${spec.label} is too long.` } : { value: raw };
    }
    case "date": {
      if (empty(raw)) return need();
      const m = typeof raw === "string" && DATE.exec(raw);
      if (!m || new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toISOString().slice(0, 10) !== raw) return { error: "Choose a valid date." };
      if (spec.past && raw > todayInIndia(now)) return { error: `${spec.label} can't be in the future.` };
      return { value: raw };
    }
    case "time":
      if (empty(raw)) return need();
      return typeof raw === "string" && TIME.test(raw) ? { value: raw } : { error: "Choose a valid time." };
    case "url": {
      if (empty(raw)) return need();
      const value = typeof raw === "string" ? raw.trim() : "";
      return value.length <= 500 && URL_RE.test(value) ? { value } : { error: `${spec.label} must be a web address (https://…), a page on this site (/…), mailto: or tel:.` };
    }
    case "email": {
      if (empty(raw)) return need();
      const value = typeof raw === "string" ? raw.trim() : "";
      return isEmail(value) ? { value } : { error: "Enter a valid email address." };
    }
    case "phone": {
      if (empty(raw)) return need();
      const value = typeof raw === "string" ? normalizeLine(raw) : "";
      return isPhone(value) ? { value } : { error: "Enter a valid phone number." };
    }
    case "choice":
    case "icon":
      if (empty(raw)) return need();
      return spec.options.includes(raw) ? { value: raw } : { error: "Choose an option from the list." };
    case "boolean":
      if (raw === undefined || raw === null) return { value: false };
      return typeof raw === "boolean" ? { value: raw } : { error: `${spec.label} is not valid.` };
    case "image":
    case "file":
    case "video":
      if (empty(raw)) return need();
      return Number.isInteger(raw) && raw > 0 ? { value: raw } : { error: `${spec.label} is not valid.` };
    case "strings": {
      if (empty(raw)) return need();
      if (!Array.isArray(raw) || raw.some((s) => typeof s !== "string")) return { error: `${spec.label} is not valid.` };
      const value = raw.map(normalizeLine).filter(Boolean);
      if (value.length > spec.maxItems) return { error: `${spec.label} can have at most ${spec.maxItems} entries.` };
      if (value.some((s) => s.length > spec.max)) return { error: `Each entry in ${spec.label} must be ${spec.max} characters or fewer.` };
      return value.length ? { value } : need();
    }
    default:
      return { error: `${spec.label} is not valid.` };
  }
}

function checkFields(fields, source, path, publish, now, values, errors) {
  for (const [name, spec] of Object.entries(fields)) {
    let raw = isObject(source) ? source[name] : undefined;
    const at = path ? `${path}.${name}` : name;
    if (spec.kind === "group") {
      if (raw !== undefined && raw !== null && !isObject(raw)) {
        errors[at] = `${spec.label} is not valid.`;
        continue;
      }
      values[name] = {};
      checkFields(spec.fields, raw ?? {}, at, publish, now, values[name], errors);
    } else if (spec.kind === "list") {
      if (raw === undefined || raw === null) raw = [];
      if (!Array.isArray(raw) || raw.some((item) => !isObject(item))) {
        errors[at] = `${spec.label} is not valid.`;
        continue;
      }
      if (raw.length > spec.maxItems) {
        errors[at] = `${spec.label} can have at most ${spec.maxItems} entries.`;
        continue;
      }
      if (publish && spec.required && !raw.length) errors[at] = `${spec.label} needs at least one entry.`;
      values[name] = raw.map((item, i) => {
        const out = {};
        checkFields(spec.fields, item, `${at}.${i}`, publish, now, out, errors);
        return out;
      });
    } else {
      const result = checkValue(spec, raw, publish, now);
      if (result.error) errors[at] = result.error;
      else values[name] = result.value;
    }
  }
}

/**
 * @param {keyof typeof contentTypes} type
 * @param {unknown} data
 * @param {{ publish?: boolean, now?: Date }} [options]
 * @returns {{ ok: boolean, values: Record<string, any>, errors: Record<string, string> }}
 */
export function validateContent(type, data, { publish = false, now = new Date() } = {}) {
  const values = {};
  const errors = {};
  checkFields(contentTypes[type].fields, isObject(data) ? data : {}, "", publish, now, values, errors);
  if (type === "hero" && publish) {
    if (values.mode === "video" && !values.video) errors.video ??= "Choose a video, or switch to the image carousel.";
    if (values.mode === "carousel" && !values.slides?.length) errors.slides ??= "Add at least one carousel image.";
  }
  return { ok: Object.keys(errors).length === 0, values, errors };
}

/** Every media reference in a document: [{ id, kind, accept, path }]. */
export function mediaRefs(type, data) {
  const refs = [];
  const walk = (fields, source, path) => {
    for (const [name, spec] of Object.entries(fields)) {
      const value = source?.[name];
      const at = path ? `${path}.${name}` : name;
      if (spec.kind === "group") walk(spec.fields, value, at);
      else if (spec.kind === "list") (value ?? []).forEach((item, i) => walk(spec.fields, item, `${at}.${i}`));
      else if (MEDIA_KINDS[spec.kind] && Number.isInteger(value)) refs.push({ id: value, kind: spec.kind, accept: spec.accept, path: at });
    }
  };
  walk(contentTypes[type].fields, data, "");
  return refs;
}
