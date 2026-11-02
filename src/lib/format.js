// Dates and times as the design shows them. Content stores dates as YYYY-MM-DD and times as HH:MM.
const fmt = (iso, options, locale = "en-US") => new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options }).format(new Date(`${iso}T00:00:00Z`));

/** "9:00 AM" (or "09:00 AM" with pad) */
export function time12(hhmm, pad = false) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const hour = ((h + 11) % 12) + 1;
  return `${pad ? String(hour).padStart(2, "0") : hour}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** "9:00 AM – 5:00 PM", or just the start time */
export const timeRange = (start, end, pad = false) => [time12(start, pad), time12(end, pad)].filter(Boolean).join(" – ");

/** "Thursday, August 13, 2026" */
export const longDate = (iso) => fmt(iso, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

/** "13 August 2026" */
export const dayMonthYear = (iso) => fmt(iso, { day: "numeric", month: "long", year: "numeric" }, "en-GB");

/** "Aug 07, 2026" */
export const shortDate = (iso) => fmt(iso, { month: "short", day: "2-digit", year: "numeric" });

/** "13 AUG, 2026" */
export const scheduleDate = (iso) => `${fmt(iso, { day: "2-digit" })} ${fmt(iso, { month: "short" }).toUpperCase()}, ${fmt(iso, { year: "numeric" })}`;

/** "October 28, 2026" */
export const reviewDate = (iso) => fmt(iso, { month: "long", day: "numeric", year: "numeric" });
