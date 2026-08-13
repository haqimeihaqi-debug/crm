import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const CONTACT_STATUSES = ["Lead", "Qualified", "Customer", "Churned"];
const DEAL_STAGES = ["Prospecting", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// --- Dashboard summary ---
app.get("/api/summary", (_req, res) => {
  const contacts = db.prepare("SELECT COUNT(*) AS n FROM contacts").get().n;
  const customers = db
    .prepare("SELECT COUNT(*) AS n FROM contacts WHERE status = 'Customer'")
    .get().n;
  const openDeals = db
    .prepare("SELECT COUNT(*) AS n FROM deals WHERE stage NOT IN ('Closed Won', 'Closed Lost')")
    .get().n;
  const pipelineValue = db
    .prepare("SELECT COALESCE(SUM(value), 0) AS v FROM deals WHERE stage NOT IN ('Closed Lost')")
    .get().v;
  res.json({ contacts, customers, openDeals, pipelineValue });
});

// --- Contacts ---
app.get("/api/contacts", (_req, res) => {
  const rows = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC, id DESC").all();
  res.json(rows);
});

app.get("/api/contacts/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM contacts WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Contact not found" });
  res.json(row);
});

app.post("/api/contacts", (req, res) => {
  const { name, email, company, phone, status } = req.body ?? {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  const safeStatus = CONTACT_STATUSES.includes(status) ? status : "Lead";
  const info = db
    .prepare(
      "INSERT INTO contacts (name, email, company, phone, status) VALUES (?, ?, ?, ?, ?)"
    )
    .run(String(name).trim(), email ?? null, company ?? null, phone ?? null, safeStatus);
  const created = db.prepare("SELECT * FROM contacts WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

app.put("/api/contacts/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM contacts WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Contact not found" });
  const { name, email, company, phone, status } = req.body ?? {};
  const safeStatus = CONTACT_STATUSES.includes(status) ? status : existing.status;
  db.prepare(
    "UPDATE contacts SET name = ?, email = ?, company = ?, phone = ?, status = ? WHERE id = ?"
  ).run(
    name?.trim() ? name.trim() : existing.name,
    email ?? existing.email,
    company ?? existing.company,
    phone ?? existing.phone,
    safeStatus,
    req.params.id
  );
  res.json(db.prepare("SELECT * FROM contacts WHERE id = ?").get(req.params.id));
});

app.delete("/api/contacts/:id", (req, res) => {
  const info = db.prepare("DELETE FROM contacts WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Contact not found" });
  res.status(204).end();
});

// --- Deals ---
app.get("/api/deals", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT d.*, c.name AS contact_name
       FROM deals d
       LEFT JOIN contacts c ON c.id = d.contact_id
       ORDER BY d.created_at DESC, d.id DESC`
    )
    .all();
  res.json(rows);
});

app.post("/api/deals", (req, res) => {
  const { title, value, stage, contact_id } = req.body ?? {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title is required" });
  }
  const safeStage = DEAL_STAGES.includes(stage) ? stage : "Prospecting";
  const info = db
    .prepare("INSERT INTO deals (title, value, stage, contact_id) VALUES (?, ?, ?, ?)")
    .run(String(title).trim(), Number(value) || 0, safeStage, contact_id ?? null);
  const created = db.prepare("SELECT * FROM deals WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

app.put("/api/deals/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM deals WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Deal not found" });
  const { title, value, stage, contact_id } = req.body ?? {};
  const safeStage = DEAL_STAGES.includes(stage) ? stage : existing.stage;
  db.prepare(
    "UPDATE deals SET title = ?, value = ?, stage = ?, contact_id = ? WHERE id = ?"
  ).run(
    title?.trim() ? title.trim() : existing.title,
    value === undefined ? existing.value : Number(value) || 0,
    safeStage,
    contact_id === undefined ? existing.contact_id : contact_id,
    req.params.id
  );
  res.json(db.prepare("SELECT * FROM deals WHERE id = ?").get(req.params.id));
});

app.delete("/api/deals/:id", (req, res) => {
  const info = db.prepare("DELETE FROM deals WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Deal not found" });
  res.status(204).end();
});

// --- Serve built client in production ---
const clientDist = join(__dirname, "..", "..", "client", "dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(join(clientDist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`CRM API listening on http://localhost:${PORT}`);
});
