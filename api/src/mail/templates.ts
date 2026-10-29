// Branded emails, each with an HTML body and a plain-text version. Every value from a form is
// escaped before it goes into HTML. Emails to visitors only repeat values picked from fixed lists
// (halls, dates, categories) plus their name, so the forms can't be used to mail arbitrary text.
import { displayValue, forms } from "../../../shared/forms.js";

export type FormName = "hallBooking" | "membership" | "eventInterest" | "contact";
export interface Email {
  subject: string;
  html: string;
  text: string;
}
type Row = [label: string, value: string];
type Values = Record<string, unknown>;

const C = { navy: "#152a5e", gold: "#c8922a", ink: "#1a2744", muted: "#5f6b80", line: "#e5e7eb", page: "#f4f6ff", soft: "#f8f9fc" };
const FONT = "Arial, Helvetica, sans-serif";
const ADDRESS = "Federation House, 11-6-841, Red Hills, Hyderabad 500004, Telangana";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const escLines = (s: string) => esc(s).replace(/\n/g, "<br>");
const oneLine = (s: string, max = 80) => {
  const clean = s.replace(/[\u0000-\u001F\u007F]+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

export const formatIst = (d: Date) =>
  `${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(d)} IST`;
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

interface Layout {
  subject: string;
  preheader: string;
  heading: string;
  paragraphs: string[];
  reference?: string;
  rows?: Row[];
  action?: { label: string; href: string };
  after?: string[];
  footer: string[];
}

function render(l: Layout): Email {
  const p = (t: string) => `<p style="margin:0 0 14px;">${escLines(t)}</p>`;
  const reference = l.reference
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 20px;">
        <tr><td style="background:${C.soft};border-left:4px solid ${C.gold};border-radius:6px;padding:14px 18px;font-family:${FONT};">
          <div style="font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:${C.muted};">Reference number</div>
          <div style="font-size:20px;font-weight:bold;color:${C.navy};letter-spacing:0.02em;">${esc(l.reference)}</div>
        </td></tr>
      </table>`
    : "";
  const rows = l.rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;border-collapse:collapse;font-family:${FONT};font-size:14px;">
        ${l.rows
          .map(
            ([label, value]) => `<tr>
          <td valign="top" style="padding:9px 12px 9px 0;border-bottom:1px solid ${C.line};color:${C.muted};width:38%;">${esc(label)}</td>
          <td valign="top" style="padding:9px 0;border-bottom:1px solid ${C.line};color:${C.ink};">${escLines(value)}</td>
        </tr>`,
          )
          .join("")}
      </table>`
    : "";
  const action = l.action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;"><tr>
        <td style="background:${C.navy};border-radius:8px;">
          <a href="${esc(l.action.href)}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${esc(l.action.label)}</a>
        </td></tr></table>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(l.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(l.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr><td style="background:${C.navy};border-bottom:4px solid ${C.gold};padding:18px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td><img src="cid:ftcci-logo" width="46" height="58" alt="FTCCI emblem" style="display:block;border:0;"></td>
        <td style="padding-left:14px;font-family:${FONT};color:#ffffff;">
          <div style="font-size:19px;font-weight:bold;letter-spacing:0.03em;">FTCCI</div>
          <div style="font-size:12px;line-height:1.4;color:#cdd5ea;">The Federation of Telangana Chambers of Commerce and Industry</div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:28px 28px 12px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.ink};">
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${C.navy};">${esc(l.heading)}</h1>
      ${l.paragraphs.map(p).join("\n")}
      ${reference}
      ${rows}
      ${action}
      ${(l.after ?? []).map(p).join("\n")}
    </td></tr>
    <tr><td style="padding:18px 28px;background:${C.soft};border-top:1px solid ${C.line};font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};">
      ${l.footer.map((t) => `<div>${esc(t)}</div>`).join("")}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>
`;

  const text = [
    "FTCCI – The Federation of Telangana Chambers of Commerce and Industry",
    "",
    l.heading,
    "",
    ...l.paragraphs.flatMap((t) => [t, ""]),
    ...(l.reference ? [`Reference number: ${l.reference}`, ""] : []),
    ...(l.rows?.length ? [...l.rows.map(([k, v]) => `${k}: ${v.includes("\n") ? `\n${v}` : v}`), ""] : []),
    ...(l.action ? [`${l.action.label}: ${l.action.href}`, ""] : []),
    ...(l.after ?? []).flatMap((t) => [t, ""]),
    "--",
    ...l.footer,
  ].join("\n");

  return { subject: oneLine(l.subject, 150), html, text };
}

const staffFooter = ["Sent by the FTCCI website.", ADDRESS];
const visitorFooter = [
  "You are receiving this email because this address was entered on a form at ftcci.in. If that wasn't you, please ignore this email.",
  `FTCCI · ${ADDRESS} · +91 40 2339 5515`,
];

function allRows(form: FormName, values: Values): Row[] {
  return Object.entries(forms[form].fields)
    .map(([field, spec]) => {
      const value = spec.kind === "date" && values[field] ? formatDate(String(values[field])) : displayValue(form, field, values[field]);
      return [spec.label, value] as Row;
    })
    .filter(([, value]) => value !== "");
}

export function staffNotification(form: FormName, reference: string, values: Values, who: { name: string; organisation: string }, receivedAt: Date): Email {
  const title = forms[form].title;
  return render({
    subject: `${title} ${reference} – ${oneLine(who.organisation || who.name, 60)}`,
    preheader: `${title} from ${oneLine(who.name, 60)}`,
    heading: `New ${title.toLowerCase()}`,
    paragraphs: [`This came in through the website on ${formatIst(receivedAt)}. Reply to this email to answer ${who.name} directly.`],
    reference,
    rows: allRows(form, values),
    footer: staffFooter,
  });
}

const desks: Record<FormName, string> = {
  hallBooking: "Hall bookings: operations@ftcci.in · +91 91001 99977",
  membership: "Membership desk: membership@ftcci.in · +91 91001 99978",
  eventInterest: "Events: info@ftcci.in · +91 40 2339 5515",
  contact: "FTCCI: info@ftcci.in · +91 40 2339 5515",
};

export function visitorAcknowledgement(form: FormName, reference: string, values: Values, name: string): Email {
  const v = values as Record<string, any>;
  const content: Record<FormName, { subject: string; intro: string; next: string; rows: Row[] }> = {
    hallBooking: {
      subject: "We've received your hall booking request",
      intro: "Thank you for your hall booking request.",
      next: "This is an enquiry, not a confirmed booking. Our bookings team will check availability and contact you with the charges.",
      rows: [
        ["Halls", v.halls?.join("\n") ?? ""],
        ["Date", v.date ? formatDate(v.date) : ""],
        ["Time", v.from && v.to ? `${v.from} to ${v.to}` : ""],
      ],
    },
    membership: {
      subject: "We've received your membership application",
      intro: "Thank you for applying for FTCCI membership.",
      next: "Our membership desk will contact you about the documents and fees needed to complete your application.",
      rows: [
        ["Membership category", displayValue("membership", "panel", v.panel)],
        ["Membership type", displayValue("membership", "membershipType", v.membershipType) || "Annual"],
      ],
    },
    eventInterest: {
      subject: "We've received your registration of interest",
      intro: "Thank you for registering your interest.",
      next: "Our events team will be in touch with the details.",
      rows: [
        ["Event", String(v.eventTitle ?? "")],
        ["Attendees", String(v.attendees ?? "")],
      ],
    },
    contact: {
      subject: "We've received your message",
      intro: "Thank you for writing to FTCCI.",
      next: "Our team will get back to you shortly.",
      rows: [["Subject", String(v.subject ?? "")]],
    },
  };
  const c = content[form];
  return render({
    subject: `${c.subject} (${reference})`,
    preheader: `Your reference number is ${reference}.`,
    heading: `Thank you, ${oneLine(name, 60)}`,
    paragraphs: [`${c.intro} Please quote the reference number below if you contact us about it.`],
    reference,
    rows: c.rows.filter(([, value]) => value !== ""),
    after: [c.next, desks[form]],
    footer: visitorFooter,
  });
}

export function newsletterConfirmation(link: string): Email {
  return render({
    subject: "Please confirm your FTCCI updates subscription",
    preheader: "One click to confirm your email address.",
    heading: "Please confirm your subscription",
    paragraphs: ["Thank you for signing up for FTCCI updates on events, policy and business opportunities. Please confirm that this is your email address."],
    action: { label: "Confirm subscription", href: link },
    after: ["The link works for 7 days. If you didn't sign up, ignore this email and you won't hear from us."],
    footer: visitorFooter,
  });
}

export function newsletterNotification(s: {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  business: string;
  source: "home" | "footer";
  confirmed_at: Date | null;
}): Email {
  const name = `${s.first_name} ${s.last_name}`.trim();
  return render({
    subject: `New newsletter subscriber – ${oneLine(name || s.email, 60)}`,
    preheader: `${s.email} confirmed their subscription.`,
    heading: "New newsletter subscriber",
    paragraphs: ["Someone confirmed their subscription to FTCCI updates."],
    rows: (
      [
        ["Name", name],
        ["Email", s.email],
        ["Phone", s.phone],
        ["Business / occupation", s.business],
        ["Signed up from", s.source === "home" ? "Home page" : "Footer"],
        ["Confirmed", s.confirmed_at ? formatIst(s.confirmed_at) : ""],
      ] as Row[]
    ).filter(([, value]) => value !== ""),
    footer: staffFooter,
  });
}
