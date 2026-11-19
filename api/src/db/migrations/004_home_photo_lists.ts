import { type Kysely, sql } from "kysely";

// The home page's Who We Are and Member Benefits photos became lists, shown one after another as a
// slow fade. Each existing photo becomes the first item of its list, in the draft, the published copy
// and the saved versions, so nothing on the site changes until staff add more photos.
const renames = [
  ["whoWeArePhoto", "whoWeArePhotos"],
  ["benefitsPhoto", "benefitsPhotos"],
] as const;

const columns = [
  ["documents", "data"],
  ["documents", "published_data"],
  ["document_versions", "data"],
] as const;

// Only the home document's rows; the key names are fixed above, never user input.
const homeRows = (table: string) =>
  table === "documents"
    ? "type = 'home' and slug is null"
    : "document_id in (select id from documents where type = 'home' and slug is null)";

export async function up(db: Kysely<any>): Promise<void> {
  for (const [from, to] of renames) {
    for (const [table, column] of columns) {
      await sql
        .raw(
          `update ${table} set ${column} = (${column} - '${from}') || jsonb_build_object('${to}',
            case when jsonb_typeof(${column} -> '${from}') = 'number'
              then jsonb_build_array(jsonb_build_object('image', ${column} -> '${from}'))
              else '[]'::jsonb end)
          where ${homeRows(table)} and ${column} ? '${from}'`,
        )
        .execute(db);
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const [from, to] of renames) {
    for (const [table, column] of columns) {
      await sql
        .raw(
          `update ${table} set ${column} = (${column} - '${to}') || jsonb_build_object('${from}', ${column} -> '${to}' -> 0 -> 'image')
          where ${homeRows(table)} and ${column} ? '${to}'`,
        )
        .execute(db);
    }
  }
}
