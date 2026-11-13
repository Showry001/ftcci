// `npm run admin:create -- --email you@ftcci.in --name "Your Name"`: creates the first Super Admin.
// It works once: when an active Super Admin exists, add staff from the admin instead. There are no
// default accounts or passwords. A password can be typed now (it isn't shown or saved in shell history)
// or left empty, in which case the person signs in with a code sent to their email.
import { parseArgs } from "node:util";
import { isEmail } from "../../shared/forms.js";
import { ConfigError, loadConfig } from "../src/config.ts";
import { createDb, migrate } from "../src/db/index.ts";
import { normalEmail, setPassword } from "../src/staff/accounts.ts";
import { record } from "../src/staff/audit.ts";
import { passwordProblem } from "../src/staff/passwords.ts";

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

let config;
try {
  config = loadConfig();
} catch (err) {
  fail(err instanceof ConfigError ? err.message : String(err));
}

const { values } = parseArgs({ options: { email: { type: "string" }, name: { type: "string" } } });
const email = normalEmail(values.email ?? "");
const name = (values.name ?? "").replace(/\s+/g, " ").trim();
const usage = 'Usage: npm run admin:create -- --email you@ftcci.in --name "Your Name"';
if (!values.email || !values.name) fail(usage);
if (!isEmail(email)) fail(`"${values.email}" isn't a complete email address. Use your own, like name@ftcci.in.\n${usage}`);
if (!name || name.length > 120) fail(`Give your name in quotes, up to 120 characters.\n${usage}`);

/** Reads a line from the terminal without showing what is typed. */
function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    let value = "";
    const finish = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write("\n");
      resolve(value);
    };
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") return finish();
        if (ch === "\u0003") {
          stdin.setRawMode(false);
          process.stdout.write("\n");
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else if (ch >= " ") value += ch;
      }
    };
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.on("data", onData);
  });
}

const db = createDb(config!.databaseUrl);
try {
  await migrate(db);
  const existing = await db.selectFrom("staff_users").select("id").where("role", "=", "super_admin").where("disabled_at", "is", null).executeTakeFirst();
  if (existing) fail("A Super Admin already exists. Add more staff from the admin (Staff accounts).");
  const taken = await db.selectFrom("staff_users").select("id").where("email", "=", email).executeTakeFirst();
  if (taken) fail("There is already an account for this email.");

  let password = "";
  if (process.stdin.isTTY) {
    for (;;) {
      password = await askHidden("Password (at least 12 characters; leave empty to sign in with emailed codes): ");
      if (!password) break;
      const problem = passwordProblem(password, email);
      if (problem) {
        console.log(problem);
        continue;
      }
      if ((await askHidden("Type the password again: ")) === password) break;
      console.log("The two passwords don't match. Try again.");
    }
  }

  const user = await db.insertInto("staff_users").values({ email, name, role: "super_admin" }).returningAll().executeTakeFirstOrThrow();
  if (password) await setPassword(db, user.id, password);
  await record(db, { action: "staff.created", target: { type: "staff", id: user.id }, actor: "Setup command", summary: `Created the first Super Admin, ${name} <${email}>` });
  console.log(`Created Super Admin ${name} <${email}>. Sign in at ${config!.staff.adminUrl}/sign-in${password ? "" : " with a code sent to this email"}.`);
} finally {
  await db.destroy();
}
