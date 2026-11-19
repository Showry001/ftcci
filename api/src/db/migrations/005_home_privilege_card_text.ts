import { type Kysely, sql } from "kysely";

// The home page's Privilege Card heading, text and buttons became editable in the page editor. Until now
// they were fixed in the code, so this copies that same wording into the home document (draft, live
// copy and saved versions), where staff can change it.
const fields = {
  privilegeCard: {
    eyebrow: "Exclusive Benefits",
    title: "FTCCI Privilege Card",
    text: "Enjoy exclusive savings and benefits across healthcare, diagnostics, pharmacy, wellness, dining and lifestyle services through FTCCI's growing partner network.",
  },
  privilegeCardPrimary: { label: "Apply Now", href: "/privilege-card" },
  privilegeCardSecondary: { label: "Know More", href: "/privilege-card#benefits" },
};

const columns = [
  ["documents", "data"],
  ["documents", "published_data"],
  ["document_versions", "data"],
] as const;

const homeRows = (table: string) =>
  table === "documents"
    ? "type = 'home' and slug is null"
    : "document_id in (select id from documents where type = 'home' and slug is null)";

export async function up(db: Kysely<any>): Promise<void> {
  const value = JSON.stringify(fields);
  for (const [table, column] of columns) {
    await sql`update ${sql.raw(table)} set ${sql.raw(column)} = ${value}::jsonb || ${sql.raw(column)}
      where ${sql.raw(homeRows(table))} and ${sql.raw(column)} is not null and not (${sql.raw(column)} ? 'privilegeCard')`.execute(db);
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const [table, column] of columns) {
    await sql`update ${sql.raw(table)} set ${sql.raw(column)} = ${sql.raw(column)} - 'privilegeCard' - 'privilegeCardPrimary' - 'privilegeCardSecondary'
      where ${sql.raw(homeRows(table))} and ${sql.raw(column)} ? 'privilegeCard'`.execute(db);
  }
}
