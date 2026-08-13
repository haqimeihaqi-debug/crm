import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.CRM_DB_PATH || join(dataDir, "crm.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'Lead',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    stage TEXT NOT NULL DEFAULT 'Prospecting',
    contact_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
  );
`);

function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM contacts").get();
  if (count > 0) return;

  const insertContact = db.prepare(
    "INSERT INTO contacts (name, email, company, phone, status) VALUES (?, ?, ?, ?, ?)"
  );
  const seedContacts = [
    ["Ada Lovelace", "ada@analytical.io", "Analytical Engines", "+1 202 555 0101", "Customer"],
    ["Grace Hopper", "grace@navy.mil", "COBOL Systems", "+1 202 555 0114", "Lead"],
    ["Alan Turing", "alan@enigma.uk", "Bletchley Labs", "+44 20 7946 0000", "Qualified"],
    ["Katherine Johnson", "katherine@nasa.gov", "Orbital Dynamics", "+1 757 555 0199", "Customer"],
  ];
  const contactIds = seedContacts.map((c) => insertContact.run(...c).lastInsertRowid);

  const insertDeal = db.prepare(
    "INSERT INTO deals (title, value, stage, contact_id) VALUES (?, ?, ?, ?)"
  );
  insertDeal.run("Enterprise license", 42000, "Negotiation", contactIds[0]);
  insertDeal.run("Pilot program", 8000, "Prospecting", contactIds[1]);
  insertDeal.run("Annual support", 15000, "Proposal", contactIds[2]);
  insertDeal.run("Platform upgrade", 27000, "Closed Won", contactIds[3]);
}

seedIfEmpty();

export default db;
