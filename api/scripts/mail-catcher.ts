// Development only: a local SMTP server that accepts every email and saves it to a folder instead of
// delivering it (an .html file to open in a browser and a .txt file with the plain-text version).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { simpleParser } from "mailparser";
import { SMTPServer } from "smtp-server";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "email";

export function startMailCatcher(port: number, dir: string): Promise<SMTPServer> {
  mkdirSync(dir, { recursive: true });
  const server = new SMTPServer({
    authOptional: true,
    disabledCommands: ["STARTTLS"],
    logger: false,
    onAuth: (auth, _session, done) => done(null, { user: auth.username }),
    onData(stream, _session, done) {
      simpleParser(stream)
        .then((mail) => {
          const to = [mail.to].flat().map((a) => a?.text ?? "").join(", ");
          const base = join(dir, `${new Date().toISOString().replace(/[:.]/g, "-")}-${slug(mail.subject ?? "")}`);
          // simpleParser inlines cid: images (the logo) as data URLs, so the HTML opens as sent.
          writeFileSync(`${base}.html`, typeof mail.html === "string" ? mail.html : "");
          writeFileSync(`${base}.txt`, `From: ${mail.from?.text ?? ""}\nTo: ${to}\nReply-To: ${mail.replyTo?.text ?? ""}\nSubject: ${mail.subject ?? ""}\n\n${mail.text ?? ""}`);
          console.log(`[mail] ${to} · ${mail.subject} → ${base}.html`);
          done();
        })
        .catch(done);
    },
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}
